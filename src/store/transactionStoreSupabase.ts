import { create } from "zustand"
import type { Transaction, CreateTransactionData } from "@/types"
import { supabase } from "@/lib/supabase"

interface TransactionState {
  transactions: Transaction[]
  loading: boolean
  error: string | null

  // Actions
  fetchTransactions: () => Promise<void>
  addTransaction: (transaction: CreateTransactionData) => Promise<void>
  updateTransaction: (id: string, updates: Partial<CreateTransactionData>) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
  clearError: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string) => void
}

export const useTransactionStoreSupabase = create<TransactionState>((set, get) => ({
  transactions: [],
  loading: false,
  error: null,

  fetchTransactions: async (): Promise<void> => {
    set({ loading: true, error: null })

    try {
      const { data, error } = await supabase
        .from("transactions")
        .select(
          `
          *,
          categories (
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
      const transformedTransactions: Transaction[] = data.map((row) => ({
        id: row.id,
        amount: parseFloat(row.amount),
        type: row.type as "income" | "expense",
        categoryId: row.category_id,
        description: row.description,
        date: row.date,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }))

      set({
        transactions: transformedTransactions,
        loading: false
      })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch transactions"
      console.error("Error fetching transactions:", error)
      set({
        error: errorMessage,
        loading: false
      })
    }
  },

  addTransaction: async (transactionData: CreateTransactionData): Promise<void> => {
    set({ loading: true, error: null })

    try {
      const {
        data: { user }
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      const { data, error } = await supabase
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

      if (error) throw error

      // Создаем объект транзакции в нашем формате
      const newTransaction: Transaction = {
        id: data.id,
        amount: parseFloat(data.amount),
        type: data.type as "income" | "expense",
        categoryId: data.category_id,
        description: data.description,
        date: data.date,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }

      // Добавляем в локальное состояние
      const { transactions } = get()
      const updatedTransactions = [newTransaction, ...transactions]

      set({
        transactions: updatedTransactions,
        loading: false
      })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to add transaction"
      console.error("Error adding transaction:", error)
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

      const { data, error } = await supabase
        .from("transactions")
        .update(updateData)
        .eq("id", id)
        .select()
        .single()

      if (error) throw error

      // Обновляем локальное состояние
      const { transactions } = get()
      const updatedTransactions = transactions.map((transaction) =>
        transaction.id === id
          ? {
              ...transaction,
              amount: data.amount ? parseFloat(data.amount) : transaction.amount,
              type: data.type || transaction.type,
              categoryId: data.category_id || transaction.categoryId,
              description: data.description || transaction.description,
              date: data.date || transaction.date,
              updatedAt: data.updated_at
            }
          : transaction
      )

      set({
        transactions: updatedTransactions,
        loading: false
      })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update transaction"
      console.error("Error updating transaction:", error)
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
      console.error("Error deleting transaction:", error)
      set({
        error: errorMessage,
        loading: false
      })
      throw error
    }
  },

  clearError: (): void => set({ error: null }),
  setLoading: (loading: boolean): void => set({ loading }),
  setError: (error: string): void => set({ error })
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
    (payload) => {
      console.log("Transaction changed:", payload)

      // При изменениях извне - обновляем данные
      const store = useTransactionStoreSupabase.getState()
      if (!store.loading) {
        store.fetchTransactions()
      }
    }
  )
  .subscribe()
