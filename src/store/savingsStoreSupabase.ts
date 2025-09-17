import { create } from "zustand"
import type {
  SavingsGoal,
  CreateSavingsGoalData,
  UpdateSavingsGoalData,
  SavingsTransaction,
  CreateSavingsTransactionData,
  SupabaseSavingsGoalRow,
  SupabaseSavingsTransactionRow,
  BalanceWithSavings
} from "@/types"
import { supabase } from "@/lib/supabase"
import { offlineUtils } from "@/hooks/useOfflineSync"

interface SavingsState {
  savingsGoals: SavingsGoal[]
  savingsTransactions: SavingsTransaction[]
  loading: boolean
  error: string | null
  isOfflineMode: boolean
  lastSyncTime: number | null

  // Actions для сберегательных целей
  fetchSavingsGoals: () => Promise<void>
  addSavingsGoal: (goalData: CreateSavingsGoalData) => Promise<void>
  updateSavingsGoal: (goalData: UpdateSavingsGoalData) => Promise<void>
  deleteSavingsGoal: (id: string) => Promise<void>
  toggleSavingsGoal: (id: string, isActive: boolean) => Promise<void>

  // Actions для транзакций сбережений
  fetchSavingsTransactions: (goalId?: string) => Promise<void>
  addSavingsTransaction: (transactionData: CreateSavingsTransactionData) => Promise<void>
  deleteSavingsTransaction: (id: string) => Promise<void>

  // Utility actions
  getSavingsGoalById: (id: string) => SavingsGoal | undefined
  getTotalSavingsAmount: () => number
  getBalanceWithSavings: (totalBalance: number) => BalanceWithSavings
  loadFromCache: () => Promise<void>
  clearError: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string) => void
  setOfflineMode: (isOffline: boolean) => void
}

