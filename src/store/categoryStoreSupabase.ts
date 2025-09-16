import { create } from "zustand"
import type { Category } from "@/types"
import type { SupabaseGlobalCategoryRow } from "@/types/supabase"
import { supabase } from "@/lib/supabase"
import { offlineUtils } from "@/hooks/useOfflineSync"

interface CategoryState {
  categories: Category[]
  loading: boolean
  error: string | null
  isOfflineMode: boolean
  lastSyncTime: number | null

  // Actions
  fetchCategories: () => Promise<void>
  loadFromCache: () => Promise<void>
  clearError: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string) => void
  setOfflineMode: (isOffline: boolean) => void

  // Getters
  getCategoriesByType: (type: "income" | "expense") => Category[]
  getCategoryById: (id: string) => Category | undefined
  getActiveCategoriesByType: (type: "income" | "expense") => Category[]
}

export const useCategoryStoreSupabase = create<CategoryState>((set, get) => ({
  categories: [],
  loading: false,
  error: null,
  isOfflineMode: false,
  lastSyncTime: null,

  fetchCategories: async (): Promise<void> => {
    set({ loading: true, error: null })

    // Сначала пытаемся загрузить из кэша
    try {
      const cachedCategories = await offlineUtils.getCategoriesFromCache()
      if (cachedCategories.length > 0) {
        set({
          categories: cachedCategories,
          isOfflineMode: false // Временно, проверим сеть далее
        })
      }
    } catch (cacheError) {
      console.warn("Failed to load categories from cache:", cacheError)
    }

    // Пытаемся загрузить с сервера
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

      // Сохраняем в кэш для офлайн использования
      try {
        await offlineUtils.saveCategoriesToCache(transformedCategories)
      } catch (cacheError) {
        console.warn("Failed to save categories to cache:", cacheError)
      }

      set({
        categories: transformedCategories,
        loading: false,
        isOfflineMode: false,
        lastSyncTime: Date.now()
      })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch categories"

      // Если есть кэшированные данные, используем их
      const { categories } = get()
      if (categories.length > 0) {
        set({
          loading: false,
          isOfflineMode: true,
          error: null // Не показываем ошибку если есть кэшированные данные
        })
      } else {
        set({
          error: errorMessage,
          loading: false,
          isOfflineMode: true
        })
      }
    }
  },

  loadFromCache: async (): Promise<void> => {
    set({ loading: true, error: null })

    try {
      const cachedCategories = await offlineUtils.getCategoriesFromCache()
      set({
        categories: cachedCategories,
        loading: false,
        isOfflineMode: true
      })
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load categories from cache"
      set({
        error: errorMessage,
        loading: false,
        isOfflineMode: true
      })
    }
  },

  clearError: (): void => set({ error: null }),
  setLoading: (loading: boolean): void => set({ loading }),
  setError: (error: string): void => set({ error }),
  setOfflineMode: (isOffline: boolean): void => set({ isOfflineMode: isOffline }),

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
