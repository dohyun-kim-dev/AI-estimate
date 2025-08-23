export interface PromptTemplate {
  id: string
  title: string
  description?: string
  template: string
  category?: string
  tags?: string[]
}

export interface PromptResponse {
  content: string
  type: 'text' | 'code' | 'error'
  metadata?: Record<string, unknown>
}
