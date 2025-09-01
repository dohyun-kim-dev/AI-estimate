export interface ProjectEstimate {
  project_name: string;
  total_price: string;
  vat_included_price: string;
  estimated_period: string;
  categories: Category[];
  filePath?: string; // 서버에서 반환된 파일 경로
  uuid?: string; // 서버에서 반환된 UUID
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
  description: string;
}

export interface ExtractedEstimateData extends ProjectEstimate {
  uuid?: string; // uuid 속성 추가
}