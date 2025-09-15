import { create } from "zustand"

interface TransactionFilterState {
  activeFilter: "income" | "expense" | "all"
  setFilter: (filter: "income" | "expense" | "all") => void
  clearFilter: () => void
}

export const useTransactionFilterStore = create<TransactionFilterState>((set) => ({
  activeFilter: "all",

  setFilter: (filter: "income" | "expense" | "all"): void => {
    set({ activeFilter: filter })
  },

  clearFilter: (): void => {
    set({ activeFilter: "all" })
  }
}))
