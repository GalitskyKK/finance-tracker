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
// import { useOfflineSync } from "@/hooks/useOfflineSync" // Временно отключен
import { getDataStats } from "@/utils/dataExport"

export const AppWithMigration: React.FC = () => {
  const [currentPage, setCurrentPage] = useState("dashboard")
  const [showMigrationModal, setShowMigrationModal] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  const { isAuthenticated, user, loading: authLoading } = useAuthStore()
  // Removed unused: fetchTransactions, loadFromCache, fetchCategories, syncNow, syncStatus
  const { isOnline } = useNetworkStatus()

  // Инициализация данных после аутентификации
  useEffect(() => {
    const initializeData = async (): Promise<void> => {
      if (!isAuthenticated || !user || authLoading) {
        return
      }

      // Предотвращаем повторную инициализацию
      if (isInitialized) {
        return
      }

      try {
        // Initializing data for user

        console.log(`🔄 Initializing data in ${isOnline ? "ONLINE" : "OFFLINE"} mode`)

        // Получаем свежие функции из store
        const { fetchTransactions: freshFetchTransactions, loadFromCache: freshLoadFromCache } =
          useTransactionStoreSupabase.getState()
        const { fetchCategories: freshFetchCategories, loadFromCache: loadCategoriesFromCache } =
          useCategoryStoreSupabase.getState()

        if (isOnline) {
          // Онлайн: загружаем данные с сервера (fetchTransactions сначала загрузит кэш, потом сервер)
          await Promise.all([freshFetchCategories(), freshFetchTransactions()])
          console.log("✅ Online data loaded")
        } else {
          // Офлайн: загружаем только из кэша
          try {
            await Promise.all([loadCategoriesFromCache(), freshLoadFromCache()])
            console.log("✅ Offline data loaded from cache")
          } catch (error) {
            console.error("❌ Offline loading failed:", error)
            // Failed to load from cache in offline mode - try individual loads
            try {
              await freshLoadFromCache()
            } catch (error2) {
              // Failed to load transactions from cache
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
    user?.id, // Только ID пользователя, не весь объект
    authLoading,
    isInitialized // Убираем isOnline чтобы не перезапускать при смене сети
    // Убираем функции store - они могут пересоздаваться
  ])

  // ВРЕМЕННО ОТКЛЮЧЕНО: Автоматическая синхронизация при восстановлении сети
  // (для диагностики множественных вызовов кэширования)
  /*
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
  */

  const handleMigrationClose = useCallback((): void => {
    setShowMigrationModal(false)
    // После закрытия модала миграции обновляем данные
    const { fetchCategories: freshFetchCategories } = useCategoryStoreSupabase.getState()
    const { fetchTransactions: freshFetchTransactions } = useTransactionStoreSupabase.getState()
    freshFetchCategories()
    freshFetchTransactions()
  }, [])

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
