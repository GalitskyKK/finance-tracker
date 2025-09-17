import React, { useState } from "react"
import { TransactionList } from "@/components/TransactionList"
import { PageHeader } from "@/components/ui/PageHeader"
import { Modal } from "@/components/ui/Modal"
import { TransactionForm } from "@/components/forms/TransactionForm"
import { Button } from "@/components/ui/Button"
import { CreditCard, Plus } from "lucide-react"

const Transactions: React.FC = () => {
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false)

  const handleAddTransaction = (): void => {
    setIsTransactionModalOpen(true)
  }

  const handleTransactionSuccess = (): void => {
    setIsTransactionModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Транзакции"
        subtitle="Управляйте своими доходами и расходами"
        description="Все ваши финансовые операции в одном месте. Добавляйте, редактируйте и анализируйте траты."
        icon={<CreditCard className="w-5 h-5 text-white" />}
        collapsibleDescription={true}
        actions={
          <Button
            onClick={handleAddTransaction}
            variant="primary"
            size="sm"
            className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Добавить
          </Button>
        }
      />

      <TransactionList />

      {/* Add Transaction Modal */}
      <Modal isOpen={isTransactionModalOpen} onClose={() => setIsTransactionModalOpen(false)}>
        <TransactionForm onSuccess={handleTransactionSuccess} />
      </Modal>
    </div>
  )
}

export default Transactions
