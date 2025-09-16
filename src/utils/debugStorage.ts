// Утилиты для debug localStorage проблем

export const debugLocalStorage = (): void => {
  if (typeof window === "undefined") {
    console.log("❌ Window undefined")
    return
  }

  console.log("🔍 DEBUG localStorage state:")

  try {
    // Проверяем все ключи localStorage
    const keys = Object.keys(localStorage)
    const financeKeys = keys.filter((key) => key.includes("finance"))

    console.log("All localStorage keys:", keys)
    console.log("Finance-related keys:", financeKeys)

    // Проверяем конкретные ключи
    const transactionsKey = "finance-tracker-transactions"
    const categoriesKey = "finance-tracker-categories"

    const transactions = localStorage.getItem(transactionsKey)
    const categories = localStorage.getItem(categoriesKey)

    console.log("Transactions data:", {
      key: transactionsKey,
      exists: !!transactions,
      length: transactions?.length ?? 0,
      data: transactions
    })

    if (transactions) {
      try {
        const parsed = JSON.parse(transactions) as unknown[]
        console.log("Parsed transactions:", parsed)
      } catch (parseError) {
        console.error("❌ Failed to parse transactions:", parseError)
      }
    }

    console.log("Categories data:", {
      key: categoriesKey,
      exists: !!categories,
      length: categories?.length ?? 0,
      data: categories
    })

    // Дополнительная диагностика
    console.log("localStorage length:", localStorage.length)
    console.log("Current domain:", window.location.hostname)
    console.log("User agent:", navigator.userAgent)
  } catch (error) {
    console.error("❌ Error in debugLocalStorage:", error)
  }
}

export const testLocalStorageWrite = (): boolean => {
  if (typeof window === "undefined") return false

  const testData = [
    {
      id: "test-1",
      amount: 100,
      type: "expense" as const,
      categoryId: "test-cat",
      description: "Test transaction",
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]

  try {
    localStorage.setItem("finance-tracker-transactions", JSON.stringify(testData))
    console.log("✅ Test localStorage write success")

    const readBack = localStorage.getItem("finance-tracker-transactions")
    const parsed = readBack ? (JSON.parse(readBack) as unknown) : null
    console.log("✅ Test localStorage read success:", parsed)

    return true
  } catch (error) {
    console.error("❌ Test localStorage failed:", error)
    return false
  }
}

// Функция для тестирования загрузки данных приложением
export const testAppDataLoading = (): void => {
  if (typeof window === "undefined") return

  console.log("🧪 TESTING APP DATA LOADING:")

  // Проверяем текущее состояние stores
  try {
    // @ts-ignore - accessing global zustand stores
    const transactionStore = window.__ZUSTAND_STORES__?.transaction || {}
    console.log("Transaction store state:", transactionStore)
  } catch (error) {
    console.log("No zustand store access:", error)
  }

  // Тестируем сохранение данных через приложение
  console.log("Creating test transaction through app...")

  // Создаем тестовые данные прямо в localStorage чтобы проверить загрузку
  const testTransaction = {
    id: "test-load-" + Date.now(),
    amount: 999,
    type: "expense",
    categoryId: "test-category",
    description: "Test transaction for loading",
    date: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  try {
    const existing = localStorage.getItem("finance-tracker-transactions")
    const existingData = existing ? JSON.parse(existing) : []
    existingData.push(testTransaction)
    localStorage.setItem("finance-tracker-transactions", JSON.stringify(existingData))
    console.log("✅ Added test transaction to localStorage")

    // Проверяем что данные там
    debugLocalStorage()
  } catch (error) {
    console.error("❌ Failed to add test transaction:", error)
  }
}

// Глобальные функции для console
declare global {
  interface Window {
    debugStorage: () => void
    testStorage: () => boolean
    testAppLoading: () => void
  }
}

if (typeof window !== "undefined") {
  window.debugStorage = debugLocalStorage
  window.testStorage = testLocalStorageWrite
  window.testAppLoading = testAppDataLoading
}
