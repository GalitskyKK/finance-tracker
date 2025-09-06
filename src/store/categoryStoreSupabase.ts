import { create } from "zustand"
import type { Category, CreateCategoryData } from "@/types"
import { supabase } from "@/lib/supabase"

interface CategoryState {
  categories: Category[]
  loading: boolean
  error: string | null

  // Actions
  fetchCategories: () => Promise<void>
  addCategory: (category: CreateCategoryData) => Promise<void>
  updateCategory: (id: string, updates: Partial<CreateCategoryData>) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  clearError: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string) => void

  // Getters
  getCategoriesByType: (type: "income" | "expense") => Category[]
  getCategoryById: (id: string) => Category | undefined
}

export const useCategoryStoreSupabase = create<CategoryState>((set, get) => ({
  categories: [],
  loading: false,
  error: null,

  fetchCategories: async (): Promise<void> => {
    set({ loading: true, error: null })

    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true })

      if (error) throw error

      // Преобразуем данные к нашему формату
      const transformedCategories: Category[] = data.map((row) => ({
        id: row.id,
        name: row.name,
        color: row.color,
        icon: row.icon,
        type: row.type as "income" | "expense",
        isDefault: row.is_default
      }))

      set({
        categories: transformedCategories,
        loading: false
      })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch categories"
      console.error("Error fetching categories:", error)
      set({
        error: errorMessage,
        loading: false
      })
    }
  },

  addCategory: async (categoryData: CreateCategoryData): Promise<void> => {
    set({ loading: true, error: null })

    try {
      const {
        data: { user }
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      const { data, error } = await supabase
        .from("categories")
        .insert([
          {
            user_id: user.id,
            name: categoryData.name,
            color: categoryData.color,
            icon: categoryData.icon,
            type: categoryData.type,
            is_default: false
          }
        ])
        .select()
        .single()

      if (error) throw error

      // Создаем объект категории в нашем формате
      const newCategory: Category = {
        id: data.id,
        name: data.name,
        color: data.color,
        icon: data.icon,
        type: data.type as "income" | "expense",
        isDefault: data.is_default
      }

      // Добавляем в локальное состояние
      const { categories } = get()
      const updatedCategories = [...categories, newCategory].sort((a, b) =>
        a.name.localeCompare(b.name)
      )

      set({
        categories: updatedCategories,
        loading: false
      })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to add category"
      console.error("Error adding category:", error)
      set({
        error: errorMessage,
        loading: false
      })
      throw error
    }
  },

  updateCategory: async (id: string, updates: Partial<CreateCategoryData>): Promise<void> => {
    set({ loading: true, error: null })

    try {
      const updateData: Record<string, unknown> = {}

      if (updates.name !== undefined) updateData.name = updates.name
      if (updates.color !== undefined) updateData.color = updates.color
      if (updates.icon !== undefined) updateData.icon = updates.icon
      if (updates.type !== undefined) updateData.type = updates.type

      const { data, error } = await supabase
        .from("categories")
        .update(updateData)
        .eq("id", id)
        .select()
        .single()

      if (error) throw error

      // Обновляем локальное состояние
      const { categories } = get()
      const updatedCategories = categories
        .map((category) =>
          category.id === id
            ? {
                ...category,
                name: data.name || category.name,
                color: data.color || category.color,
                icon: data.icon || category.icon,
                type: data.type || category.type
              }
            : category
        )
        .sort((a, b) => a.name.localeCompare(b.name))

      set({
        categories: updatedCategories,
        loading: false
      })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update category"
      console.error("Error updating category:", error)
      set({
        error: errorMessage,
        loading: false
      })
      throw error
    }
  },

  deleteCategory: async (id: string): Promise<void> => {
    set({ loading: true, error: null })

    try {
      // Проверяем, не является ли категория системной
      const category = get().getCategoryById(id)
      if (category?.isDefault) {
        throw new Error("Нельзя удалить системную категорию")
      }

      const { error } = await supabase.from("categories").delete().eq("id", id)

      if (error) throw error

      // Удаляем из локального состояния
      const { categories } = get()
      const updatedCategories = categories.filter((category) => category.id !== id)

      set({
        categories: updatedCategories,
        loading: false
      })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete category"
      console.error("Error deleting category:", error)
      set({
        error: errorMessage,
        loading: false
      })
      throw error
    }
  },

  clearError: (): void => set({ error: null }),
  setLoading: (loading: boolean): void => set({ loading }),
  setError: (error: string): void => set({ error }),

  getCategoriesByType: (type: "income" | "expense"): Category[] => {
    const { categories } = get()
    return categories.filter((category) => category.type === type)
  },

  getCategoryById: (id: string): Category | undefined => {
    const { categories } = get()
    return categories.find((category) => category.id === id)
  }
}))

// Функция для создания дефолтных категорий при первом входе пользователя
export const initializeDefaultCategories = async (): Promise<void> => {
  try {
    const {
      data: { user }
    } = await supabase.auth.getUser()
    if (!user) return

    // Проверяем, есть ли уже категории у пользователя
    const { data: existingCategories, error: checkError } = await supabase
      .from("categories")
      .select("id")
      .eq("user_id", user.id)
      .limit(1)

    if (checkError) throw checkError

    // Если категории уже есть - не создаем дефолтные
    if (existingCategories && existingCategories.length > 0) {
      return
    }

    // Дефолтные категории для новых пользователей
    const defaultCategories = [
      // Доходы
      { name: "Зарплата", color: "#22c55e", icon: "💼", type: "income" as const },
      { name: "Фриланс", color: "#3b82f6", icon: "💻", type: "income" as const },
      { name: "Инвестиции", color: "#8b5cf6", icon: "📈", type: "income" as const },
      { name: "Другие доходы", color: "#06b6d4", icon: "💰", type: "income" as const },

      // Расходы
      { name: "Продукты", color: "#ef4444", icon: "🛒", type: "expense" as const },
      { name: "Транспорт", color: "#f97316", icon: "🚗", type: "expense" as const },
      { name: "Развлечения", color: "#ec4899", icon: "🎬", type: "expense" as const },
      { name: "Здоровье", color: "#10b981", icon: "🏥", type: "expense" as const },
      { name: "Образование", color: "#6366f1", icon: "📚", type: "expense" as const },
      { name: "Коммунальные", color: "#84cc16", icon: "🏠", type: "expense" as const },
      { name: "Одежда", color: "#f59e0b", icon: "👕", type: "expense" as const },
      { name: "Прочее", color: "#6b7280", icon: "📝", type: "expense" as const }
    ]

    const { error } = await supabase.from("categories").insert(
      defaultCategories.map((cat) => ({
        user_id: user.id,
        name: cat.name,
        color: cat.color,
        icon: cat.icon,
        type: cat.type,
        is_default: true
      }))
    )

    if (error) throw error

    console.log("Default categories created successfully")
  } catch (error) {
    console.error("Error creating default categories:", error)
  }
}

// Real-time подписка на изменения категорий
supabase
  .channel("categories")
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "categories"
    },
    (payload) => {
      console.log("Category changed:", payload)

      // При изменениях извне - обновляем данные
      const store = useCategoryStoreSupabase.getState()
      if (!store.loading) {
        store.fetchCategories()
      }
    }
  )
  .subscribe()
