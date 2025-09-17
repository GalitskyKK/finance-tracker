import React from "react"
import ReactDOM from "react-dom/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import App from "./App.tsx"
import "./index.css"
import { registerSW } from "virtual:pwa-register"
// import "./utils/debugStorage" // Debug utils для localStorage

console.log("🚨🚨🚨 FINANCE TRACKER v1.2.6-20250917 LOADING! 🚨🚨🚨")
console.log("🚨 React version:", React.version)
console.log("🚨 TIMESTAMP BUILD:", new Date().toISOString())
alert("🚨 НОВАЯ ВЕРСИЯ v1.2.6-20250917 ЗАГРУЗИЛАСЬ! Если видите это - версия обновилась!")

// Типы для debugStorage
declare global {
  interface Window {
    debugStorage: () => any
    testTransactionSave: () => string
    clearStorage: () => string
    clearAllCaches: () => Promise<string>
    testStore: () => string
  }
}

// Минимальная версия debugStorage для диагностики
if (typeof window !== "undefined") {
  window.debugStorage = async () => {
    console.log("🔥 debugStorage v2.0 called!")
    try {
      // Проверяем localStorage
      const localTransactions = localStorage.getItem("finance-tracker-transactions")
      const localCategories = localStorage.getItem("finance-tracker-categories")

      // Проверяем IndexedDB
      let indexedDBTransactions = 0
      let indexedDBCategories = 0
      let indexedDBSupported = false

      try {
        const indexedDB = window.indexedDB
        if (indexedDB) {
          indexedDBSupported = true

          // Пытаемся открыть нашу БД
          const dbRequest = indexedDB.open("FinanceTrackerDB", 2)

          await new Promise((resolve) => {
            dbRequest.onsuccess = async () => {
              try {
                const db = dbRequest.result

                if (db.objectStoreNames.contains("transactions")) {
                  const transactionStore = db
                    .transaction(["transactions"], "readonly")
                    .objectStore("transactions")
                  const transactionRequest = transactionStore.getAll()

                  transactionRequest.onsuccess = () => {
                    indexedDBTransactions = transactionRequest.result.length

                    if (db.objectStoreNames.contains("categories")) {
                      const categoryStore = db
                        .transaction(["categories"], "readonly")
                        .objectStore("categories")
                      const categoryRequest = categoryStore.getAll()

                      categoryRequest.onsuccess = () => {
                        indexedDBCategories = categoryRequest.result.length
                        resolve(true)
                      }
                      categoryRequest.onerror = () => resolve(true)
                    } else {
                      resolve(true)
                    }
                  }
                  transactionRequest.onerror = () => resolve(true)
                } else {
                  resolve(true)
                }

                db.close()
              } catch (error) {
                resolve(true)
              }
            }
            dbRequest.onerror = () => resolve(true)
            dbRequest.onblocked = () => resolve(true)
          })
        }
      } catch (error) {
        console.log("IndexedDB check error:", error)
      }

      const result = {
        localStorage: {
          transactions: !!localTransactions,
          categories: !!localCategories,
          transactionsLength: localTransactions?.length || 0,
          categoriesLength: localCategories?.length || 0
        },
        indexedDB: {
          supported: indexedDBSupported,
          transactions: indexedDBTransactions,
          categories: indexedDBCategories
        },
        summary: {
          totalTransactions:
            indexedDBTransactions || (localTransactions ? JSON.parse(localTransactions).length : 0),
          dataLocation:
            indexedDBTransactions > 0 ? "IndexedDB" : localTransactions ? "localStorage" : "none"
        }
      }

      console.log("🔍 COMPLETE DEBUG:", result)
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

  // Принудительная очистка всех кэшей PWA
  window.clearAllCaches = async () => {
    try {
      // Очищаем localStorage
      localStorage.clear()
      console.log("✅ localStorage cleared")

      // Очищаем все кэши PWA
      const cacheNames = await caches.keys()
      await Promise.all(cacheNames.map((name) => caches.delete(name)))
      console.log("✅ PWA caches cleared:", cacheNames)

      // Отключаем Service Worker
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations()
        await Promise.all(registrations.map((reg) => reg.unregister()))
        console.log("✅ Service Workers unregistered")
      }

      alert("🧹 ВСЕ КЭШИ ОЧИЩЕНЫ! Обновите страницу.")
      return "✅ Все кэши очищены"
    } catch (error) {
      alert(`❌ Ошибка очистки кэшей: ${error}`)
      return `❌ ошибка: ${error}`
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

// АГРЕССИВНОЕ ОБНОВЛЕНИЕ Service Worker для PWA
const updateSW = registerSW({
  immediate: true, // Немедленная регистрация
  onNeedRefresh() {
    console.log("🔄 SW UPDATE AVAILABLE - FORCE RELOADING!")
    alert("🔄 ОБНОВЛЕНИЕ ДОСТУПНО! Принудительно перезагружаем...")
    // ПРИНУДИТЕЛЬНО перезагружаем страницу при обновлении
    updateSW(true)
    window.location.reload()
  },
  onRegistered(registration) {
    console.log("📱 SW REGISTERED:", registration?.scope)
    // Принудительно проверяем обновления каждые 10 секунд
    if (registration) {
      setInterval(() => {
        console.log("🔍 Checking for SW updates...")
        registration.update()
      }, 10000)
    }
  },
  onOfflineReady() {
    console.log("📴 SW OFFLINE READY")
    // Приложение готово к работе офлайн
  }
})

ReactDOM.createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
)

console.log("🔥 FINANCE TRACKER v2.0 STARTED!")
