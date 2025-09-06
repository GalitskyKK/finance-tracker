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
import {
  useCategoryStoreSupabase,
  initializeDefaultCategories
} from "@/store/categoryStoreSupabase"
import { getDataStats } from "@/utils/dataExport"

export const AppWithMigration: React.FC = () => {
  const [currentPage, setCurrentPage] = useState("dashboard")
  const [showMigrationModal, setShowMigrationModal] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  const { isAuthenticated, user, loading: authLoading } = useAuthStore()
  const { fetchTransactions } = useTransactionStoreSupabase()
  const { fetchCategories } = useCategoryStoreSupabase()

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

        // Загружаем категории и транзакции из Supabase
        await Promise.all([fetchCategories(), fetchTransactions()])

        // Проверяем, есть ли данные в localStorage для миграции
        const localData = getDataStats()
        if (localData.hasData) {
          // Found local data, showing migration modal
          setShowMigrationModal(true)
        } else {
          // Если нет локальных данных - создаем дефолтные категории если их нет
          await initializeDefaultCategories()
          await fetchCategories()
        }

        setIsInitialized(true)
      } catch (_error) {
        // Error initializing data
        setIsInitialized(true)
      }
    }

    initializeData()
  }, [isAuthenticated, user, authLoading]) // Убираем isInitialized, fetchCategories, fetchTransactions из зависимостей

  const handleMigrationClose = useCallback((): void => {
    setShowMigrationModal(false)
    // После закрытия модала миграции обновляем данные
    fetchCategories()
    fetchTransactions()
  }, [])

  const renderPage = (): JSX.Element => {
    switch (currentPage) {
      case "dashboard":
        return (
          <Suspense fallback={<PageLoadingSpinner />}>
            <Dashboard />
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
