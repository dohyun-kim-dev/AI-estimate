import React, { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { ProjectEstimate } from "@/app/ai-estimate/types/projectEstimate";
import EstimateAccordionItem from "./EstimateAccordionItem";
import { patchChatMessages, uploadEstimatePdf } from "@/lib/api/user/userApi";
import { buildFullEstimateData } from "@/hooks/estimate";
import { ChatMessage, useChatStore } from "@/store/chatStore";
import { IoChevronDown, IoChevronUp } from 'react-icons/io5';

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
  discountRate?: number; // 각 기능별 할인율 적용
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

function findMessageIdForEstimate(estimateId?: string | null) {
  if (!estimateId) return null;
  try {
    // 로컬스토리지에서 먼저 찾고, 없으면 세션스토리지 확인
    let raw = localStorage.getItem("ai-chat-storage");
    if (!raw) {
      raw = sessionStorage.getItem("ai-chat-storage");
    }
    if (!raw) return null;
    
    // JSON.parse의 결과를 ChatState 타입으로 지정합니다.
    const storageState: { state } = JSON.parse(raw);
    const messages = storageState.state.messages;
    
    console.log("Parsed messages array:", messages);
    console.log("Looking for estimateId:", estimateId);
    
    if (!Array.isArray(messages)) return null;
    
    // 배열을 순회하며 estimateId가 일치하는 메시지 객체를 찾습니다.
    const hit = messages.find((it: ChatMessage) => {
      console.log("Checking message:", it?.messageId, "estimateId:", it?.estimateId);
      
      // 1. 먼저 기존 방식으로 estimateId 필드 확인
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
              console.log("Found matching uuid in content:", jsonData.uuid);
              return true;
            }
          }
          
          // 직접 JSON 파싱 시도 (스크립트 태그 없는 경우)
          const jsonMatch = it.content.match(/"uuid"\s*:\s*"([^"]+)"/);
          if (jsonMatch && jsonMatch[1] && String(jsonMatch[1]) === String(estimateId)) {
            console.log("Found matching uuid in content (regex):", jsonMatch[1]);
            return true;
          }
        } catch (e) {
          // JSON 파싱 실패는 무시하고 계속 진행
        }
      }
      
      return false;
    });
    
    console.log("Found message with estimateId:", hit?.messageId);
    
    // 찾은 메시지 객체에서 messageId를 반환합니다.
    return hit?.messageId ?? null;
  } catch (e) {
    console.warn("findMessageIdForEstimate: 파싱 오류 발생", e);
    return null;
  }
}
  // 할인 제외 항목명 (2뎁스와 동일하게 유지)
type EstimateItem = {
  name: string;
  price: number | string;
  category?: string;
  tags?: string[];
};

// 🔧 1) 정규화: 제로폭 문자까지 제거
const normalize = (s: string) =>
  (s ?? '')
    .normalize('NFKC')
    // 제로폭 문자 제거 (U+200B~U+200D, U+FEFF)
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    // 괄호 안 보조설명 제거
    .replace(/\(.*?\)/g, '')
    // 공백/구두점/슬래시류 제거
    .replace(/[\s\-_./|\\,[\]{}:;'"`~!@#$%^&*+?<>·•]/g, '')
    // uxui를 uiux로 통일
    .toLowerCase()
    .replace(/uxui/g, 'uiux');

// 2) 토큰(동의어/파생어)
const NON_DISCOUNT_TOKENS = [
  '화면설계', '화면디자인', '화면퍼블리싱','설계',
  'uiux디자인', 'uidesign', 'uxdesign', 'guidesign',
  '스토리보드', '와이어프레임', '프로토타입', '프로토타이핑', '시안',
  '퍼블리싱', '퍼블', '마크업', 'markup', '정적코딩', 'htmlcss', 'html코딩', 'css코딩',
  // 기획 파생(안전빵으로 추가)
  '화면기획', '기획설계', '기획',
];

// 3) 정규식: 공백 대신 제로폭 문자까지 허용
const zws = '[\\s\\u200B-\\u200D\\uFEFF]*';

const NON_DISCOUNT_REGEX: RegExp[] = [
  new RegExp(`화면${zws}(설계|디자인|퍼블리싱)`, 'i'),
  new RegExp(`(ui${zws}\\/?${zws}ux|ux${zws}\\/?${zws}ui|uiux|uxui)${zws}(디자인|design)?`, 'i'),
  new RegExp(`(스토리보드|와이어${zws}프레임|프로토타입|프로토타이핑|gui${zws}디자인|시안)`, 'i'),
  new RegExp(`(퍼블리싱|퍼블|마크업|markup|정적${zws}코딩|html${zws}\\/?${zws}css)`, 'i'),
  // 👉 화면 + 기획 조합도 직접 허용
  new RegExp(`화면${zws}(기획)`, 'i'),
  // 👉 기획 단독 및 괄호 포함 패턴
  new RegExp(`기획`, 'i'),
  new RegExp(`화면${zws}설계${zws}\\(${zws}기획${zws}\\)`, 'i'),
];

// 4) 휴리스틱: 화면 + (설계|디자인|퍼블리싱|마크업|기획)
const heuristicScreenDesign = (raw: string) => {
  const clean = raw.replace(/[\u200B-\u200D\uFEFF]/g, '');
  return /화면/i.test(clean) && /(설계|디자인|퍼블리싱|마크업|기획)/i.test(clean);
};

const isNonDiscountableItem = (item: EstimateItem): boolean => {
  if (!item?.name) return false;

  const raw = String(item.name);
  const norm = normalize(raw);

  // 카테고리 기반(있으면 바로 제외)
  if (item?.category && /(디자인|퍼블리싱|기획|화면)/i.test(item.category)) {
    return true;
  }

  // 태그 기반
  if (Array.isArray(item?.tags) && item.tags.some(Boolean)) {
    for (const t of item.tags) {
      const tRaw = String(t ?? '');
      const tNorm = normalize(tRaw);
      if (NON_DISCOUNT_REGEX.some((re) => re.test(tRaw))) return true;
      if (NON_DISCOUNT_TOKENS.some((tok) => tNorm.includes(normalize(tok)))) return true;
    }
  }

  // 원문 정규식 (normalize 전에 먼저 체크)
  if (NON_DISCOUNT_REGEX.some((re) => re.test(raw))) return true;

  // 정규화 토큰 포함
  if (NON_DISCOUNT_TOKENS.some((tok) => norm.includes(normalize(tok)))) return true;

  // 휴리스틱
  if (heuristicScreenDesign(raw)) return true;

  // 추가: 괄호 안에 기획이 포함된 경우 체크
  if (/\([^)]*기획[^)]*\)/i.test(raw)) return true;

  return false;
};

