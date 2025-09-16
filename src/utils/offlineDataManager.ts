import type { Transaction, CreateTransactionData } from "@/types/transaction"
import type { Category } from "@/types/category"
import { indexedDBManager } from "./indexedDB"

/**
 * Менеджер для предотвращения дублирования и конфликтов офлайн данных
 */
class OfflineDataManager {
  private readonly TEMP_ID_PREFIX = "temp_"
  private readonly OFFLINE_ID_PREFIX = "offline_"

  /**
   * Проверяет является ли ID временным (созданным офлайн)
   */
  isTemporaryId(id: string): boolean {
    return id.startsWith(this.TEMP_ID_PREFIX) || id.startsWith(this.OFFLINE_ID_PREFIX)
  }

  /**
   * Генерирует временный ID для офлайн транзакции
   */
  generateTemporaryId(): string {
    return `${this.TEMP_ID_PREFIX}${crypto.randomUUID()}`
  }

  /**
   * Создает офлайн транзакцию с временным ID
   */
  async createOfflineTransaction(data: CreateTransactionData): Promise<Transaction> {
    console.log("🟡 createOfflineTransaction called:", data)
    const tempId = this.generateTemporaryId()
    const now = new Date().toISOString()

    const offlineTransaction: Transaction = {
      id: tempId,
      amount: data.amount,
      type: data.type,
      categoryId: data.categoryId,
      description: data.description,
      date: data.date,
      createdAt: now,
      updatedAt: now
    }

    // Сохраняем в IndexedDB
    await indexedDBManager.saveTransaction(offlineTransaction)

    // Добавляем в очередь синхронизации
    await indexedDBManager.addToOfflineQueue({
      type: "create",
      table: "transactions",
      data: { ...data, tempId },
      timestamp: Date.now(),
      synced: false
    })

    return offlineTransaction
  }

  /**
   * Фильтрует транзакции, разделяя на синхронизированные и офлайн
   */
  separateTransactions(transactions: Transaction[]): {
    syncedTransactions: Transaction[]
    offlineTransactions: Transaction[]
  } {
    const syncedTransactions: Transaction[] = []
    const offlineTransactions: Transaction[] = []

    for (const transaction of transactions) {
      if (this.isTemporaryId(transaction.id)) {
        offlineTransactions.push(transaction)
      } else {
        syncedTransactions.push(transaction)
      }
    }

    return { syncedTransactions, offlineTransactions }
  }

  /**
   * Объединяет данные из кэша и сервера, избегая дублирования
   */
  mergeTransactions(
    cachedTransactions: Transaction[],
    serverTransactions: Transaction[]
  ): Transaction[] {
    const { syncedTransactions: cachedSynced, offlineTransactions } =
      this.separateTransactions(cachedTransactions)

    // Создаем Map для быстрого поиска серверных транзакций
    const serverMap = new Map<string, Transaction>()
    for (const transaction of serverTransactions) {
      serverMap.set(transaction.id, transaction)
    }

    // Удаляем из кэшированных те, что есть на сервере (но с более новой версией)
    const filteredCached = cachedSynced.filter((cached) => {
      const serverVersion = serverMap.get(cached.id)
      if (!serverVersion) return true // Нет на сервере, оставляем

      // Если серверная версия новее, удаляем кэшированную
      return new Date(cached.updatedAt) > new Date(serverVersion.updatedAt)
    })

    // Объединяем: серверные + уникальные кэшированные + офлайн
    const result = [...serverTransactions, ...filteredCached, ...offlineTransactions]

    // Сортируем по дате
    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  /**
   * Очищает устаревшие офлайн транзакции (старше 30 дней)
   */
  async cleanupOldOfflineTransactions(): Promise<void> {
    const transactions = await indexedDBManager.getTransactions()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    for (const transaction of transactions) {
      if (this.isTemporaryId(transaction.id) && new Date(transaction.createdAt) < thirtyDaysAgo) {
        await indexedDBManager.deleteTransaction(transaction.id)
      }
    }
  }

  /**
   * Проверяет возможные конфликты данных
   */
  async detectDataConflicts(): Promise<{
    duplicateCategories: Category[]
    conflictingTransactions: Transaction[]
  }> {
    const categories = await indexedDBManager.getCategories()
    const transactions = await indexedDBManager.getTransactions()

    // Находим дублированные категории (по имени и типу)
    const categoryMap = new Map<string, Category[]>()
    for (const category of categories) {
      const key = `${category.name}_${category.type}`
      if (!categoryMap.has(key)) {
        categoryMap.set(key, [])
      }
      categoryMap.get(key)!.push(category)
    }

    const duplicateCategories = Array.from(categoryMap.values())
      .filter((group) => group.length > 1)
      .flat()

    // Находим конфликтующие транзакции (офлайн транзакции с несуществующими категориями)
    const categoryIds = new Set(categories.map((c) => c.id))
    const conflictingTransactions = transactions.filter(
      (t) => this.isTemporaryId(t.id) && !categoryIds.has(t.categoryId)
    )

    return { duplicateCategories, conflictingTransactions }
  }

  /**
   * Получает статистику офлайн данных
   */
  async getOfflineStats(): Promise<{
    totalTransactions: number
    offlineTransactions: number
    pendingSyncOperations: number
    lastSyncTime: number | null
    cacheSize: string
  }> {
    const transactions = await indexedDBManager.getTransactions()
    const { offlineTransactions } = this.separateTransactions(transactions)
    const queue = await indexedDBManager.getOfflineQueue()
    const lastSync = await indexedDBManager.getLastSyncTime()

    // Примерный расчет размера кэша
    const categoriesCount = (await indexedDBManager.getCategories()).length
    const approximateSize = transactions.length * 0.5 + categoriesCount * 0.1 // KB
    const cacheSize =
      approximateSize > 1024
        ? `${(approximateSize / 1024).toFixed(1)} MB`
        : `${approximateSize.toFixed(0)} KB`

    return {
      totalTransactions: transactions.length,
      offlineTransactions: offlineTransactions.length,
      pendingSyncOperations: queue.length,
      lastSyncTime: lastSync,
      cacheSize
    }
  }

  /**
   * Заменяет временный ID транзакции на реальный после синхронизации
   */
  async replaceTemporaryId(tempId: string, realId: string): Promise<void> {
    // Получаем транзакцию с временным ID
    const transaction = await indexedDBManager.getTransaction(tempId)
    if (!transaction) {
      return // Транзакция не найдена
    }

    // Создаем новую транзакцию с реальным ID
    const updatedTransaction: Transaction = {
      ...transaction,
      id: realId
    }

    // Сохраняем с новым ID и удаляем старую
    await indexedDBManager.saveTransaction(updatedTransaction)
    await indexedDBManager.deleteTransaction(tempId)
  }
}

export const offlineDataManager = new OfflineDataManager()
