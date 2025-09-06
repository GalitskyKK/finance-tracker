import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Типизация для базы данных
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
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
        Insert: {
          id: string
          email: string
          name?: string | null
          avatar_url?: string | null
          currency?: string
          timezone?: string
          date_format?: string
          language?: string
        }
        Update: {
          name?: string | null
          avatar_url?: string | null
          currency?: string
          timezone?: string
          date_format?: string
          language?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
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
        Insert: {
          id?: string
          user_id: string
          name: string
          color: string
          icon: string
          type: "income" | "expense"
          is_default?: boolean
        }
        Update: {
          name?: string
          color?: string
          icon?: string
          type?: "income" | "expense"
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          type: "income" | "expense"
          category_id: string
          description: string
          date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          type: "income" | "expense"
          category_id: string
          description: string
          date: string
        }
        Update: {
          amount?: number
          type?: "income" | "expense"
          category_id?: string
          description?: string
          date?: string
          updated_at?: string
        }
      }
      budgets: {
        Row: {
          id: string
          user_id: string
          category_id: string
          amount: number
          period: "monthly" | "weekly"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id: string
          amount: number
          period?: "monthly" | "weekly"
        }
        Update: {
          amount?: number
          period?: "monthly" | "weekly"
          updated_at?: string
        }
      }
    }
  }
}
