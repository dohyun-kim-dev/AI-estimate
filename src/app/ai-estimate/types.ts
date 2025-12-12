// src/app/ai-estimate/types.ts
export interface EstimateItem {
  id?: string;
  category?: string;
  task?: string;
  name: string;
  price: string;
  description: string;
  people?: number;
  days?: number;
  cost?: number;
  front_end_period?: number | string;
  back_end_period?: number | string;
  fe: string; // 프론트엔드 개발 일수 (예: "3일")
  be: string; // 백엔드 개발 일수 (예: "3일")
  page_count: number; // 페이지 수
  cal_page: string; // 본 수 반영 여부 ("Y" 또는 "N")
  is_deleted: boolean;
  item_id?: string;
}

export interface Estimate {
  totalCost: number;
  totalPeriod: number;
  items: EstimateItem[];
}

