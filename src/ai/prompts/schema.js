export const schemaPrompt = `**견적서 JSON 스키마 정의:**

견적서는 다음과 같은 구조로 생성되어야 합니다:

\`\`\`typescript
interface ProjectEstimate {
  project_name: string;           // 프로젝트 이름
  total_price: string;           // 총 금액 (예: "90,120,000")
  vat_included_price: string;    // 부가세 포함 금액
  estimated_period: string;      // 예상 기간 (예: "22주")
  categories: Category[];        // 카테고리 목록
}

interface Category {
  category_name: string;         // 카테고리 이름 (예: "⚙️ 기본 공통")
  sub_categories: SubCategory[]; // 하위 카테고리 목록
}

interface SubCategory {
  sub_category_name: string;     // 하위 카테고리 이름
  items: EstimateItem[];        // 견적 항목 목록
}

interface EstimateItem {
  name: string;                 // 항목 이름
  price: string;                // 가격 (예: "10,000,000")
  description: string;          // 설명
}
\`\`\`

**중요 규칙:**

1. **카테고리 구조화:**
   - 모든 기능은 적절한 카테고리와 하위 카테고리로 그룹화되어야 합니다.
   - 카테고리명 앞에는 관련 이모지를 포함할 수 있습니다.

2. **가격 형식:**
   - 모든 가격은 쉼표로 구분된 문자열로 표시됩니다.
   - 예: "10,000,000", "2,400,000"

3. **필수 카테고리:**
   - "⚙️ 기본 공통": 화면설계, UI/UX디자인, 퍼블리싱 등 기본 작업
   - "👤 사용자 관리": 회원가입, 로그인 등 사용자 관련 기능
   - "👨‍💼 관리자 기능": 관리자 페이지 관련 기능

4. **설명 작성:**
   - 각 항목의 설명은 구체적이고 명확해야 합니다.
   - 가격 책정 기준이나 참고사항을 포함할 수 있습니다.

5. **기간 표시:**
   - 전체 예상 기간은 "N주" 형식으로 표시합니다.

예시 JSON:
\`\`\`json
{
  "project_name": "웹 커머스 플랫폼",
  "total_price": "50,000,000",
  "vat_included_price": "55,000,000",
  "estimated_period": "12주",
  "categories": [
    {
      "category_name": "⚙️ 기본 공통",
      "sub_categories": [
        {
          "sub_category_name": "기반 공통",
          "items": [
            {
              "name": "화면설계",
              "price": "10,000,000",
              "description": "IT프로젝트를 진행하기 위한 전반적인 설계를 정의합니다. (본수 기준 1장당 10만원)"
            }
          ]
        }
      ]
    }
  ]
}
\`\`\`

이 스키마를 기반으로 견적서 JSON을 생성하면, 프론트엔드의 EstimateCard, EstimateAccordion 등의 컴포넌트에서 자동으로 렌더링됩니다.`;
