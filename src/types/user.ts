export interface User {
  id: string
  email: string
  name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string

  // Настройки пользователя
  currency: string
  timezone: string
  date_format: "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD"
  language: "ru" | "en"
}

export interface CreateUserData {
  email: string
  name?: string
  avatar_url?: string
  currency?: string
  timezone?: string
  date_format?: "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD"
  language?: "ru" | "en"
}

export interface UpdateUserData {
  name?: string
  avatar_url?: string
  currency?: string
  timezone?: string
  date_format?: "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD"
  language?: "ru" | "en"
}

export interface UserProfile {
  user: User
  totalBalance: number
  monthlyIncome: number
  monthlyExpenses: number
  transactionCount: number
  categoriesCount: number
}
