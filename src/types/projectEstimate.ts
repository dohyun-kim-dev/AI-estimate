export interface ProjectEstimateItem {
  name: string
  price: string
  description: string
  period?: string
  details?: {
    title: string
    description: string
    items: {
      name: string
      price: string
      period?: string
    }[]
  }[]
}

export interface SubCategory {
  sub_category_name: string
  items: ProjectEstimateItem[]
  total_price?: string
  total_period?: string
}

export interface Category {
  category_name: string
  sub_categories: SubCategory[]
  total_price?: string
  total_period?: string
}

export interface ProjectEstimate {
  description: string
  total_price: string
  total_period: string
  categories: Category[]
  metadata?: {
    created_at: string
    updated_at?: string
    version?: string
    tags?: string[]
  }
}

export interface EstimateHistory {
  id: string
  estimate: ProjectEstimate
  created_at: string
  status: 'draft' | 'published' | 'archived'
}

export interface EstimateTemplate {
  id: string
  name: string
  description: string
  base_price: string
  base_period: string
  categories: Category[]
}