export const useSavingsStoreSupabase = create<SavingsState>((set, get) => ({
  savingsGoals: [],
  savingsTransactions: [],
  loading: false,
  error: null,
  isOfflineMode: false,
  lastSyncTime: null,

  fetchSavingsGoals: async (): Promise<void> => {
    console.log("💎 Fetching savings goals...")
    set({ loading: true, error: null })

    // Сначала загружаем из кэша
    try {
      const cachedGoals = await offlineUtils.getSavingsGoalsFromCache()
      console.log(`📦 Cache loaded: ${cachedGoals.length} savings goals`)

      if (cachedGoals.length > 0) {
        set({
          savingsGoals: cachedGoals,
          isOfflineMode: false
        })
        console.log(`✅ Cache data set to store: ${cachedGoals.length} savings goals`)
      }
    } catch (cacheError) {
      console.error("❌ Cache loading failed:", cacheError)
    }

    // Пытаемся загрузить с сервера
    try {
      const { data, error } = await supabase
        .from("savings_goals")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error

      // Преобразуем данные к нашему формату
      const serverGoals: SavingsGoal[] = (data as SupabaseSavingsGoalRow[]).map(
        (row: SupabaseSavingsGoalRow) => ({
          id: row.id,
          name: row.name,
          description: row.description,
          targetAmount: parseFloat(row.target_amount),
          currentAmount: parseFloat(row.current_amount),
          color: row.color,
          icon: row.icon,
          deadline: row.deadline || undefined,
          isActive: row.is_active,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        })
      )

      // Сохраняем в кэш
      try {
        await offlineUtils.saveSavingsGoalsToCache(serverGoals)
      } catch (_cacheError) {
        // Failed to save to cache
      }

      set({
        savingsGoals: serverGoals,
        loading: false,
        isOfflineMode: false,
        lastSyncTime: Date.now()
      })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch savings goals"

      // Если есть кэшированные данные, используем их
      const { savingsGoals } = get()
      if (savingsGoals.length > 0) {
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

  addSavingsGoal: async (goalData: CreateSavingsGoalData): Promise<void> => {
    set({ loading: true, error: null })

    try {
      const {
        data: { user }
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      const result = await supabase
        .from("savings_goals")
        .insert([
          {
            user_id: user.id,
            name: goalData.name,
            description: goalData.description,
            target_amount: goalData.targetAmount,
            color: goalData.color,
            icon: goalData.icon,
            deadline: goalData.deadline || null
          }
        ])
        .select()
        .single()

      if (result.error) throw result.error
      if (!result.data) throw new Error("No data returned from insert")

      const goalRow = result.data as SupabaseSavingsGoalRow

      // Создаем объект цели в нашем формате
      const newGoal: SavingsGoal = {
        id: goalRow.id,
        name: goalRow.name,
        description: goalRow.description,
        targetAmount: parseFloat(goalRow.target_amount),
        currentAmount: parseFloat(goalRow.current_amount),
        color: goalRow.color,
        icon: goalRow.icon,
        deadline: goalRow.deadline || undefined,
        isActive: goalRow.is_active,
        createdAt: goalRow.created_at,
        updatedAt: goalRow.updated_at
      }

      // Добавляем в локальное состояние
      const { savingsGoals } = get()
      const updatedGoals = [newGoal, ...savingsGoals]

      // Сохраняем в кэш
      try {
        await offlineUtils.saveSavingsGoalsToCache(updatedGoals)
      } catch (cacheError) {
        console.error("Cache failed:", cacheError)
      }

      set({
        savingsGoals: updatedGoals,
        loading: false
      })
    } catch (error: unknown) {
      console.log("🔴 addSavingsGoal error:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to add savings goal"

      set({
        error: errorMessage,
        loading: false
      })
      throw error
    }
  },

  updateSavingsGoal: async (goalData: UpdateSavingsGoalData): Promise<void> => {
    set({ loading: true, error: null })

    try {
      const updateData: Record<string, unknown> = {}

      if (goalData.name !== undefined) updateData.name = goalData.name
      if (goalData.description !== undefined) updateData.description = goalData.description
      if (goalData.targetAmount !== undefined) updateData.target_amount = goalData.targetAmount
      if (goalData.color !== undefined) updateData.color = goalData.color
      if (goalData.icon !== undefined) updateData.icon = goalData.icon
      if (goalData.deadline !== undefined) updateData.deadline = goalData.deadline || null

      const result = await supabase
        .from("savings_goals")
        .update(updateData)
        .eq("id", goalData.id)
        .select()
        .single()

      if (result.error) throw result.error
      if (!result.data) throw new Error("No data returned from update")

      const goalRow = result.data as SupabaseSavingsGoalRow

      // Обновляем локальное состояние
      const { savingsGoals } = get()
      const updatedGoals = savingsGoals.map((goal) =>
        goal.id === goalData.id
          ? {
              ...goal,
              name: goalRow.name,
              description: goalRow.description,
              targetAmount: parseFloat(goalRow.target_amount),
              currentAmount: parseFloat(goalRow.current_amount),
              color: goalRow.color,
              icon: goalRow.icon,
              deadline: goalRow.deadline || undefined,
              isActive: goalRow.is_active,
              updatedAt: goalRow.updated_at
            }
          : goal
      )

      // Сохраняем в кэш
      try {
        await offlineUtils.saveSavingsGoalsToCache(updatedGoals)
      } catch (cacheError) {
        console.error("Cache failed:", cacheError)
      }

      set({
        savingsGoals: updatedGoals,
        loading: false
      })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update savings goal"
      set({
        error: errorMessage,
        loading: false
      })
      throw error
    }
  },

  deleteSavingsGoal: async (id: string): Promise<void> => {
    set({ loading: true, error: null })

    try {
      // Сначала удаляем все связанные транзакции
      const { error: transactionsError } = await supabase
        .from("savings_transactions")
        .delete()
        .eq("savings_goal_id", id)

      if (transactionsError) throw transactionsError

      // Затем удаляем саму цель
      const { error } = await supabase.from("savings_goals").delete().eq("id", id)

      if (error) throw error

      // Удаляем из локального состояния
      const { savingsGoals, savingsTransactions } = get()
      const updatedGoals = savingsGoals.filter((goal) => goal.id !== id)
      const updatedTransactions = savingsTransactions.filter((t) => t.savingsGoalId !== id)

      // Обновляем кэш
      try {
        await offlineUtils.saveSavingsGoalsToCache(updatedGoals)
        await offlineUtils.saveSavingsTransactionsToCache(updatedTransactions)
      } catch (cacheError) {
        console.error("Cache failed:", cacheError)
      }

      set({
        savingsGoals: updatedGoals,
        savingsTransactions: updatedTransactions,
        loading: false
      })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete savings goal"
      set({
        error: errorMessage,
        loading: false
      })
      throw error
    }
  },

  toggleSavingsGoal: async (id: string, isActive: boolean): Promise<void> => {
    const { updateSavingsGoal } = get()
    await updateSavingsGoal({ id, isActive })
  },

  fetchSavingsTransactions: async (goalId?: string): Promise<void> => {
    console.log("💰 Fetching savings transactions...")
    set({ loading: true, error: null })

    try {
      let query = supabase
        .from("savings_transactions")
        .select("*")
        .order("date", { ascending: false })

      if (goalId) {
        query = query.eq("savings_goal_id", goalId)
      }

      const { data, error } = await query

      if (error) throw error

      // Преобразуем данные к нашему формату
      const transactions: SavingsTransaction[] = (data as SupabaseSavingsTransactionRow[]).map(
        (row: SupabaseSavingsTransactionRow) => ({
          id: row.id,
          savingsGoalId: row.savings_goal_id,
          amount: parseFloat(row.amount),
          type: row.type,
          description: row.description,
          date: row.date,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        })
      )

      set({
        savingsTransactions: transactions,
        loading: false,
        isOfflineMode: false,
        lastSyncTime: Date.now()
      })
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch savings transactions"
      set({
        error: errorMessage,
        loading: false,
        isOfflineMode: true
      })
    }
  },

  addSavingsTransaction: async (transactionData: CreateSavingsTransactionData): Promise<void> => {
    set({ loading: true, error: null })

    try {
      const {
        data: { user }
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      const result = await supabase
        .from("savings_transactions")
        .insert([
          {
            user_id: user.id,
            savings_goal_id: transactionData.savingsGoalId,
            amount: transactionData.amount,
            type: transactionData.type,
            description: transactionData.description,
            date: transactionData.date
          }
        ])
        .select()
        .single()

      if (result.error) throw result.error
      if (!result.data) throw new Error("No data returned from insert")

      const transactionRow = result.data as SupabaseSavingsTransactionRow

      // Создаем объект транзакции в нашем формате
      const newTransaction: SavingsTransaction = {
        id: transactionRow.id,
        savingsGoalId: transactionRow.savings_goal_id,
        amount: parseFloat(transactionRow.amount),
        type: transactionRow.type,
        description: transactionRow.description,
        date: transactionRow.date,
        createdAt: transactionRow.created_at,
        updatedAt: transactionRow.updated_at
      }

      // Добавляем в локальное состояние
      const { savingsTransactions } = get()
      const updatedTransactions = [newTransaction, ...savingsTransactions]

      set({
        savingsTransactions: updatedTransactions,
        loading: false
      })

      // Обновляем цели, чтобы current_amount пересчитался
      get().fetchSavingsGoals()
    } catch (error: unknown) {
      console.log("🔴 addSavingsTransaction error:", error)
      const errorMessage =
        error instanceof Error ? error.message : "Failed to add savings transaction"

      set({
        error: errorMessage,
        loading: false
      })
      throw error
    }
  },

  deleteSavingsTransaction: async (id: string): Promise<void> => {
    set({ loading: true, error: null })

    try {
      const { error } = await supabase.from("savings_transactions").delete().eq("id", id)

      if (error) throw error

      // Удаляем из локального состояния
      const { savingsTransactions } = get()
      const updatedTransactions = savingsTransactions.filter((t) => t.id !== id)

      set({
        savingsTransactions: updatedTransactions,
        loading: false
      })

      // Обновляем цели, чтобы current_amount пересчитался
      get().fetchSavingsGoals()
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete savings transaction"
      set({
        error: errorMessage,
        loading: false
      })
      throw error
    }
  },

  // Utility functions
  getSavingsGoalById: (id: string): SavingsGoal | undefined => {
    const { savingsGoals } = get()
    return savingsGoals.find((goal) => goal.id === id)
  },

  getTotalSavingsAmount: (): number => {
    const { savingsGoals } = get()
    return savingsGoals
      .filter((goal) => goal.isActive)
      .reduce((total, goal) => total + goal.currentAmount, 0)
  },

  getBalanceWithSavings: (totalBalance: number): BalanceWithSavings => {
    const { savingsGoals } = get()
    const activeGoals = savingsGoals.filter((goal) => goal.isActive)
    const reservedBalance = activeGoals.reduce((total, goal) => total + goal.currentAmount, 0)

    return {
      totalBalance,
      availableBalance: totalBalance - reservedBalance,
      reservedBalance,
      savingsGoals: activeGoals
    }
  },

  loadFromCache: async (): Promise<void> => {
    set({ loading: true, error: null })

    try {
      const cachedGoals = await offlineUtils.getSavingsGoalsFromCache()
      const cachedTransactions = await offlineUtils.getSavingsTransactionsFromCache()

      set({
        savingsGoals: cachedGoals,
        savingsTransactions: cachedTransactions,
        loading: false,
        isOfflineMode: true
      })
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load savings data from cache"
      set({
        error: errorMessage,
        loading: false,
        isOfflineMode: true
      })
    }
  },

  clearError: (): void => set({ error: null }),
  setLoading: (loading: boolean): void => set({ loading }),
  setError: (error: string): void => set({ error }),
  setOfflineMode: (isOffline: boolean): void => set({ isOfflineMode: isOffline })
}))

// Real-time подписка на изменения сберегательных целей
supabase
  .channel("savings_goals")
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "savings_goals"
    },
    (_payload) => {
      // При изменениях извне - обновляем данные
      const store = useSavingsStoreSupabase.getState()
      if (!store.loading) {
        store.fetchSavingsGoals()
      }
    }
  )
  .subscribe()

// Real-time подписка на изменения транзакций сбережений
supabase
  .channel("savings_transactions")
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "savings_transactions"
    },
    (_payload) => {
      // При изменениях извне - обновляем данные
      const store = useSavingsStoreSupabase.getState()
      if (!store.loading) {
        store.fetchSavingsTransactions()
        store.fetchSavingsGoals() // Также обновляем цели для пересчета current_amount
      }
    }
  )
  .subscribe()
