export interface EstimateItem {
  id: string;
  title: string;
  description: string;
  cost: number;
  period: number;
  details?: {
    description: string;
    items: {
      title: string;
      cost: number;
      period: number;
    }[];
  }[];
}

export interface EstimateData {
  id: string;
  title: string;
  description: string;
  totalCost: number;
  totalPeriod: number;
  items: EstimateItem[];
  createdAt: string;
  updatedAt?: string;
}

export interface AIResponse {
  type: 'loading' | 'error' | 'estimate';
  content?: string;
  estimate?: EstimateData;
}
