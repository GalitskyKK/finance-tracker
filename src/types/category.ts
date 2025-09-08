export interface Category {
  id: string
  name: string
  color: string
  icon: string
  type: "income" | "expense"
  sortOrder: number
  isActive: boolean
}

export interface CreateCategoryData {
  name: string
  color: string
  icon: string
  type: "income" | "expense"
  sortOrder?: number
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {
  id: string
}
