import { useState, useEffect, Suspense, useCallback } from "react"
import React from "react"
import { Layout } from "@/components/layout/Layout"
import { DataMigrationModal } from "@/components/migration/DataMigrationModal"

// Lazy load страниц для code splitting
const Dashboard = React.lazy(() => import("@/pages/Dashboard"))
const Transactions = React.lazy(() => import("@/pages/Transactions"))
const Analytics = React.lazy(() => import("@/pages/Analytics"))
import { useAuthStore } from "@/store/authStore"
import { useTransactionStoreSupabase } from "@/store/transactionStoreSupabase"
import { useCategoryStoreSupabase } from "@/store/categoryStoreSupabase"
import { useNetworkStatus } from "@/hooks/useNetworkStatus"
import { useOfflineSync } from "@/hooks/useOfflineSync"
import { getDataStats } from "@/utils/dataExport"

export const AppWithMigration: React.FC = () => {
  const [currentPage, setCurrentPage] = useState("dashboard")
  const [showMigrationModal, setShowMigrationModal] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  const { isAuthenticated, user, loading: authLoading } = useAuthStore()
  const { fetchTransactions, loadFromCache } = useTransactionStoreSupabase()
  const { fetchCategories } = useCategoryStoreSupabase()
  const { isOnline } = useNetworkStatus()
  const { syncNow, syncStatus } = useOfflineSync()

  // Инициализация данных после аутентификации
  useEffect(() => {
    const initializeData = async (): Promise<void> => {
      if (!isAuthenticated || !user || authLoading) {
        return
      }

      // Предотвращаем повторную инициализацию, но позволяем обновление при смене сети
      if (isInitialized && isOnline) {
        // Если уже инициализировались и сейчас онлайн, перезагружаем данные
        try {
          await Promise.all([fetchCategories(), fetchTransactions()])
        } catch {
          // Failed to refresh data
        }
        return
      }

      if (isInitialized) {
        return
      }

      try {
        // Initializing data for user

        if (isOnline) {
          // Онлайн: загружаем данные с сервера (fetchTransactions сначала загрузит кэш, потом сервер)
          await Promise.all([fetchCategories(), fetchTransactions()])
        } else {
          // Офлайн: загружаем только из кэша
          if (typeof window !== "undefined" && window.location.hostname === "localhost") {
            console.log("🔄 DEBUG AppWithMigration offline initialization starting")
          }

          try {
            // Загружаем категории из кэша
            const { loadFromCache: loadCategoriesFromCache } = useCategoryStoreSupabase.getState()
            await Promise.all([loadCategoriesFromCache(), loadFromCache()])

            if (typeof window !== "undefined" && window.location.hostname === "localhost") {
              console.log("✅ DEBUG AppWithMigration offline initialization success")
            }
          } catch (error) {
            // Failed to load from cache in offline mode - try individual loads
            if (typeof window !== "undefined" && window.location.hostname === "localhost") {
              console.error("⚠️ DEBUG AppWithMigration offline initialization failed:", error)
            }

            try {
              await loadFromCache()
            } catch (error2) {
              // Failed to load transactions from cache
              if (typeof window !== "undefined" && window.location.hostname === "localhost") {
                console.error(
                  "❌ DEBUG AppWithMigration failed to load transactions from cache:",
                  error2
                )
              }
            }
          }
        }

        // Проверяем, есть ли данные в localStorage для миграции
        const localData = getDataStats()
        if (localData.hasData) {
          // Found local data, showing migration modal
          setShowMigrationModal(true)
        }
        // Глобальные категории уже есть в БД, дополнительная инициализация не нужна

        setIsInitialized(true)
      } catch (_error) {
        // Error initializing data
        setIsInitialized(true)
      }
    }

    initializeData()
  }, [
    isAuthenticated,
    user,
    authLoading,
    fetchCategories,
    fetchTransactions,
    loadFromCache,
    isOnline,
    isInitialized
  ])

  // Автоматическая синхронизация при восстановлении сети
  useEffect(() => {
    if (isOnline && isAuthenticated && isInitialized && syncStatus.pendingOperations > 0) {
      // Небольшая задержка чтобы убедиться что соединение стабильно
      const timer = setTimeout(() => {
        syncNow().catch(() => {
          // Sync failed, will be retried later
        })
      }, 2000)

      return (): void => clearTimeout(timer)
    }
  }, [isOnline, isAuthenticated, isInitialized, syncStatus.pendingOperations, syncNow])

  const handleMigrationClose = useCallback((): void => {
    setShowMigrationModal(false)
    // После закрытия модала миграции обновляем данные
    fetchCategories()
    fetchTransactions()
  }, [fetchCategories, fetchTransactions])

  const renderPage = (): JSX.Element => {
    switch (currentPage) {
      case "dashboard":
        return (
          <Suspense fallback={<PageLoadingSpinner />}>
            <Dashboard onPageChange={setCurrentPage} />
          </Suspense>
        )
      case "transactions":
        return (
          <Suspense fallback={<PageLoadingSpinner />}>
            <Transactions />
          </Suspense>
        )
      case "analytics":
        return (
          <Suspense fallback={<PageLoadingSpinner />}>
            <Analytics />
          </Suspense>
        )
      case "settings":
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Настройки</h2>
            <p className="text-gray-600">Раздел настроек в разработке</p>
          </div>
        )
      default:
        return (
          <Suspense fallback={<PageLoadingSpinner />}>
            <Dashboard />
          </Suspense>
        )
    }
  }

  // Компонент загрузки страницы
  const PageLoadingSpinner = (): JSX.Element => (
    <div className="flex items-center justify-center py-12">
      <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      <span className="ml-2 text-gray-600">Загрузка...</span>
    </div>
  )

  // Показываем загрузку пока не инициализированы
  if (isAuthenticated && !isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Загрузка данных...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
        {renderPage()}
      </Layout>

      <DataMigrationModal isOpen={showMigrationModal} onClose={handleMigrationClose} />
    </>
  )
}
