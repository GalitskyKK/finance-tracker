import React from "react"
import ReactDOM from "react-dom/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import App from "./App.tsx"
import "./index.css"
import { registerSW } from "virtual:pwa-register"
// import "./utils/debugStorage" // Debug utils для localStorage

// Типы для debugStorage
declare global {
  interface Window {
    debugStorage: () => any
    testTransactionSave: () => string
    clearStorage: () => string
    testStore: () => string
  }
}

// Минимальная версия debugStorage для диагностики
if (typeof window !== "undefined") {
  window.debugStorage = () => {
    try {
      const transactions = localStorage.getItem("finance-tracker-transactions")
      const categories = localStorage.getItem("finance-tracker-categories")

      const result = {
        transactions: !!transactions,
        categories: !!categories,
        transactionsLength: transactions?.length || 0,
        categoriesLength: categories?.length || 0,
        localStorage: typeof localStorage,
        window: typeof window,
        transactionsData: transactions ? transactions.substring(0, 100) + "..." : null,
        categoriesData: categories ? categories.substring(0, 100) + "..." : null
      }

      console.log("🔍 SIMPLE DEBUG:", result)
      return result
    } catch (error) {
      console.error("❌ debugStorage error:", error)
      return "❌ ошибка debugStorage"
    }
  }

  // Дополнительные функции
  window.testTransactionSave = () => {
    try {
      const testData = [
        {
          id: "test-" + Date.now(),
          amount: 999,
          type: "expense",
          categoryId: "test-cat",
          description: "Test transaction",
          date: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]

      localStorage.setItem("finance-tracker-transactions", JSON.stringify(testData))
      return "✅ Test transaction saved"
    } catch (error) {
      console.error("❌ Test save error:", error)
      return "❌ Test save failed"
    }
  }

  window.clearStorage = () => {
    try {
      localStorage.removeItem("finance-tracker-transactions")
      localStorage.removeItem("finance-tracker-categories")
      return "✅ Storage cleared"
    } catch (error) {
      return "❌ Clear failed"
    }
  }

  // Функция для тестирования store напрямую
  window.testStore = () => {
    try {
      // @ts-ignore - тестируем store напрямую
      const store = window.__TRANSACTION_STORE__ || {}
      console.log("Store methods:", Object.keys(store))
      return "Store test completed"
    } catch (error) {
      console.error("Store test error:", error)
      return "Store test failed"
    }
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5 // 5 minutes
    }
  }
})

// Регистрация Service Worker для PWA
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm("Доступно обновление приложения. Перезагрузить?")) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    // Приложение готово к работе офлайн
  }
})

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
)
