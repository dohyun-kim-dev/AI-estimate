// src/app/ai-estimate/types.ts
export interface EstimateItem {
  id: string;
  category: string;
  task: string;
  description: string;
  people: number;
  days: number;
  cost: number;
  front_end_period?: number | string;
  back_end_period?: number | string;
}

export interface Estimate {
  totalCost: number;
  totalPeriod: number;
  items: EstimateItem[];
}

