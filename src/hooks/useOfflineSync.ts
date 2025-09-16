import { useState, useEffect, useCallback } from "react"
import { indexedDBManager } from "@/utils/indexedDB"
import { useNetworkStatus } from "@/hooks/useNetworkStatus"
import { supabaseSync } from "@/utils/supabaseSync"
import { offlineDataManager } from "@/utils/offlineDataManager"
import type { Category } from "@/types/category"
import type { Transaction, CreateTransactionData } from "@/types/transaction"

interface SyncStatus {
  isSyncing: boolean
  lastSyncTime: number | null
  pendingOperations: number
  error: string | null
}

// Типизированные операции для офлайн очереди
interface OfflineTransactionOperation {
  type: "create" | "update" | "delete"
  table: "transactions"
  data: CreateTransactionData & { tempId?: string }
}

interface OfflineCategoryOperation {
  type: "create" | "update" | "delete"
  table: "categories"
  data: Category
}

type OfflineOperationInput = OfflineTransactionOperation | OfflineCategoryOperation

interface UseOfflineSyncReturn {
  syncStatus: SyncStatus
  isOfflineDataAvailable: boolean
  syncNow: () => Promise<void>
  addOfflineOperation: (operation: OfflineOperationInput) => Promise<string>
  clearOfflineData: () => Promise<void>
}

