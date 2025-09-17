export interface Budget {
  id: string
  categoryId: string
  amount: number
  period: "monthly" | "weekly"
  createdAt: string
}

export interface CreateBudgetData {
  categoryId: string
  amount: number
  period: "monthly" | "weekly"
}

export interface UpdateBudgetData extends Partial<CreateBudgetData> {
  id: string
}
