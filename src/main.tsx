import React from "react"
import ReactDOM from "react-dom/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import App from "./App.tsx"
import "./index.css"
import { registerSW } from "virtual:pwa-register"
import type { Transaction, Category } from "./types"
// import "./utils/debugStorage" // Debug utils для localStorage

console.log("🚀 KashKontrol v1.2.8 starting...")
console.log("⚡ Built with React", React.version)

// Типы для debugStorage
declare global {
  interface Window {
    debugStorage: () => Promise<unknown>
    testTransactionSave: () => string
    clearStorage: () => string
    clearAllCaches: () => Promise<string>
    testStore: () => string
  }
}

// Минимальная версия debugStorage для диагностики
if (typeof window !== "undefined") {
  window.debugStorage = async (): Promise<unknown> => {
    console.log("🔍 Debug storage analysis...")
    try {
      // Проверяем localStorage
      const localTransactions = localStorage.getItem("finance-tracker-transactions")
      const localCategories = localStorage.getItem("finance-tracker-categories")

      // Проверяем IndexedDB
      let indexedDBTransactions = 0
      let indexedDBCategories = 0
      let indexedDBSupported = false

      // Retry механизм для IndexedDB (как в приложении)
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          // Attempting IndexedDB connection
          const indexedDB = window.indexedDB
          if (indexedDB) {
            indexedDBSupported = true

            // Используем СВЕЖЕЕ соединение каждый раз для избежания "connection is closing"
            await new Promise<void>((resolve) => {
              const freshRequest = indexedDB.open("finance-tracker-db", 2)

              freshRequest.onsuccess = (): void => {
                const db = freshRequest.result

                try {
                  // Проверяем поддержку транзакций
                  if (!db.objectStoreNames.contains("transactions")) {
                    db.close()
                    resolve()
                    return
                  }

                  // Получаем количество транзакций
                  const txTransaction = db.transaction(["transactions"], "readonly")
                  const txStore = txTransaction.objectStore("transactions")

                  const countRequest = txStore.count()
                  countRequest.onsuccess = (): void => {
                    indexedDBTransactions = countRequest.result

                    // Получаем количество категорий если есть
                    if (db.objectStoreNames.contains("categories")) {
                      try {
                        const catTransaction = db.transaction(["categories"], "readonly")
                        const catStore = catTransaction.objectStore("categories")
                        const catCountRequest = catStore.count()

                        catCountRequest.onsuccess = (): void => {
                          indexedDBCategories = catCountRequest.result
                          db.close()
                          resolve()
                        }
                        catCountRequest.onerror = (): void => {
                          db.close()
                          resolve()
                        }
                      } catch {
                        db.close()
                        resolve()
                      }
                    } else {
                      db.close()
                      resolve()
                    }
                  }
                  countRequest.onerror = (): void => {
                    db.close()
                    resolve()
                  }
                } catch (_error) {
                  console.log(`❌ debugStorage transaction error:`, _error)
                  db.close()
                  resolve()
                }
              }

              freshRequest.onerror = (): void => {
                console.log(`❌ debugStorage open error`)
                resolve()
              }

              freshRequest.onblocked = (): void => {
                console.log(`❌ debugStorage blocked`)
                resolve()
              }
            })

            // IndexedDB connection successful
            break
          } else {
            // IndexedDB not available
            break
          }
        } catch (_error) {
          if (attempt < 3) {
            await new Promise((resolve) => setTimeout(resolve, 500))
          } else {
            indexedDBSupported = false
          }
        }
      }

      const result = {
        localStorage: {
          transactions: !!localTransactions,
          categories: !!localCategories,
          transactionsLength: localTransactions
            ? (JSON.parse(localTransactions) as Transaction[]).length ?? 0
            : 0,
          categoriesLength: localCategories
            ? (JSON.parse(localCategories) as Category[]).length ?? 0
            : 0
        },
        indexedDB: {
          supported: indexedDBSupported,
          transactions: indexedDBTransactions,
          categories: indexedDBCategories
        },
        summary: {
          totalTransactions:
            indexedDBTransactions +
            (localTransactions ? (JSON.parse(localTransactions) as Transaction[]).length ?? 0 : 0),
          dataLocation:
            indexedDBTransactions > 0 ? "IndexedDB" : localTransactions ? "localStorage" : "none"
        }
      }

      console.log("🔍 COMPLETE DEBUG:", result)
      return result
    } catch (_error) {
      console.error("❌ debugStorage error:", _error)
      return "❌ ошибка debugStorage"
    }
  }

  // Дополнительные функции
  window.testTransactionSave = (): string => {
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

  window.clearStorage = (): string => {
    try {
      localStorage.removeItem("finance-tracker-transactions")
      localStorage.removeItem("finance-tracker-categories")
      return "✅ Storage cleared"
    } catch (_error) {
      return "❌ Clear failed"
    }
  }

  // Принудительная очистка всех кэшей PWA
  window.clearAllCaches = async (): Promise<string> => {
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
  window.testStore = (): string => {
    try {
      // @ts-expect-error - тестируем store напрямую
      const store =
        (window as unknown as { __TRANSACTION_STORE__?: Record<string, unknown> })
          .__TRANSACTION_STORE__ ?? {}
      console.log("Store methods:", Object.keys(store))
      return "Store test completed"
    } catch (_error) {
      console.error("Store test error:", _error)
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
