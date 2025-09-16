// Утилиты для debug localStorage проблем

export const debugLocalStorage = (): void => {
  if (typeof window === "undefined") return

  console.log("🔍 DEBUG localStorage state:")

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
    parsed: transactions ? (JSON.parse(transactions) as unknown) : null
  })

  console.log("Categories data:", {
    key: categoriesKey,
    exists: !!categories,
    length: categories?.length ?? 0,
    parsed: categories ? (JSON.parse(categories) as unknown) : null
  })
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

// Глобальные функции для console
declare global {
  interface Window {
    debugStorage: () => void
    testStorage: () => boolean
  }
}

if (typeof window !== "undefined") {
  window.debugStorage = debugLocalStorage
  window.testStorage = testLocalStorageWrite
}
