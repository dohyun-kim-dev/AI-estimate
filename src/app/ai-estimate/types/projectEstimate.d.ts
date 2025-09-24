export interface ProjectEstimate {
    project_name: string;
    total_price: string;
    vat_included_price: string;
    estimated_period: string;
    categories: Category[];
}
export interface Category {
    category_name: string;
    sub_categories: SubCategory[];
}
export interface SubCategory {
    sub_category_name: string;
    items: EstimateItem[];
}
export interface EstimateItem {
    name: string;
    price: string;
    fe: string; // 프론트엔드 개발 여부
    be: string; // 백엔드 개발 여부
    page_count: number; // 페이지 수
    description: string;
}
