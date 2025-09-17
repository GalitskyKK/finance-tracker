// Типы для ответов от Supabase
export interface SupabaseGlobalCategoryRow {
  id: string
  name: string
  color: string
  icon: string
  type: "income" | "expense"
  sort_order: number
  is_active: boolean
  created_at: string
}

// Старый тип для категорий (deprecated, для миграции)
export interface SupabaseCategoryRow {
  id: string
  user_id: string
  name: string
  color: string
  icon: string
  type: "income" | "expense"
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface SupabaseTransactionRow {
  id: string
  user_id: string
  amount: string // В БД это decimal, приходит как string
  type: "income" | "expense"
  category_id: string
  description: string
  date: string
  created_at: string
  updated_at: string
}

export interface SupabaseProfileRow {
  id: string
  email: string
  name: string | null
  avatar_url: string | null
  currency: string
  timezone: string
  date_format: string
  language: string
  created_at: string
  updated_at: string
}

export interface SupabaseBudgetRow {
  id: string
  user_id: string
  category_id: string
  amount: string // В БД это decimal, приходит как string
  period: "monthly" | "weekly"
  created_at: string
  updated_at: string
}

export interface SupabaseSavingsGoalRow {
  id: string
  user_id: string
  name: string
  description: string
  target_amount: string // В БД это decimal, приходит как string
  current_amount: string // В БД это decimal, приходит как string
  color: string
  icon: string
  deadline: string | null // ISO string, может быть null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SupabaseSavingsTransactionRow {
  id: string
  user_id: string
  savings_goal_id: string
  amount: string // В БД это decimal, приходит как string
  type: "deposit" | "withdraw"
  description: string
  date: string // ISO string
  created_at: string
  updated_at: string
}
