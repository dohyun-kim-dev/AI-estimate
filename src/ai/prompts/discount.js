export const discountPrompt = `--- [프로모션] 개발 기간 8주 연장 및 20% 할인 옵션 처리 (discount_extend_8w_20p) ---
사용자가 "[프로모션] 개발 기간을 여유 있게! 8주 연장 시 20% 할인 혜택 제공" 옵션을 선택하면, 다음 지침에 따라 견적을 수정하고 사용자에게 안내합니다.

1. 사용자 안내 메시지:
   - 견적서 JSON 데이터를 출력하기 직전에, 사용자의 'primary_language_code'에 따라 다음 메시지 중 하나를 먼저 일반 텍스트로 출력합니다:
     - 'ko': "[프로모션] 개발 기간 연장 및 할인이 적용된 견적입니다."
     - 'en': "[Promotion] This is an estimate with an extended development period and a discount applied."

2. 개발 기간 재계산:
   - 기존 견적서 데이터 (변수명 original_invoice 또는 이와 유사한 이름으로 참조)의 'total.duration' (일 단위 숫자) 값을 가져옵니다.
   - 새로운 총 개발 기간 (변수명 new_total_duration) = original_invoice.total.duration + 40 (8주 = 40일, 주 5일 근무 기준).

3. 할인 적용 및 총액 재계산:
   - 기존 견적서의 'total.amount' (원래 총액)를 기준으로 계산합니다.
   - 할인 제외 대상 항목 식별:
     - 견적서의 'invoiceGroup' 배열 내 각 그룹의 'items' 배열을 순회합니다.
     - 다음 키워드가 'category' 또는 'feature'에 포함된 항목은 할인 대상에서 제외합니다: "페이지", "화면", "화면설계", "웹 기획", "앱 기획", "디자인", "UI/UX", "UI 디자인", "UX 설계", "퍼블리싱", "스타일링", "로고".
     - **특히, 귀하의 기본 가격 정책에 명시된 '화면설계', 'UI/UX 디자인', '화면퍼블리싱' 또는 이와 유사한 명칭의 항목들은 반드시 할인 대상에서 제외해야 합니다.**
   - "할인 제외 대상 총액 (non_discountable_sum)" 계산: 위에서 식별된 할인 제외 대상 항목들의 'amount' 값을 모두 합산합니다.
   - "실제 할인 적용 대상 금액 (discount_base_amount)" 계산: discount_base_amount = original_invoice.total.amount - non_discountable_sum. (만약 이 값이 0보다 작으면, 할인액은 0으로 처리합니다.)
   - "최종 할인액 (discount_value)" 계산: discount_value = discount_base_amount * 0.2. (20% 할인)
   - "새로운 최종 총액 (new_total_amount)" 계산: new_total_amount = original_invoice.total.amount - discount_value.

4. 수정된 견적서 JSON 생성 및 출력:
   - 원본 견적서 JSON 객체(original_invoice)를 깊은 복사하여 수정된 견적서 객체(updated_invoice)를 만듭니다.
   - updated_invoice.total.duration 값을 위 2번에서 계산한 'new_total_duration'으로 업데이트합니다.
   - updated_invoice.total.amount 값을 위 3번에서 계산한 'new_total_amount'로 업데이트합니다.
   - updated_invoice.total.totalConvertedDisplay 값을 'new_total_amount'와 사용자의 국가 코드(country_code) 및 환율 정보를 바탕으로 "USD 1,234 (₩1,500,000)" 형식으로 정확히 다시 계산하여 업데이트합니다.

--- [예산절감] 필수 기능만 남기고 예산 절감 옵션 처리 (discount_remove_features_budget) ---
사용자가 "[예산절감] 필수 기능만 남기고, 예산을 스마트하게 줄여보세요" 다음 지침에 따라 사용자에게 제안합니다.

1. 사용자 안내 및 대안 제시:
   - 먼저, 사용자의 'primary_language_code'에 따라 다음 메시지를 일반 텍스트로 출력합니다:
     - 'ko': "[예산절감] 현재 견적에서 일부 기능을 조정하여 예산을 절감할 수 있는 2-3가지 방안을 제안해 드립니다. 각 방안을 선택하시면 예상 절감액과 함께 수정된 견적서를 보여드립니다."
     - 'en': "[Budget Saving] We can suggest 2-3 ways to reduce the budget by adjusting some features in the current estimate. If you select an option, we will show you the estimated savings and the revised estimate."
   - 현재 견적서('original_invoice')의 'invoiceGroup' 내 'items'를 분석합니다.

--- [AI 제안] AI 심층 분석 및 기능 제안 처리 (discount_ai_suggestion) ---
사용자가 "[AI 제안] AI 심층 분석을 통해 필요기능을 제안 받아보세요" 옵션을 선택하면, 현재 견적 및 대화 내용을 바탕으로 단순 기능 추가를 넘어선, 사업적 가치를 극대화할 수 있는 전략적이고 창의적인 기능들을 2~4개 제안합니다. 이 단계에서는 견적 JSON을 수정하지 않고, 제안에 집중합니다.

1. 프로젝트 본질 및 현재 상태 파악:
   *   제시된 견적(항목, 금액, 기간)과 이전 대화 내용을 면밀히 분석하여, 사용자가 만들려는 서비스의 핵심 목표, 주요 타겟 사용자, 예상되는 비즈니스 모델을 깊이 이해합니다.
   *   현재 견적에 이미 포함된 기능들을 인지하고, 이를 바탕으로 시너지를 낼 수 있거나, 혹은 아직 충족되지 않은 중요한 사용자 니즈가 있는지 파악합니다.

2. 전략적/혁신적 관점에서의 기능 발굴 (단순 기능 나열 지양):
   *   **사업 성장 잠재력:** 제안하는 기능이 어떻게 신규 사용자 유치, 기존 사용자 유지율 증가, 객단가 상승, 새로운 수익원 발굴, 또는 운영 효율성 개선에 직접적으로 기여할 수 있는지 구체적인 논리를 제시합니다.
   *   **경쟁 우위 확보:** 시장의 다른 유사 서비스들과 비교했을 때, 제안하는 기능이 사용자에게 독특한 가치를 제공하거나 차별화된 경쟁력을 확보할 수 있는 포인트가 무엇인지 설명합니다.
   *   **사용자 경험 혁신:** 사용자의 페인 포인트를 해결하거나, 기대 이상의 편리함/즐거움을 제공하여 서비스 만족도와 충성도를 획기적으로 높일 수 있는 방안을 모색합니다.
   *   **데이터 활용 및 지능화:** 수집 가능한 사용자 데이터를 활용하여 맞춤형 서비스를 제공하거나, AI를 접목하여 서비스 자체를 지능화할 수 있는 아이디어를 제시합니다.

3. 제안 형식 및 내용 구성:
   *   각 제안에 대해 다음 정보를 명확하고 설득력 있게 전달합니다 (마크다운 형식 활용):
       *   **기능명:** 핵심 가치를 담은 직관적인 이름.
       *   **제안 이유 및 핵심 가치:** "왜 이 기능이 중요한가?", "이 기능이 사용자/사장님께 어떤 특별한 가치를 제공하는가?"에 대한 명쾌한 설명.
       *   **기대되는 효과 및 비즈니스 임팩트:** 가능한 경우 정성적/정량적 기대 효과를 함께 제시합니다.
       *   **(선택) 핵심 아이디어 스케치:** 기능이 사용자에게 어떻게 보여지고 작동할지에 대한 간략한 시나리오 또는 예시.
       *   **예상 개발 규모/난이도:** (간단/보통/복잡) 및 그 이유.`;
