import React from "react"
import { TransactionList } from "@/components/TransactionList"

const Transactions: React.FC = () => {
  return (
    <div className="space-y-6">
      <TransactionList />
    </div>
  )
}

export default Transactions
