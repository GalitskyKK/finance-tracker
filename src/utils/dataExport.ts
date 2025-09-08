import type { Transaction, Category } from "@/types"
import { STORAGE_KEYS } from "@/utils/constants"

export interface ExportedData {
  transactions: Transaction[]
  categories: Category[]
  exportedAt: string
  version: string
}

/**
 * Экспортирует данные из localStorage в структурированном виде
 */
export const exportLocalStorageData = (): ExportedData | null => {
  try {
    const transactionsRaw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)
    const categoriesRaw = localStorage.getItem(STORAGE_KEYS.CATEGORIES)

    const transactions: Transaction[] = transactionsRaw
      ? (JSON.parse(transactionsRaw) as Transaction[])
      : []
    const categories: Category[] = categoriesRaw ? (JSON.parse(categoriesRaw) as Category[]) : []

    // Валидируем данные
    const validTransactions = transactions.filter(
      (t): t is Transaction =>
        typeof t === "object" &&
        t !== null &&
        typeof t.id === "string" &&
        typeof t.amount === "number" &&
        (t.type === "income" || t.type === "expense")
    )

    const validCategories = categories.filter(
      (c): c is Category =>
        typeof c === "object" &&
        c !== null &&
        typeof c.id === "string" &&
        typeof c.name === "string" &&
        !c.isDefault // Не экспортируем дефолтные категории
    )

    return {
      transactions: validTransactions,
      categories: validCategories,
      exportedAt: new Date().toISOString(),
      version: "1.0.0"
    }
  } catch (_error) {
    // console.error("Error exporting localStorage data:", _error)
    return null
  }
}

/**
 * Скачивает backup файл с данными
 */
export const downloadDataBackup = (data: ExportedData): void => {
  try {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json"
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    const date = new Date().toISOString().split("T")[0]

    a.href = url
    a.download = `finance-tracker-backup-${date}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (_error) {
    // console.error("Error downloading backup:", _error)
    throw new Error("Failed to download backup file")
  }
}

/**
 * Загружает данные из backup файла
 */
export const uploadDataBackup = (file: File): Promise<ExportedData> => {
  return new Promise((resolve, reject) => {
    if (!file.type.includes("json")) {
      reject(new Error("File must be JSON format"))
      return
    }

    const reader = new FileReader()

    reader.onload = (e): void => {
      try {
        const content = e.target?.result as string
        const data = JSON.parse(content) as ExportedData

        // Валидация структуры
        if (!data.transactions || !data.categories || !data.exportedAt) {
          throw new Error("Invalid backup file structure")
        }

        resolve(data)
      } catch (_error) {
        reject(new Error("Failed to parse backup file"))
      }
    }

    reader.onerror = (): void => {
      reject(new Error("Failed to read backup file"))
    }

    reader.readAsText(file)
  })
}

/**
 * Получает статистику данных для миграции
 */
export const getDataStats = (): {
  transactionCount: number
  categoryCount: number
  dataSize: number
  hasData: boolean
} => {
  try {
    const data = exportLocalStorageData()

    if (!data) {
      return {
        transactionCount: 0,
        categoryCount: 0,
        dataSize: 0,
        hasData: false
      }
    }

    const dataSize = new Blob([JSON.stringify(data)]).size

    return {
      transactionCount: data.transactions.length,
      categoryCount: data.categories.length,
      dataSize,
      hasData: data.transactions.length > 0 || data.categories.length > 0
    }
  } catch (_error) {
    // console.error("Error getting data stats:", _error)
    return {
      transactionCount: 0,
      categoryCount: 0,
      dataSize: 0,
      hasData: false
    }
  }
}

/**
 * Очищает localStorage после успешной миграции
 */
export const clearLocalStorageData = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS)
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES)
    // console.log("localStorage data cleared successfully")
  } catch (_error) {
    // console.error("Error clearing localStorage:", _error)
  }
}