export const useOfflineSync = (): UseOfflineSyncReturn => {
  const { isOnline } = useNetworkStatus()
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isSyncing: false,
    lastSyncTime: null,
    pendingOperations: 0,
    error: null
  })
  const [isOfflineDataAvailable, setIsOfflineDataAvailable] = useState(false)

  // Инициализация IndexedDB при загрузке
  useEffect(() => {
    const initDB = async (): Promise<void> => {
      try {
        await indexedDBManager.init()

        // Проверяем наличие офлайн данных
        const hasData = await indexedDBManager.isDataAvailable()
        setIsOfflineDataAvailable(hasData)

        // Загружаем информацию о последней синхронизации
        const lastSync = await indexedDBManager.getLastSyncTime()
        const queue = await indexedDBManager.getOfflineQueue()

        setSyncStatus((prev) => ({
          ...prev,
          lastSyncTime: lastSync,
          pendingOperations: queue.length
        }))
      } catch (error) {
        // Failed to initialize IndexedDB - provide detailed error for PWA debugging
        const errorMessage = error instanceof Error ? error.message : "Unknown error"
        setSyncStatus((prev) => ({
          ...prev,
          error: `Офлайн хранилище недоступно: ${errorMessage}. Будет использован временный режим.`
        }))
      }
    }

    initDB()
  }, [])

  // Создаем стабильную функцию синхронизации
  const syncNow = useCallback(async (): Promise<void> => {
    if (!isOnline) {
      throw new Error("Нет подключения к интернету")
    }

    if (syncStatus.isSyncing) {
      return // Уже синхронизируемся
    }

    setSyncStatus((prev) => ({ ...prev, isSyncing: true, error: null }))

    try {
      // Получаем очередь несинхронизированных операций
      const queue = await indexedDBManager.getOfflineQueue()

      if (queue.length === 0) {
        setSyncStatus((prev) => ({
          ...prev,
          isSyncing: false,
          lastSyncTime: Date.now()
        }))
        return
      }

      // Проверяем доступность Supabase
      const isSupabaseAvailable = await supabaseSync.isSupabaseAvailable()
      if (!isSupabaseAvailable) {
        throw new Error("Supabase недоступен")
      }

      // Синхронизируем операции пакетами
      const { successful, failed } = await supabaseSync.syncBatch(queue, 3)

      // Помечаем успешные операции как синхронизированные
      for (const { operationId, newId } of successful) {
        await indexedDBManager.markOperationAsSynced(operationId)

        // Если получили новый ID (для созданных транзакций), обновляем локальные данные
        if (newId) {
          try {
            // Находим операцию в очереди чтобы получить tempId
            const operation = queue.find((op) => op.id === operationId)

            if (operation && operation.table === "transactions") {
              const operationData = operation.data as CreateTransactionData & { tempId?: string }
              if (operationData.tempId) {
                // Обновляем ID транзакции в IndexedDB
                await offlineDataManager.replaceTemporaryId(operationData.tempId, newId)
              }
            }
          } catch (_error) {
            // Failed to update temporary ID
            // Не критично, транзакция уже синхронизирована
          }
        }
      }

      // Логируем неудачные операции для повторной попытки
      if (failed.length > 0) {
        const errorMessage = `Не удалось синхронизировать ${failed.length} операций`
        setSyncStatus((prev) => ({
          ...prev,
          error: errorMessage
        }))
      }

      // Очищаем синхронизированные операции
      await indexedDBManager.clearSyncedOperations()
      await indexedDBManager.setLastSyncTime()

      setSyncStatus((prev) => ({
        ...prev,
        isSyncing: false,
        lastSyncTime: Date.now(),
        pendingOperations: 0
      }))
    } catch (_error) {
      // Sync failed
      setSyncStatus((prev) => ({
        ...prev,
        isSyncing: false,
        error: "Ошибка синхронизации данных"
      }))
    }
  }, [isOnline, syncStatus.isSyncing])

  // Автоматическая синхронизация при восстановлении сети
  useEffect(() => {
    if (isOnline && syncStatus.pendingOperations > 0) {
      // Небольшая задержка чтобы убедиться что соединение стабильно
      const timer = setTimeout(() => {
        syncNow().catch((): void => {
          // Auto sync failed, will retry later
        })
      }, 2000)

      return (): void => clearTimeout(timer)
    }
  }, [isOnline, syncStatus.pendingOperations, syncNow])

  // Добавление операции в офлайн очередь
  const addOfflineOperation = useCallback(
    async (operation: OfflineOperationInput): Promise<string> => {
      try {
        const operationId = await indexedDBManager.addToOfflineQueue({
          ...operation,
          timestamp: Date.now(),
          synced: false
        })

        // Обновляем счетчик pending операций
        const queue = await indexedDBManager.getOfflineQueue()
        setSyncStatus((prev) => ({
          ...prev,
          pendingOperations: queue.length
        }))

        return operationId
      } catch (_error) {
        // Failed to add offline operation
        throw new Error("Не удалось сохранить операцию для синхронизации")
      }
    },
    []
  )

  // Очистка офлайн данных
  const clearOfflineData = useCallback(async (): Promise<void> => {
    try {
      await indexedDBManager.clearAllData()
      setIsOfflineDataAvailable(false)
      setSyncStatus((prev) => ({
        ...prev,
        lastSyncTime: null,
        pendingOperations: 0,
        error: null
      }))
    } catch (_error) {
      // Failed to clear offline data
      throw new Error("Не удалось очистить офлайн данные")
    }
  }, [])

  return {
    syncStatus,
    isOfflineDataAvailable,
    syncNow,
    addOfflineOperation,
    clearOfflineData
  }
}

// Утилитарные функции для работы с офлайн данными
export const offlineUtils = {
  // Сохранение категорий в офлайн хранилище
  saveCategoriesToCache: async (categories: Category[]): Promise<void> => {
    await indexedDBManager.saveCategories(categories)
  },

  // Получение категорий из офлайн хранилища
  getCategoriesFromCache: async (): Promise<Category[]> => {
    return await indexedDBManager.getCategories()
  },

  // Сохранение транзакций в офлайн хранилище
  saveTransactionsToCache: async (transactions: Transaction[]): Promise<void> => {
    await indexedDBManager.saveTransactions(transactions)
  },

  // Получение транзакций из офлайн хранилища
  getTransactionsFromCache: async (): Promise<Transaction[]> => {
    return await indexedDBManager.getTransactions()
  },

  // Сохранение новой транзакции офлайн (для последующей синхронизации)
  saveTransactionOffline: async (transaction: Transaction): Promise<void> => {
    await indexedDBManager.saveTransaction(transaction)
  }
}
