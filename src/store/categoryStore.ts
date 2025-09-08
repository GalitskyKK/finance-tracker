import { create } from "zustand"
import { Category, CreateCategoryData } from "@/types"
import { STORAGE_KEYS } from "@/utils/constants"
import { defaultCategories } from "@/data/mockData"

interface CategoryState {
  categories: Category[]
  loading: boolean
  error: string | null

  // Actions
  setCategories: (categories: Category[]) => void
  addCategory: (category: CreateCategoryData) => void
  updateCategory: (id: string, updates: Partial<CreateCategoryData>) => void
  deleteCategory: (id: string) => void
  clearError: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string) => void

  // Getters
  getCategoriesByType: (type: "income" | "expense") => Category[]
  getCategoryById: (id: string) => Category | undefined
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: defaultCategories,
  loading: false,
  error: null,

  setCategories: (categories): void => {
    set({ categories })
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories))
  },

  addCategory: (categoryData): void => {
    const newCategory: Category = {
      ...categoryData,
      id: crypto.randomUUID(),
      isDefault: false
    }

    const { categories } = get()
    const updatedCategories = [...categories, newCategory]

    set({ categories: updatedCategories })
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(updatedCategories))
  },

  updateCategory: (id, updates): void => {
    const { categories } = get()
    const updatedCategories = categories.map((category) =>
      category.id === id ? { ...category, ...updates } : category
    )

    set({ categories: updatedCategories })
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(updatedCategories))
  },

  deleteCategory: (id): void => {
    const { categories } = get()
    const category = categories.find((cat) => cat.id === id)

    // Нельзя удалять дефолтные категории
    if (category?.isDefault) {
      set({ error: "Нельзя удалить системную категорию" })
      return
    }

    const updatedCategories = categories.filter((category) => category.id !== id)

    set({ categories: updatedCategories })
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(updatedCategories))
  },

  clearError: (): void => set({ error: null }),
  setLoading: (loading): void => set({ loading }),
  setError: (error): void => set({ error }),

  getCategoriesByType: (type): Category[] => {
    const { categories } = get()
    return categories.filter((category) => category.type === type)
  },

  getCategoryById: (id): Category | undefined => {
    const { categories } = get()
    return categories.find((category) => category.id === id)
  }
}))
