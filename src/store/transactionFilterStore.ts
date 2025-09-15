import { create } from "zustand"

interface TransactionFilterState {
  activeFilter: "income" | "expense" | "all"
  setFilter: (filter: "income" | "expense" | "all") => void
  clearFilter: () => void
}

export const useTransactionFilterStore = create<TransactionFilterState>((set) => ({
  activeFilter: "all",

  setFilter: (filter: "income" | "expense" | "all") => {
    set({ activeFilter: filter })
  },

  clearFilter: () => {
    set({ activeFilter: "all" })
  }
}))
