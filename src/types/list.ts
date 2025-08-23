export interface BaseRecord {
  id?: string | number
  index?: number
  [key: string]: any
}

export interface FetchParams {
  fromDate?: string
  toDate?: string
  keyword?: string
}

export interface FetchResult<T> {
  data: T[]
  totalItems: number
  allItems?: number
}

export interface ColumnDefinition<T> {
  header: string | React.ReactNode
  accessor: keyof T | string
  sortable?: boolean
  formatter?: (value: any, item: T, index: number) => React.ReactNode | string | number | boolean
  width?: string | number
  align?: 'left' | 'center' | 'right'
  className?: string
}

export interface InitialState {
  page?: number
  size?: number
  sortKey?: string | null
  sortOrder?: 'asc' | 'desc'
  fromDate?: string
  toDate?: string
  keyword?: string
}

export type ThemeMode = 'light' | 'dark'
