import { create } from "zustand"
import type { Transaction, CreateTransactionData, SupabaseTransactionRow } from "@/types"
import { supabase } from "@/lib/supabase"
import { offlineUtils } from "@/hooks/useOfflineSync"
import { offlineDataManager } from "@/utils/offlineDataManager"

interface TransactionState {
  transactions: Transaction[]
  loading: boolean
  error: string | null
  isOfflineMode: boolean
  lastSyncTime: number | null

  // Actions
  fetchTransactions: () => Promise<void>
  addTransaction: (transaction: CreateTransactionData) => Promise<void>
  addTransactionOffline: (transaction: CreateTransactionData) => Promise<void>
  updateTransaction: (id: string, updates: Partial<CreateTransactionData>) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
  loadFromCache: () => Promise<void>
  clearError: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string) => void
  setOfflineMode: (isOffline: boolean) => void
}

export const useTransactionStoreSupabase = create<TransactionState>((set, get) => ({
  transactions: [],
  loading: false,
  error: null,
  isOfflineMode: false,
  lastSyncTime: null,

  fetchTransactions: async (): Promise<void> => {
    console.log("🔄 Fetching transactions...")
    set({ loading: true, error: null })

    // Сначала загружаем из кэша
    try {
      const cachedTransactions = await offlineUtils.getTransactionsFromCache()
      console.log(`📦 Cache loaded: ${cachedTransactions.length} transactions`)

      if (cachedTransactions.length > 0) {
        set({
          transactions: cachedTransactions,
          isOfflineMode: false // Временно, проверим сеть далее
        })
        console.log(`✅ Cache data set to store: ${cachedTransactions.length} transactions`)
      } else {
        console.log("⚠️ No cached transactions found")
      }
    } catch (cacheError) {
      console.error("❌ Cache loading failed:", cacheError)
      // Failed to load transactions from cache
    }

    // Пытаемся загрузить с сервера
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select(
          `
          *,
          global_categories (
            id,
            name,
            color,
            icon,
            type
          )
        `
        )
        .order("date", { ascending: false })

      if (error) throw error

      // Преобразуем данные к нашему формату
      const serverTransactions: Transaction[] = (data as SupabaseTransactionRow[]).map(
        (row: SupabaseTransactionRow) => ({
          id: row.id,
          amount: parseFloat(row.amount),
          type: row.type,
          categoryId: row.category_id,
          description: row.description,
          date: row.date,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        })
      )

      // Получаем кэшированные данные для объединения
      const { transactions: currentTransactions } = get()

      // Объединяем с кэшированными данными, избегая дублирования
      const mergedTransactions = offlineDataManager.mergeTransactions(
        currentTransactions,
        serverTransactions
      )

      // Сохраняем объединенные данные в кэш
      try {
        await offlineUtils.saveTransactionsToCache(mergedTransactions)
      } catch (_cacheError) {
        // Failed to save transactions to cache
      }

      // Очищаем старые офлайн транзакции
      await offlineDataManager.cleanupOldOfflineTransactions()

      set({
        transactions: mergedTransactions,
        loading: false,
        isOfflineMode: false,
        lastSyncTime: Date.now()
      })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch transactions"

      // Если есть кэшированные данные, используем их
      const { transactions } = get()
      if (transactions.length > 0) {
        set({
          loading: false,
          isOfflineMode: true,
          error: null
        })
      } else {
        set({
          error: errorMessage,
          loading: false,
          isOfflineMode: true
        })
      }
    }
  },

  loadFromCache: async (): Promise<void> => {
    set({ loading: true, error: null })

    try {
      const cachedTransactions = await offlineUtils.getTransactionsFromCache()

      set({
        transactions: cachedTransactions,
        loading: false,
        isOfflineMode: true
      })
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load transactions from cache"

      set({
        error: errorMessage,
        loading: false,
        isOfflineMode: true
      })
    }
  },

  addTransaction: async (transactionData: CreateTransactionData): Promise<void> => {
    console.log("🚨🚨🚨 STORE addTransaction CALLED:", transactionData.description)
    alert(`🚨 STORE: addTransaction ВЫЗВАН для "${transactionData.description}"`)
    set({ loading: true, error: null })

    try {
      const {
        data: { user }
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      const result = await supabase
        .from("transactions")
        .insert([
          {
            user_id: user.id,
            amount: transactionData.amount,
            type: transactionData.type,
            category_id: transactionData.categoryId,
            description: transactionData.description,
            date: transactionData.date
          }
        ])
        .select()
        .single()

      if (result.error) throw result.error
      if (!result.data) throw new Error("No data returned from insert")

      const transactionRow = result.data as SupabaseTransactionRow

      // Создаем объект транзакции в нашем формате
      const newTransaction: Transaction = {
        id: transactionRow.id,
        amount: parseFloat(transactionRow.amount),
        type: transactionRow.type,
        categoryId: transactionRow.category_id,
        description: transactionRow.description,
        date: transactionRow.date,
        createdAt: transactionRow.created_at,
        updatedAt: transactionRow.updated_at
      }

      // Добавляем в локальное состояние
      const { transactions } = get()
      const updatedTransactions = [newTransaction, ...transactions]

      // КРИТИЧНО: Сохраняем в кэш для офлайн доступа
      try {
        console.log("🚨🚨🚨 CACHING START:", updatedTransactions.length, "transactions")
        alert(`🚨 КЭШИРОВАНИЕ: Начинаю кэшировать ${updatedTransactions.length} транзакций`)
        await offlineUtils.saveTransactionsToCache(updatedTransactions)
        console.log(`✅ Transaction cached for offline access`)
        alert("🚨 КЭШИРОВАНИЕ ЗАВЕРШЕНО!")
      } catch (cacheError) {
        console.error("❌ Caching failed:", cacheError)
        alert(`🚨 ОШИБКА КЭШИРОВАНИЯ: ${cacheError}`)
        // Failed to save to cache, but transaction was saved to server
      }

      set({
        transactions: updatedTransactions,
        loading: false
      })
    } catch (error: unknown) {
      console.log("🔴 addTransaction error:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to add transaction"

      // TODO: Здесь должна быть офлайн логика для сохранения в кэш
      console.log("🟡 Should save to offline cache here")

      set({
        error: errorMessage,
        loading: false
      })
      throw error
    }
  },

  updateTransaction: async (id: string, updates: Partial<CreateTransactionData>): Promise<void> => {
    set({ loading: true, error: null })

    try {
      const updateData: Record<string, unknown> = {}

      if (updates.amount !== undefined) updateData.amount = updates.amount
      if (updates.type !== undefined) updateData.type = updates.type
      if (updates.categoryId !== undefined) updateData.category_id = updates.categoryId
      if (updates.description !== undefined) updateData.description = updates.description
      if (updates.date !== undefined) updateData.date = updates.date

      const result = await supabase
        .from("transactions")
        .update(updateData)
        .eq("id", id)
        .select()
        .single()

      if (result.error) throw result.error
      if (!result.data) throw new Error("No data returned from update")

      const transactionRow = result.data as SupabaseTransactionRow

      // Обновляем локальное состояние
      const { transactions } = get()
      const updatedTransactions = transactions.map((transaction) =>
        transaction.id === id
          ? {
              ...transaction,
              amount: transactionRow.amount
                ? parseFloat(transactionRow.amount)
                : transaction.amount,
              type: transactionRow.type ?? transaction.type,
              categoryId: transactionRow.category_id ?? transaction.categoryId,
              description: transactionRow.description ?? transaction.description,
              date: transactionRow.date ?? transaction.date,
              updatedAt: transactionRow.updated_at
            }
          : transaction
      )

      set({
        transactions: updatedTransactions,
        loading: false
      })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update transaction"
      set({
        error: errorMessage,
        loading: false
      })
      throw error
    }
  },

  deleteTransaction: async (id: string): Promise<void> => {
    set({ loading: true, error: null })

    try {
      const { error } = await supabase.from("transactions").delete().eq("id", id)

      if (error) throw error

      // Удаляем из локального состояния
      const { transactions } = get()
      const updatedTransactions = transactions.filter((transaction) => transaction.id !== id)

      set({
        transactions: updatedTransactions,
        loading: false
      })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete transaction"
      // console.error("Error deleting transaction:", error)
      set({
        error: errorMessage,
        loading: false
      })
      throw error
    }
  },

  addTransactionOffline: async (transactionData: CreateTransactionData): Promise<void> => {
    console.log("🚨🚨🚨 STORE addTransactionOffline CALLED:", transactionData.description)
    alert(`🚨 STORE: addTransactionOffline ВЫЗВАН для "${transactionData.description}"`)
    set({ loading: true, error: null })

    try {
      // Используем offlineDataManager для создания офлайн транзакции
      const offlineTransaction = await offlineDataManager.createOfflineTransaction(transactionData)

      // Добавляем в локальное состояние
      const { transactions } = get()
      const updatedTransactions = [offlineTransaction, ...transactions]

      // Обновляем кэш с новыми данными
      console.log("🚨🚨🚨 OFFLINE CACHING START:", updatedTransactions.length, "transactions")
      alert(`🚨 ОФЛАЙН КЭШИРОВАНИЕ: Начинаю кэшировать ${updatedTransactions.length} транзакций`)
      await offlineUtils.saveTransactionsToCache(updatedTransactions)
      alert("🚨 ОФЛАЙН КЭШИРОВАНИЕ ЗАВЕРШЕНО!")

      set({
        transactions: updatedTransactions,
        loading: false,
        isOfflineMode: true
      })
    } catch (error: unknown) {
      console.log("🔴 addTransactionOffline error:", error)
      const errorMessage =
        error instanceof Error ? error.message : "Failed to add transaction offline"
      set({
        error: errorMessage,
        loading: false
      })
      throw error
    }
  },

  clearError: (): void => set({ error: null }),
  setLoading: (loading: boolean): void => set({ loading }),
  setError: (error: string): void => set({ error }),
  setOfflineMode: (isOffline: boolean): void => set({ isOfflineMode: isOffline })
}))

// Real-time подписка на изменения транзакций
supabase
  .channel("transactions")
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "transactions"
    },
    (_payload) => {
      // При изменениях извне - обновляем данные
      const store = useTransactionStoreSupabase.getState()
      if (!store.loading) {
        store.fetchTransactions()
      }
    }
  )
  .subscribe()
