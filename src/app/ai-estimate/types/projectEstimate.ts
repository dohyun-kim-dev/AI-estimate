export interface ProjectEstimate {
  project_name: string;
  total_price: string;
  vat_included_price: string;
  estimated_period: string;
  categories: Category[];
  filePath?: string; // 서버에서 반환된 파일 경로
  uuid: string; // 서버에서 반환된 UUID
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
  front_end_period?: number | string;
  back_end_period?: number | string;
  item_id?: string; // 서버에서 관리하는 항목 ID (있을 수도 있고 없을 수도 있음)
  is_deleted?: boolean; // 항목 삭제 여부
}

export interface ExtractedEstimateData extends ProjectEstimate {
  uuid?: string; // uuid 속성 추가
}