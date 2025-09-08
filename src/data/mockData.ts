import { Transaction, Category } from "@/types"
import { DEFAULT_INCOME_CATEGORIES, DEFAULT_EXPENSE_CATEGORIES } from "@/utils/constants"

// Генерируем дефолтные категории (для совместимости с localStorage)
export const defaultCategories: Category[] = [
  ...DEFAULT_INCOME_CATEGORIES.map((cat, index) => ({
    id: `income-${index}`,
    name: cat.name,
    color: cat.color,
    icon: cat.icon,
    type: "income" as const,
    sortOrder: index + 1,
    isActive: true
  })),
  ...DEFAULT_EXPENSE_CATEGORIES.map((cat, index) => ({
    id: `expense-${index}`,
    name: cat.name,
    color: cat.color,
    icon: cat.icon,
    type: "expense" as const,
    sortOrder: index + 1,
    isActive: true
  }))
]

// Моковые транзакции для демонстрации
export const mockTransactions: Transaction[] = [
  {
    id: "1",
    amount: 50000,
    type: "income",
    categoryId: "income-0", // Зарплата
    description: "Зарплата за январь",
    date: "2024-01-31",
    createdAt: "2024-01-31T10:00:00.000Z",
    updatedAt: "2024-01-31T10:00:00.000Z"
  },
  {
    id: "2",
    amount: 2500,
    type: "expense",
    categoryId: "expense-0", // Продукты
    description: "Покупка продуктов в супермаркете",
    date: "2024-01-30",
    createdAt: "2024-01-30T15:30:00.000Z",
    updatedAt: "2024-01-30T15:30:00.000Z"
  },
  {
    id: "3",
    amount: 800,
    type: "expense",
    categoryId: "expense-1", // Транспорт
    description: "Заправка автомобиля",
    date: "2024-01-29",
    createdAt: "2024-01-29T09:15:00.000Z",
    updatedAt: "2024-01-29T09:15:00.000Z"
  },
  {
    id: "4",
    amount: 1500,
    type: "expense",
    categoryId: "expense-2", // Развлечения
    description: "Поход в кино",
    date: "2024-01-28",
    createdAt: "2024-01-28T20:00:00.000Z",
    updatedAt: "2024-01-28T20:00:00.000Z"
  },
  {
    id: "5",
    amount: 3000,
    type: "expense",
    categoryId: "expense-3", // Одежда
    description: "Покупка зимней куртки",
    date: "2024-01-27",
    createdAt: "2024-01-27T14:20:00.000Z",
    updatedAt: "2024-01-27T14:20:00.000Z"
  },
  {
    id: "6",
    amount: 8000,
    type: "income",
    categoryId: "income-1", // Фриланс
    description: "Разработка сайта",
    date: "2024-01-26",
    createdAt: "2024-01-26T18:45:00.000Z",
    updatedAt: "2024-01-26T18:45:00.000Z"
  }
]
