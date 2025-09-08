// // promptsRemake/discount.ts
// export const discountPrompt = `
// --- [프로모션] 개발 기간 8주 연장 및 20% 할인 (discount_extend_8w_20p) ---
// 1) 안내문:
//   - 'ko': "[프로모션] 개발 기간 연장 및 할인이 적용된 견적입니다."
//   - 'en': "[Promotion] This is an estimate with an extended development period and a discount applied."

// 2) 기간:
//   - new_total_duration = original_invoice.total.duration + 40  # 8주 = 40영업일 기준

// 3) 총액 재계산:
//   - 할인 제외 키워드: ["페이지","화면","화면설계","웹 기획","앱 기획","디자인","UI/UX","UI 디자인","UX 설계","퍼블리싱","스타일링","로고"]
//   - non_discountable_sum = 제외 항목 합
//   - discount_base = original_total - non_discountable_sum
//   - discount_value = max(discount_base * 0.2, 0)
//   - new_total_amount = original_total - discount_value

// 4) 출력:
//   - updated_invoice로 출력(total.duration, total.amount 갱신)
//   - 환율 표시가 필요하면 프론트에서 처리하거나 exchange_rate를 주입
  

// --- [예산절감] 필수 유지 + 2가지 안 (discount_remove_features_budget) ---
// - A안: 'AI/고급/실시간' 기능을 기본형으로 대체/제외
// - B안: (필수 제외) 최고가 3~4개 기능 최적화
// - 각 안에 대해 절감액/절감율 명시, 수정된 견적 JSON 포함

// --- [AI 제안] 전략적 기능 제안 (discount_ai_suggestion) ---
// - 현재 견적/대화를 바탕으로 2~4개 제안
// - 견적 JSON 수정 없이 제안에 집중
// `;
