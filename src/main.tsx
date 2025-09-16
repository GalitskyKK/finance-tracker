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
    debugStorage: () => string
  }
}

// Минимальная версия debugStorage для диагностики
if (typeof window !== "undefined") {
  window.debugStorage = () => {
    try {
      const transactions = localStorage.getItem("finance-tracker-transactions")
      const categories = localStorage.getItem("finance-tracker-categories")
      console.log("🔍 SIMPLE DEBUG:", {
        transactions: !!transactions,
        categories: !!categories,
        transactionsLength: transactions?.length || 0,
        categoriesLength: categories?.length || 0,
        localStorage: typeof localStorage,
        window: typeof window
      })
      return "✅ debugStorage работает"
    } catch (error) {
      console.error("❌ debugStorage error:", error)
      return "❌ ошибка debugStorage"
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
