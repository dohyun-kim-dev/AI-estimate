// src/app/ai-estimate/components/EstimateAccordion.tsx
"use client";

import React, { useCallback, useMemo, useState } from "react";
import styled from "styled-components";
import { ProjectEstimate } from "@/app/ai-estimate/types/projectEstimate";
import EstimateAccordionItem from "./EstimateAccordionItem";
import { uploadEstimatePdf } from "@/lib/api/user/userApi";
import { buildFullEstimateData } from "@/hooks/estimate";

const AccordionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

interface EstimateAccordionProps {
  data: ProjectEstimate;          // 초기 전체 견적 데이터
  onItemClick: (item: any) => void;
  chatSessionId: string;          // 채팅 세션 id
  estimateId: string;             // ✅ 서버 업데이트용 id (수정 시 필수)
  userId: string;                 // 회원/게스트 uuid
  title?: string;                 // 없으면 project_name 사용
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

const EstimateAccordion: React.FC<EstimateAccordionProps> = ({
  data,
  onItemClick,
  chatSessionId,
  estimateId,
  userId,
  title,
}) => {
  // 화면에 쓰는 소스 오브 트루스
  const [estimate, setEstimate] = useState<ProjectEstimate>(data);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubItem, setSelectedSubItem] = useState<string | null>(null);

  const handleSubItemSelect = (categoryName: string, subItemId: string) => {
    setSelectedCategory(categoryName);
    setSelectedSubItem(subItemId);
  };

  // 서버 저장 (디바운스) — 바깥에서 최신 est를 직접 넘겨 받음
  const saveToServer = useMemo(
    () =>
      debounce(async (est: ProjectEstimate) => {
        try {
          // 💡 id 없으면 업데이트 못 하므로 여기서 바로 가드
          if (!estimateId) {
            console.warn('[save] estimateId 없음 — 업데이트 생략');
            return;
          }
          if (!chatSessionId || !userId) {
            console.warn("[save] 필수값 누락:", { chatSessionId, estimateId, userId });
            return;
          }
          const dataStr = buildFullEstimateData(est);
          await uploadEstimatePdf(
            chatSessionId,
            title || est.project_name || "견적서",
            userId,
            dataStr,
            estimate.uuid // ✅ 수정이라면 반드시 포함
          );
        } catch (e) {
          console.error("[save] 견적 업데이트 실패:", e);
        }
      }, 700),
    [chatSessionId, estimateId, title, userId]
  );

  // 아이템 is_deleted 토글 (item_id 있으면 우선)
  const toggleDeletedFlag = useCallback(
    (target: { item_id?: string; name: string }, to: boolean) => {
      setEstimate((prev) => {
        const next = deepClone(prev);
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
        // ❗ 상태 저장과 동시에, 이번에 만든 next를 서버로 (스테일 방지)
        saveToServer(next);
        return next;
      });
    },
    [saveToServer]
  );

  // 자식에서 넘어오는 삭제/복구 콜백 (최신 상태를 직접 만드는 toggle 안에서 저장까지 처리)
  const handleItemDelete = useCallback(
    (_localItemId: string, item: { item_id?: string; name: string }) => {
      toggleDeletedFlag({ item_id: item.item_id, name: item.name }, true);
    },
    [toggleDeletedFlag]
  );

  const handleItemRestore = useCallback(
    (_localItemId: string, item: { item_id?: string; name: string }) => {
      toggleDeletedFlag({ item_id: item.item_id, name: item.name }, false);
    },
    [toggleDeletedFlag]
  );

  return (
    <AccordionWrapper>
      {estimate.categories.map((category, index) => (
        <div key={index}>
          {/* depth=1 : 섹션 헤더 */}
          <EstimateAccordionItem
            name={category.category_name}
            depth={1}
            isSelected={selectedCategory === category.category_name}
            onSelect={() => {
              if (selectedCategory === category.category_name) {
                setSelectedCategory(null);
                setSelectedSubItem(null);
              } else {
                setSelectedCategory(category.category_name);
              }
            }}
            // depth=1에서는 하위 섹션 합계를 보여주기 위한 items 구성 (표시용)
            items={category.sub_categories.map((sub) => ({
              name: sub.sub_category_name,
              price: sub.items
                .filter((i) => !i.is_deleted) // 삭제 제외
                .reduce((sum, item) => sum + toNumberLike(item.price), 0)
                .toLocaleString(),
              description: "",
              is_deleted: false,
            })) as any}
            selectedItemId={selectedSubItem}
            onItemSelect={(itemId) => handleSubItemSelect(category.category_name, itemId)}
            chatRoomId={chatSessionId}
            estimateId={estimateId}
          >
            {/* depth=2 : 실제 항목 리스트 (여기서 삭제/복구 콜백 전달) */}
            {category.sub_categories.map((subCategory, subIndex) => (
              <EstimateAccordionItem
                key={subIndex}
                name={subCategory.sub_category_name}
                depth={2}
                isSelected={selectedSubItem === `${category.category_name}-${subIndex}`}
                onSelect={() =>
                  handleSubItemSelect(
                    category.category_name,
                    `${category.category_name}-${subIndex}`
                  )
                }
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
              />
            ))}
          </EstimateAccordionItem>
        </div>
      ))}
    </AccordionWrapper>
  );
};

export default EstimateAccordion;
