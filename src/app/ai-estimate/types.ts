// src/app/ai-estimate/types.ts
export interface EstimateItem {
  id: string;
  category: string;
  task: string;
  description: string;
  people: number;
  days: number;
  cost: number;
}

export interface Estimate {
  totalCost: number;
  totalPeriod: number;
  items: EstimateItem[];
}

