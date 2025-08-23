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
  description: string;
}
