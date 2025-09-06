// Типы для ответов от Supabase
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
