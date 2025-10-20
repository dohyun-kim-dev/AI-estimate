import React, { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { ProjectEstimate } from "@/app/ai-estimate/types/projectEstimate";
import EstimateAccordionItem from "./EstimateAccordionItem";
import { patchChatMessages, uploadEstimatePdf } from "@/lib/api/user/userApi";
import { buildFullEstimateData } from "@/hooks/estimate";
import { ChatMessage, useChatStore } from "@/store/chatStore";
import { calculateEstimatedPeriod, updateDesignItemPrices, calculateTotalPages } from "@/utils/estimateCalculator";
import { IoChevronDown, IoChevronUp } from 'react-icons/io5';
import { devLog } from "../../utils/devLogger";
import { useCompanyStore } from '@/store/companyStore';
import { calculateDiscountInfo, isNonDiscountableItem, type DiscountSettings } from '@/utils/discountCalculator';

const AccordionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const DetailsToggleIcon = styled.div`
  margin-top: 4px;
  margin-left: 10px;
`;

const ToggleAllButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.subtleText};
  cursor: pointer;
  padding: 8px 12px;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  opacity: 0.8;
  transition: opacity 0.2s ease;
  
  &:hover {
    opacity: 1;
  }
  
  svg {
    width: 24px;
    height: 24px;
  }
