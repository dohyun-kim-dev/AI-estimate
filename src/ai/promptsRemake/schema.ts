// // promptsRemake/schema.ts
// export const schemaPrompt = `
// type Money = {
//   amount: number;          // 내부 계산용 숫자
//   display: string;         // "10,000,000원"
//   currency: string;        // "KRW"
// }

// interface EstimateItem {
//   item_id: string;
//   name: string;
//   description: string;
//   amount: Money;
//   is_deleted: boolean;
//   note?: string;
// }

// interface SubCategory {
//   sub_category_name: string;
//   items: EstimateItem[];
// }

// interface Category {
//   category_name: string;
//   sub_categories: SubCategory[];
// }

// interface ProjectEstimate {
//   project_name: string;
//   total_price: Money;          // VAT 제외/포함 정책은 설명에 명시
//   vat_included_price: Money;
//   estimated_period: string;    // "N주"
//   pages: number;
//   platform_mode: "pc"|"mobile"|"both";
//   categories: Category[];
// }

// [필수 카테고리 기본값]
// - "⚙️ 기본 공통" / "기반 공통":
//   - 화면설계, UI/UX디자인, 퍼블리싱 (calcPagesCost 사용)

// - "👤 사용자 관리":
//   - 회원가입/로그인(4p), ID/PW찾기(2p), 마이페이지(6p)

// - "👨‍💼 관리자 기능":
//   - 관리자 로그인(1p), 대시보드(6p), 사용자관리(2p)

// - "📄 콘텐츠 관리":
//   - 공지사항(2p), FAQ(2p)

// [calcPagesCost 규칙]
// - input: pages(number), platform_mode("pc"|"mobile"|"both")
// - 단가:
//   - pc OR mobile: 100,000/페이지
//   - both: 150,000/페이지
// - 세 항목(설계/디자인/퍼블리싱)을 각각 pages*단가로 산출
// `;