// ===== 기존 시그니처 유지 =====
export const getDiscountedPrice = (item: any, discountRate: number) => {
  const base = toNumberLike(item?.price);
  if (!item) return base;
  if (isNonDiscountableItem(item)) return base;
  return discountRate > 0 ? Math.round(base * (1 - discountRate)) : base;
};

const EstimateAccordion: React.FC<EstimateAccordionProps> = ({
  data,
  onItemClick,
  estimateId,
  userId,
  title,
  onItemDelete,
  onItemRestore,
  discountRate
}) => {
  // 화면에 쓰는 소스 오브 트루스
  const [estimate, setEstimate] = useState<ProjectEstimate>(data);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubItem, setSelectedSubItem] = useState<string | null>(null);
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);
  // 전체 접기/펼치기 상태 관리
  const [allExpanded, setAllExpanded] = useState<boolean>(false);
  const [accordionStates, setAccordionStates] = useState<{[key: string]: boolean}>({});

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
  // ⭐️ URL에서 sessionId 가져오기
  const urlParams = new URLSearchParams(window.location.search);
  const sessionIdFromUrl = urlParams.get('sessionId');

  // ⭐️ 로컬 스토리지 또는 URL에서 sessionId 설정
  if (sessionIdFromUrl) {
    setChatSessionId(sessionIdFromUrl);
    // 필요하다면 로컬 스토리지에 저장
    localStorage.setItem('chatSessionId', sessionIdFromUrl);
  } else {
    // URL에 sessionId가 없는 경우 로컬 스토리지에서 가져옴
    const storedChatSessionId = localStorage.getItem('chatSessionId');
    if (storedChatSessionId) {
      setChatSessionId(storedChatSessionId);
    }
  }
}, []);

  // 서버 저장 (디바운스) — 바깥에서 최신 est를 직접 넘겨 받음
  const saveToServer = useMemo(
    () =>
      debounce(async (est, effectiveEstimateId) => {
        try {
          console.log("saveToServer 시작:", {
            estimateId: effectiveEstimateId,
            chatSessionId,
            userId,
            estUuid: est.uuid
          });
          
          // 💡 id 없으면 업데이트 못 하므로 여기서 바로 가드
          if (!effectiveEstimateId) {
            console.warn("[save] estimateId 없음 — 업데이트 생략");
            return;
          }

          // 항상 최신 messageId를 스토리지에서 조회 (동시에 여러 탭에서 변경될 수 있어서)
          const messageId = findMessageIdForEstimate(effectiveEstimateId);
          
          console.log("messageId 조회 결과:", {
            effectiveEstimateId,
            messageId,
            chatSessionId,
            userId
          });

          if (!chatSessionId || !userId || !messageId) {
            console.warn("[save] 필수값 누락:", { chatSessionId, effectiveEstimateId, userId, messageId });
            return;
          }

          const dataStr = buildFullEstimateData(est);
          console.log("견적서 데이터 빌드 완료, 업로드 시작...");
          
          const uploadResponse = await uploadEstimatePdf(
            chatSessionId,
            title || est.project_name || "견적서",
            userId,
            dataStr,
            effectiveEstimateId // ✅ 수정이라면 반드시 포함
          );

          if (uploadResponse?.statusCode === 200) {
            console.log("견적서 업로드 성공, 채팅 메시지 업데이트 시작...");
            
            // 견적서 업로드 성공 시, 채팅 메시지도 함께 수정
            const updatedReply = `<script type="application/json" id="invoiceData">${JSON.stringify(est)}</script>`;
            await patchChatMessages(messageId, {
              type: "text",
              value: updatedReply,
            });

            console.log("채팅 메시지 업데이트 완료");

            // 로컬 스토어에도 반영하여 UI가 즉시 갱신되도록 함
            try {
              useChatStore.getState().updateMessageById(messageId, { content: updatedReply });
              console.log("로컬 스토어 업데이트 완료");
            } catch (e) {
              console.warn("local updateMessageById failed", e);
            }
          } else {
            console.error("견적서 업로드 실패:", uploadResponse);
          }
        } catch (e) {
          console.error("[save] 견적 업데이트 실패:", e);
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
        
        console.log("toggleDeletedFlag - 견적서 ID 추적:", {
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
        return next;
      });
    },
    [saveToServer, estimateId, data.uuid]
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
                    const discountedPrice = getDiscountedPrice(item, typeof discountRate === 'number' ? discountRate : 0);
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