`;

interface EstimateAccordionProps {
  data: ProjectEstimate;          // 초기 전체 견적 데이터
  onItemClick: (item: any) => void;
  chatSessionId?: string;          // 채팅 세션 id
  estimateId?: string;             // ✅ 서버 업데이트용 id (수정 시 필수)
  userId?: string;                 // 회원/게스트 uuid
  title?: string;                 // 없으면 project_name 사용
  onItemDelete?: (itemId: string, updatedItem: any) => void; 
  onItemRestore?: (itemId: string, updatedItem: any) => void; 
  discountRate?: number; // 각 기능별 할인율 적용 (기존 호환성)
  periodValue?: number; // 연장 기간 값 (주, 월, 수량)
  onEstimateChange?: (updatedEstimate: ProjectEstimate) => void; // 견적 변경 콜백
}

// 간단 딥클론 (structuredClone 미지원 대비)
function deepClone<T>(obj: T): T {
  try {
    // @ts-ignore
    if (typeof structuredClone === "function") return structuredClone(obj);
  } catch {}
  return JSON.parse(JSON.stringify(obj));
}

// 디바운스 유틸
function debounce<T extends (...args: any[]) => any>(fn: T, delay = 700) {
  let t: any;
  return (...args: Parameters<T>) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

// 안전한 금액 파싱
function toNumberLike(n: string | number): number {
  if (typeof n === "number") return n;
  if (typeof n === "string") {
    const num = parseInt(n.replace(/,/g, ""), 10);
    return Number.isFinite(num) ? num : 0;
  }
  return 0;
}

// ✅ 스토리지 대신 useChatStore 훅으로 메시지 조회
function findMessageIdForEstimate(estimateId?: string | null, messages?: ChatMessage[]) {
  if (!estimateId || !messages) return null;
  
  try {
    devLog("Looking for estimateId in messages:", estimateId);
    
    // Zustand 상태에서 직접 메시지 찾기
    const hit = messages.find((it: ChatMessage) => {
      devLog("Checking message:", it?.messageId, "estimateId:", it?.estimateId);
      
      // 1. estimateId 필드 확인
      if (it?.estimateId && String(it.estimateId) === String(estimateId)) {
        return true;
      }
      
      // 2. content에서 JSON 문자열의 uuid 확인
      if (it?.content && typeof it.content === 'string') {
        try {
          // <script> 태그에서 JSON 추출
          const scriptMatch = it.content.match(/<script[^>]*id="invoiceData"[^>]*>([\s\S]*?)<\/script>/);
          if (scriptMatch && scriptMatch[1]) {
            const jsonData = JSON.parse(scriptMatch[1]);
            if (jsonData.uuid && String(jsonData.uuid) === String(estimateId)) {
              devLog("Found matching uuid in content:", jsonData.uuid);
              return true;
            }
          }
          
          // 직접 JSON 파싱 시도 (스크립트 태그 없는 경우)
          const jsonMatch = it.content.match(/"uuid"\s*:\s*"([^"]+)"/);
          if (jsonMatch && jsonMatch[1] && String(jsonMatch[1]) === String(estimateId)) {
            devLog("Found matching uuid in content (regex):", jsonMatch[1]);
            return true;
          }
        } catch (e) {
          // JSON 파싱 실패는 무시하고 계속 진행
        }
      }
      
      return false;
    });
    
    devLog("Found message with estimateId:", hit?.messageId);
    return hit?.messageId ?? null;
  } catch (e) {
    console.warn("findMessageIdForEstimate: 오류 발생", e);
    return null;
  }
}
  // 할인 제외 항목명 (2뎁스와 동일하게 유지)
type EstimateItem = {
  name: string;
  price: number | string;
  category?: string;
  tags?: string[];
  fe: string; // 프론트엔드 개발 여부
  be: string; // 백엔드 개발 여부
  page_count: number; // 페이지 수
};

/**
 * 새로운 할인 계산 함수 - FIXED/DYNAMIC 방식 지원
 * @param item - 견적 항목
 * @param periodValue - 연장 기간 값
 * @param discountSettings - 할인 설정
 * @returns 할인 적용된 가격
 */
export const getDiscountedPrice = (item: any, periodValue: number, discountSettings: DiscountSettings) => {
  const base = toNumberLike(item?.price);
  if (!item) return base;
  if (isNonDiscountableItem(item)) return base;
  
  // 연장 기간이 0이면 할인 없음
  if (periodValue === 0) return base;
  
  const discountInfo = calculateDiscountInfo(periodValue, base, discountSettings);
  return base - discountInfo.amount;
};

const EstimateAccordion: React.FC<EstimateAccordionProps> = ({
  data,
  onItemClick,
  estimateId,
  userId,
  title,
  onItemDelete,
  onItemRestore,
  onEstimateChange,
  discountRate,
  periodValue = 0 // 기본값 0
}) => {
  // 화면에 쓰는 소스 오브 트루스
  const [estimate, setEstimate] = useState<ProjectEstimate>(data);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubItem, setSelectedSubItem] = useState<string | null>(null);
  // ✅ useChatStore에서 messages와 chatSessionId 가져오기
  const { messages, chatSessionId, setChatSessionId } = useChatStore();
  // 전체 접기/펼치기 상태 관리
  const [allExpanded, setAllExpanded] = useState<boolean>(false);
  const [accordionStates, setAccordionStates] = useState<{[key: string]: boolean}>({});
  const [isInitialUpdate, setIsInitialUpdate] = useState<boolean>(false);
  
  // 회사 할인 설정 가져오기
  const { companyInfo } = useCompanyStore();
  
  // 할인 설정 계산
  const discountSettings: DiscountSettings = useMemo(() => {
    if (!companyInfo) {
      return {
        checkpointList: [{ checkpoint: 1, discountRate: 1.25 }],
        discountRate: 'WEEK',
        rateRule: 'FIXED'
      };
    }

    return {
      checkpointList: companyInfo.checkpointList || [{ checkpoint: 1, discountRate: 1.25 }],
      discountRate: companyInfo.discountRate || 'WEEK',
      rateRule: companyInfo.rateRule || 'FIXED'
    };
  }, [companyInfo]);

  const handleSubItemSelect = (categoryName: string, subItemId: string) => {
    setSelectedCategory(categoryName);
    setSelectedSubItem(subItemId);
  };

  // 모든 아코디언 접기/펼치기 핸들러
  const handleToggleAll = () => {
    const newAllExpanded = !allExpanded;
    setAllExpanded(newAllExpanded);
    
    // 모든 카테고리와 서브카테고리의 상태 변경
    const newStates: {[key: string]: boolean} = {};
    estimate.categories.forEach((category, categoryIndex) => {
      newStates[`category-${categoryIndex}`] = newAllExpanded;
      category.sub_categories.forEach((_, subIndex) => {
        newStates[`sub-${categoryIndex}-${subIndex}`] = newAllExpanded;
      });
    });
    setAccordionStates(newStates);
  };

useEffect(() => {
  // ✅ URL에서 sessionId 가져와서 Zustand 상태에 저장
  const urlParams = new URLSearchParams(window.location.search);
  const sessionIdFromUrl = urlParams.get('sessionId');

  if (sessionIdFromUrl) {
    setChatSessionId(sessionIdFromUrl);
  }
  // ✅ 스토리지 접근 제거 - Zustand 상태만 사용
}, []);

// 견적 데이터 변경 시 자동으로 화면설계/UI디자인 가격 업데이트 및 서버 저장
useEffect(() => {
  if (!chatSessionId || !userId || isInitialUpdate) return;

  // devLog("견적 데이터 변경 감지, 자동 가격 업데이트 시작...");
  
  // 화면설계/UI디자인 가격 업데이트
  const totalPages = calculateTotalPages(data.categories);
  const updatedEstimate = updateDesignItemPrices(data, totalPages);
  
  // 업데이트된 데이터가 기존과 다른 경우에만 저장
  const hasChanges = JSON.stringify(updatedEstimate) !== JSON.stringify(data);
  
  if (hasChanges) {
    // devLog("가격 업데이트 변경사항 발견, 서버 저장 시작...");
    setEstimate(updatedEstimate);
    
    const effectiveEstimateId = estimateId || updatedEstimate.uuid || data.uuid;
    if (effectiveEstimateId) {
      setIsInitialUpdate(true);
      saveToServer(updatedEstimate, effectiveEstimateId);
      // 1초 후 초기 업데이트 플래그 해제
      setTimeout(() => setIsInitialUpdate(false), 1000);
    }
  }
}, [data, chatSessionId, userId, estimateId]); // data 변경 시 자동 실행

  // 서버 저장 (디바운스) — 바깥에서 최신 est를 직접 넘겨 받음
  const saveToServer = useMemo(
    () =>
      debounce(async (est, effectiveEstimateId) => {
        try {
          devLog("saveToServer 시작:", {
            estimateId: effectiveEstimateId,
            chatSessionId,
            userId,
            estUuid: est.uuid
          });
          // ✅ chatSessionId는 Zustand 상태에서만 관리 (스토리지 접근 제거)
          if (!chatSessionId) {
            devLog("[save] chatSessionId 없음 — 업데이트 생략");
            return;
          }

          // 💡 id 없으면 업데이트 못 하므로 여기서 바로 가드
          if (!effectiveEstimateId) {
            devLog("[save] estimateId 없음 — 업데이트 생략");
            return;
          }

          // ✅ Zustand 상태에서 messageId 조회
          const currentMessages = useChatStore.getState().messages;
          const messageId = findMessageIdForEstimate(effectiveEstimateId, currentMessages);

          devLog("messageId 조회 결과:", {
            effectiveEstimateId,
            messageId,
            chatSessionId,
            userId
          });

          if (!chatSessionId || !userId || !messageId) {
            devLog("[save] 필수값 누락:", { chatSessionId, effectiveEstimateId, userId, messageId });
            return;
          }

          // 이미 업데이트된 데이터를 받았는지 확인 (중복 업데이트 방지)
          const hasDesignPricing = est.categories.some(cat => 
            cat.sub_categories.some(sub => 
              sub.items.some(item => 
                (item.name.includes('화면설계') || item.name.includes('UI/UX디자인') || item.name.includes('스토리보드') || item.name.includes('화면설계(기획)') || item.name.includes('화면설계(스토리보드)')) && 
                item.page_count > 0
              )
            )
          );
          
          let finalEst = est;
          if (!hasDesignPricing) {
            devLog("견적서 업로드 전 가격 업데이트 시작...");
            const totalPages = calculateTotalPages(est.categories);
            finalEst = updateDesignItemPrices(est, totalPages);
            devLog("견적서 가격 업데이트 완료, 데이터 빌드 시작...");
          } else {
            devLog("이미 업데이트된 가격 데이터 사용, 데이터 빌드 시작...");
          }
          
          const dataStr = buildFullEstimateData(finalEst);
          devLog("견적서 데이터 빌드 완료, 업로드 시작...");
          
          // 실제 기능들을 계산한 총 금액 계산 (삭제된 기능 제외)
          let totalAmount = 0;
          if (finalEst && Array.isArray(finalEst.categories)) {
            finalEst.categories.forEach(category => {
              category.sub_categories?.forEach(subCategory => {
                subCategory.items?.forEach(item => {
                  if (!item.is_deleted) {
                    const price = typeof item.price === 'string' 
                      ? parseFloat(item.price.replace(/,/g, '')) 
                      : item.price;
                    totalAmount += (price || 0);
                  }
                });
              });
            });
          }
          
          const uploadResponse = await uploadEstimatePdf(
            chatSessionId,
            title || finalEst.project_name || "견적서",
            userId,
            dataStr,
            effectiveEstimateId, // ✅ 수정이라면 반드시 포함
            undefined, // userInfo
            totalAmount // 총 금액
          );

          if (uploadResponse?.statusCode === 200) {
            devLog("견적서 업로드 성공, 채팅 메시지 업데이트 시작...");
            
            // 견적서 업로드 성공 시, 채팅 메시지도 함께 수정
            const updatedReply = `<script type="application/json" id="invoiceData">${JSON.stringify(finalEst)}</script>`;
            await patchChatMessages(messageId, {
              type: "text",
              value: updatedReply,
            });

            devLog("채팅 메시지 업데이트 완료");

            // 로컬 스토어에도 반영하여 UI가 즉시 갱신되도록 함
            try {
              useChatStore.getState().updateMessageById(messageId, { content: updatedReply });
              devLog("로컬 스토어 업데이트 완료");
            } catch (e) {
              devLog("local updateMessageById failed", e);
            }
          } else {
            devLog("견적서 업로드 실패:", uploadResponse);
          }
        } catch (e) {
          devLog("[save] 견적 업데이트 실패:", e);
        }
      }, 700),
    [chatSessionId, estimateId, title, userId]
  );



  // 아이템 is_deleted 토글 (item_id 있으면 우선)
  const toggleDeletedFlag = useCallback(
    (target: { item_id?: string; name: string }, to: boolean, passedEstimateId?: string) => {
      setEstimate((prev) => {
        const next = deepClone(prev);
        
        // ✅ UUID 보존 - 이전 값이 있으면 반드시 유지
        if (prev.uuid && !next.uuid) {
          next.uuid = prev.uuid;
        }
        
        next.categories.forEach((cat) => {
          cat.sub_categories.forEach((sub) => {
            sub.items.forEach((it) => {
              const hit =
                (target.item_id && it.item_id === target.item_id) ||
                (!target.item_id && it.name === target.name);
              if (hit) it.is_deleted = to;
            });
          });
        });
        
        // ⭐️ 아이템 삭제/복구 후 총 페이지 수 재계산 및 화면설계/UI디자인 가격 업데이트
        devLog("아이템 변경 후 화면설계/UI디자인 가격 재계산 시작...");
        const newTotalPages = calculateTotalPages(next.categories);
        const finalUpdatedEst = updateDesignItemPrices(next, newTotalPages);
        devLog(`페이지 수 변경: ${newTotalPages}페이지 → 화면설계/UI디자인 가격 업데이트 완료`);
        
        // next를 최종 업데이트된 데이터로 교체
        Object.assign(next, finalUpdatedEst);
        
        // ✅ 견적서 ID 찾기 - 우선순위:
        // 1. 전달받은 estimateId
        // 2. props의 estimateId
        // 3. 현재 견적서 데이터의 uuid (next, prev 순)
        // 4. 초기 데이터의 uuid
        // 5. 최후 수단: 스토어에서 estimateId 추출
        let effectiveEstimateId = 
          passedEstimateId || 
          estimateId || 
          next.uuid || 
          prev.uuid || 
          data.uuid;
        
        // ✅ 스토어에서 estimateId 찾기 (최후 수단)
        if (!effectiveEstimateId) {
          try {
            const messages = useChatStore.getState().messages;
            // 마지막 AI 메시지에서 견적서 찾기
            for (let i = messages.length - 1; i >= 0; i--) {
              const msg = messages[i];
              if (msg.role === 'ai' && msg.content && msg.estimateId) {
                effectiveEstimateId = msg.estimateId;
                break;
              }
              // 또는 content에서 직접 추출
              if (msg.role === 'ai' && msg.content) {
                const match = msg.content.match(/"uuid"\s*:\s*"([^"]+)"/);
                if (match && match[1]) {
                  effectiveEstimateId = match[1];
                  break;
                }
              }
            }
          } catch (e) {
            console.warn("스토어에서 estimateId 추출 실패:", e);
          }
        }
        
        devLog("toggleDeletedFlag - 견적서 ID 추적:", {
          target: target.name,
          action: to ? '삭제' : '복구',
          passedEstimateId,
          propEstimateId: estimateId,
          nextUuid: next.uuid,
          prevUuid: prev.uuid,
          dataUuid: data.uuid,
          effectiveEstimateId,
          foundFromStore: !passedEstimateId && !estimateId && !next.uuid && !prev.uuid && !data.uuid && effectiveEstimateId
        });
        
        if (!effectiveEstimateId) {
          console.error("견적서 ID를 찾을 수 없습니다!");
          return prev; // 변경사항 취소
        }
        
        // ✅ 찾은 ID를 next에도 설정하여 다음번에 쉽게 찾을 수 있도록
        if (!next.uuid && effectiveEstimateId) {
          next.uuid = effectiveEstimateId;
        }
        
        saveToServer(next, effectiveEstimateId);
        
        // ✅ 부모 컴포넌트에 변경사항 전파
        if (onEstimateChange) {
          onEstimateChange(next);
        }
        
        return next;
      });
    },
    [saveToServer, estimateId, data.uuid, onEstimateChange]
  );

  // 자식에서 넘어오는 삭제/복구 콜백 (최신 상태를 직접 만드는 toggle 안에서 저장까지 처리)
  const handleItemDelete = useCallback(
    (_localItemId: string, item: { item_id?: string; name: string }) => {
      toggleDeletedFlag({ item_id: item.item_id, name: item.name }, true, estimateId);
    },
    [toggleDeletedFlag, estimateId]
  );

  const handleItemRestore = useCallback(
    (_localItemId: string, item: { item_id?: string; name: string }) => {
      toggleDeletedFlag({ item_id: item.item_id, name: item.name }, false, estimateId);
    },
    [toggleDeletedFlag, estimateId]
  );

  return (
    <AccordionWrapper>
      {/* 전체 모두 접기/펼치기 버튼 */}
     
      
      {estimate.categories.map((category, index) => (
        <div key={index}>
          {/* depth=1 : 섹션 헤더 */}
          <EstimateAccordionItem
            name={category.category_name}
            depth={1}
            isSelected={selectedCategory === category.category_name}
            isOpen={accordionStates[`category-${index}`] || false}
            onSelect={() => {
              const currentState = accordionStates[`category-${index}`] || false;
              setAccordionStates(prev => ({
                ...prev,
                [`category-${index}`]: !currentState
              }));
              
              if (selectedCategory === category.category_name) {
                setSelectedCategory(null);
                setSelectedSubItem(null);
              } else {
                setSelectedCategory(category.category_name);
              }
            }}
            // depth=1에서는 2뎁스에서 props로 전달된 price(실제 표시 금액)만 합산해서 보여줌
            items={category.sub_categories.map((sub) => {
              // 2뎁스에서 실제로 화면에 표시되는 금액을 EstimateAccordionItem에서 계산해서 props로 전달받는다고 가정
              // 여기서는 sub.items의 price(이미 할인/제외 적용된 값)를 단순 합산
              // (실제 구조상 sub.items의 price가 이미 할인/제외 적용된 값이어야 함)
              return {
                name: sub.sub_category_name,
                // sub.items의 각 항목에 할인을 적용한 후 합산
                price: sub.items
                  .filter((i) => !i.is_deleted)
                  .reduce((sum, item) => {
                    // 새로운 할인 계산 방식 사용
                    const discountedPrice = getDiscountedPrice(item, periodValue, discountSettings);
                    return sum + discountedPrice;
                  }, 0)
                  .toLocaleString(),
                description: "",
                is_deleted: false,
              };
            }) as any}
            selectedItemId={selectedSubItem}
            onItemSelect={(itemId) => handleSubItemSelect(category.category_name, itemId)}
            chatRoomId={chatSessionId}
            estimateId={estimateId}
            discountRate={typeof (discountRate) === 'number' ? discountRate : 0}
            periodValue={periodValue}
            discountSettings={discountSettings}
          >
            {/* depth=2 : 실제 항목 리스트 (여기서 삭제/복구 콜백 전달) */}
            {category.sub_categories.map((subCategory, subIndex) => (
              <EstimateAccordionItem
                key={subIndex}
                name={subCategory.sub_category_name}
                depth={2}
                isSelected={selectedSubItem === `${category.category_name}-${subIndex}`}
                isOpen={accordionStates[`sub-${index}-${subIndex}`] || false}
                onSelect={() => {
                  const currentState = accordionStates[`sub-${index}-${subIndex}`] || false;
                  setAccordionStates(prev => ({
                    ...prev,
                    [`sub-${index}-${subIndex}`]: !currentState
                  }));
                  
                  handleSubItemSelect(
                    category.category_name,
                    `${category.category_name}-${subIndex}`
                  );
                }}
                items={subCategory.items.map((item) => ({
                  name: item.name,
                  price: String(item.price),
                  description: item.description,
                  is_deleted: !!item.is_deleted,
                  item_id: item.item_id, // ← 원본 식별자 전달(있으면 매칭 정확)
                })) as any}
                onItemClick={onItemClick}
                onItemDelete={handleItemDelete}   // ✅ 삭제 콜백
                onItemRestore={handleItemRestore} // ✅ 복구 콜백
                chatRoomId={chatSessionId}
                estimateId={estimateId}
                discountRate={typeof (discountRate) === 'number' ? discountRate : 0}
                periodValue={periodValue}
                discountSettings={discountSettings}
              />
            ))}
            
          </EstimateAccordionItem>
        </div>
      ))}
       <ToggleAllButton onClick={handleToggleAll}>
        {allExpanded ? (
          <>
            모두 접기
                  <DetailsToggleIcon><IoChevronUp size={24} /></DetailsToggleIcon>
          </>
        ) : (
          <>
            모두 펼치기
                  <DetailsToggleIcon><IoChevronDown size={24} /></DetailsToggleIcon>
          </>
        )}
      </ToggleAllButton>
    </AccordionWrapper>
  );
};

export default EstimateAccordion;