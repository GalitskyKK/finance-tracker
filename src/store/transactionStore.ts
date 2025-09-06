import { create } from "zustand"
import { Transaction, CreateTransactionData } from "@/types"
import { STORAGE_KEYS } from "@/utils/constants"

interface TransactionState {
  transactions: Transaction[]
  loading: boolean
  error: string | null

  // Actions
  setTransactions: (transactions: Transaction[]) => void
  addTransaction: (transaction: CreateTransactionData) => void
  updateTransaction: (id: string, updates: Partial<CreateTransactionData>) => void
  deleteTransaction: (id: string) => void
  clearError: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string) => void
}

// Функция для загрузки данных из localStorage
const loadTransactionsFromStorage = (): Transaction[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)
    if (saved) {
      const parsed: unknown = JSON.parse(saved)
      // Проверяем, что parsed является массивом
      if (Array.isArray(parsed)) {
        // Убеждаемся, что amount является числом
        return parsed.map((transaction: Transaction) => ({
          ...transaction,
          amount: Number(transaction.amount)
        }))
      }
    }
  } catch (_error) {
    // Ошибка при загрузке транзакций - возвращаем пустой массив
  }
  return []
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: loadTransactionsFromStorage(),
  loading: false,
  error: null,

  setTransactions: (transactions: Transaction[]): void => {
    // Убеждаемся, что amount является числом
    const processedTransactions = transactions.map((transaction) => ({
      ...transaction,
      amount: Number(transaction.amount)
    }))

    set({ transactions: processedTransactions })
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(processedTransactions))
  },

  addTransaction: (transactionData: CreateTransactionData): void => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const { transactions } = get()
    const updatedTransactions = [newTransaction, ...transactions]

    set({ transactions: updatedTransactions })
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updatedTransactions))
  },

  updateTransaction: (id: string, updates: Partial<CreateTransactionData>): void => {
    const { transactions } = get()
    const updatedTransactions = transactions.map((transaction) =>
      transaction.id === id
        ? { ...transaction, ...updates, updatedAt: new Date().toISOString() }
        : transaction
    )

    set({ transactions: updatedTransactions })
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updatedTransactions))
  },

  deleteTransaction: (id: string): void => {
    const { transactions } = get()
    const updatedTransactions = transactions.filter((transaction) => transaction.id !== id)

    set({ transactions: updatedTransactions })
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updatedTransactions))
  },

  clearError: (): void => set({ error: null }),
  setLoading: (loading: boolean): void => set({ loading }),
  setError: (error: string): void => set({ error })
}))
