import { create } from "zustand"
import type { Category } from "@/types"
import type { SupabaseGlobalCategoryRow } from "@/types/supabase"
import { supabase } from "@/lib/supabase"

interface CategoryState {
  categories: Category[]
  loading: boolean
  error: string | null

  // Actions
  fetchCategories: () => Promise<void>
  clearError: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string) => void

  // Getters
  getCategoriesByType: (type: "income" | "expense") => Category[]
  getCategoryById: (id: string) => Category | undefined
  getActiveCategoriesByType: (type: "income" | "expense") => Category[]
}

export const useCategoryStoreSupabase = create<CategoryState>((set, get) => ({
  categories: [],
  loading: false,
  error: null,

  fetchCategories: async (): Promise<void> => {
    set({ loading: true, error: null })

    try {
      const result = await supabase
        .from("global_categories")
        .select("*")
        .eq("is_active", true)
        .order("type", { ascending: false }) // income first
        .order("sort_order", { ascending: true })

      if (result.error) throw result.error
      if (!result.data) throw new Error("No data returned from global_categories")

      // Преобразуем данные к нашему формату
      const transformedCategories: Category[] = (result.data as SupabaseGlobalCategoryRow[]).map(
        (row: SupabaseGlobalCategoryRow) => ({
          id: row.id,
          name: row.name,
          color: row.color,
          icon: row.icon,
          type: row.type,
          sortOrder: row.sort_order,
          isActive: row.is_active
        })
      )

      set({
        categories: transformedCategories,
        loading: false
      })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch categories"
      set({
        error: errorMessage,
        loading: false
      })
    }
  },

  clearError: (): void => set({ error: null }),
  setLoading: (loading: boolean): void => set({ loading }),
  setError: (error: string): void => set({ error }),

  getCategoriesByType: (type: "income" | "expense"): Category[] => {
    const { categories } = get()
    return categories
      .filter((category) => category.type === type)
      .sort((a, b) => a.sortOrder - b.sortOrder)
  },

  getCategoryById: (id: string): Category | undefined => {
    const { categories } = get()
    return categories.find((category) => category.id === id)
  },

  getActiveCategoriesByType: (type: "income" | "expense"): Category[] => {
    const { categories } = get()
    return categories
      .filter((category) => category.type === type && category.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder)
  }
}))

// Глобальные категории больше не требуют инициализации для каждого пользователя
// Категории создаются один раз в БД и доступны всем пользователям

// Real-time подписка на изменения глобальных категорий
supabase
  .channel("global_categories")
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "global_categories"
    },
    (_payload) => {
      // При изменениях извне - обновляем данные
      const store = useCategoryStoreSupabase.getState()
      if (!store.loading) {
        store.fetchCategories()
      }
    }
  )
  .subscribe()
