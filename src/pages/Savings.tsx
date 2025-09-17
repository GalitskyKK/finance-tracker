import React, { useState, useEffect, useMemo } from "react"
import type {
  SavingsGoal,
  CreateSavingsGoalData,
  UpdateSavingsGoalData,
  CreateSavingsTransactionData
} from "@/types"
import { useSavingsStoreSupabase } from "@/store/savingsStoreSupabase"
import { useTransactionStoreSupabase } from "@/store/transactionStoreSupabase"
import { SavingsGoalCard } from "@/components/ui/SavingsGoalCard"
import { SavingsGoalForm } from "@/components/forms/SavingsGoalForm"
import { SavingsTransactionModal } from "@/components/forms/SavingsTransactionModal"
import { PageHeader } from "@/components/ui/PageHeader"
import { Button } from "@/components/ui/Button"
import { formatCurrency } from "@/utils/formatters"

const Savings: React.FC = () => {
  const {
    savingsGoals,
    loading,
    error,
    fetchSavingsGoals,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    getTotalSavingsAmount,
    addSavingsTransaction,
    getBalanceWithSavings,
    clearError
  } = useSavingsStoreSupabase()

  const { transactions } = useTransactionStoreSupabase()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null)
  const [formLoading, setFormLoading] = useState(false)

  // States for transaction modals
  const [transactionModalOpen, setTransactionModalOpen] = useState(false)
  const [transactionType, setTransactionType] = useState<"deposit" | "withdraw">("deposit")
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null)
  const [transactionLoading, setTransactionLoading] = useState(false)

  // Загружаем данные при монтировании
  useEffect(() => {
    fetchSavingsGoals()
  }, [fetchSavingsGoals])

  // Очищаем ошибки при размонтировании
  useEffect(() => {
    return () => {
      clearError()
    }
  }, [clearError])

  // Вычисляем баланс с учетом сбережений
  const balanceData = useMemo(() => {
    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0)

    const totalBalance = totalIncome - totalExpenses

    return getBalanceWithSavings(totalBalance)
  }, [transactions, getBalanceWithSavings])

  const totalSavingsAmount = getTotalSavingsAmount()
  const activeGoals = savingsGoals.filter((goal) => goal.isActive)
  const completedGoals = activeGoals.filter((goal) => goal.currentAmount >= goal.targetAmount)
  const inProgressGoals = activeGoals.filter((goal) => goal.currentAmount < goal.targetAmount)

  const handleCreateGoal = async (data: CreateSavingsGoalData): Promise<void> => {
    setFormLoading(true)
    try {
      await addSavingsGoal(data)
      setIsCreateModalOpen(false)
    } catch (error) {
      console.error("Failed to create savings goal:", error)
      throw error
    } finally {
      setFormLoading(false)
    }
  }

  const handleUpdateGoal = async (data: UpdateSavingsGoalData): Promise<void> => {
    setFormLoading(true)
    try {
      await updateSavingsGoal(data)
      setEditingGoal(null)
    } catch (error) {
      console.error("Failed to update savings goal:", error)
      throw error
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteGoal = async (goalId: string): Promise<void> => {
    const goal = savingsGoals.find((g) => g.id === goalId)
    if (!goal) return

    const confirmed = window.confirm(
      `Вы уверены, что хотите удалить цель "${goal.name}"?\n\n` +
        `Все связанные транзакции также будут удалены. Это действие нельзя отменить.`
    )

    if (confirmed) {
      try {
        await deleteSavingsGoal(goalId)
      } catch (error) {
        console.error("Failed to delete savings goal:", error)
        alert("Ошибка при удалении цели. Попробуйте еще раз.")
      }
    }
  }

  const handleSavingsTransaction = async (data: CreateSavingsTransactionData): Promise<void> => {
    setTransactionLoading(true)
    try {
      await addSavingsTransaction(data)
      setTransactionModalOpen(false)
      setSelectedGoal(null)
    } catch (error) {
      console.error("Failed to process savings transaction:", error)
      throw error
    } finally {
      setTransactionLoading(false)
    }
  }

  const handleDeposit = (goalId: string): void => {
    const goal = savingsGoals.find((g) => g.id === goalId)
    if (goal) {
      setSelectedGoal(goal)
      setTransactionType("deposit")
      setTransactionModalOpen(true)
    }
  }

  const handleWithdraw = (goalId: string): void => {
    const goal = savingsGoals.find((g) => g.id === goalId)
    if (goal) {
      setSelectedGoal(goal)
      setTransactionType("withdraw")
      setTransactionModalOpen(true)
    }
  }

  const handleCloseTransactionModal = (): void => {
    setTransactionModalOpen(false)
    setSelectedGoal(null)
    setTransactionType("deposit")
  }

  const handleEdit = (goalId: string): void => {
    const goal = savingsGoals.find((g) => g.id === goalId)
    if (goal) {
      setEditingGoal(goal)
    }
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PageHeader title="КопиКопи" />
        <div className="text-center py-12">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Ошибка загрузки</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => fetchSavingsGoals()}>Попробовать снова</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <PageHeader title="КопиКопи" subtitle="Ваши сберегательные цели" />

      {/* Balance overview */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Обзор баланса</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Общий баланс</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(balanceData.totalBalance)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-emerald-600 mb-1">Свободные средства</p>
            <p className="text-2xl font-bold text-emerald-600">
              {formatCurrency(balanceData.availableBalance)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-blue-600 mb-1">В целях КопиКопи</p>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(balanceData.reservedBalance)}
            </p>
          </div>
        </div>
        {balanceData.availableBalance < 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <span className="text-red-500 text-lg">⚠️</span>
              <div className="text-sm text-red-800">
                <p className="font-medium">Внимание!</p>
                <p>
                  У вас отрицательный свободный баланс. Рассмотрите возможность снять деньги с
                  некоторых целей.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium opacity-90">Активных целей</h3>
              <p className="text-3xl font-bold">{inProgressGoals.length}</p>
            </div>
            <div className="text-4xl opacity-80">🎯</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium opacity-90">Выполнено</h3>
              <p className="text-3xl font-bold">{completedGoals.length}</p>
            </div>
            <div className="text-4xl opacity-80">🏆</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium opacity-90">Всего накоплено</h3>
              <p className="text-3xl font-bold">{formatCurrency(totalSavingsAmount)}</p>
            </div>
            <div className="text-4xl opacity-80">💰</div>
          </div>
        </div>
      </div>

      {/* Action button */}
      <div className="flex justify-center">
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          variant="primary"
          size="lg"
          className="px-8">
          ➕ Создать новую цель
        </Button>
      </div>

      {/* Goals list */}
      {loading && activeGoals.length === 0 ? (
        <div className="text-center py-12">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Загружаем ваши цели...</p>
        </div>
      ) : activeGoals.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">Пока нет целей</h3>
          <p className="text-gray-600 mb-6">
            Создайте свою первую сберегательную цель и начните копить на мечту!
          </p>
          <Button onClick={() => setIsCreateModalOpen(true)} variant="primary">
            Создать первую цель
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* In progress goals */}
          {inProgressGoals.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Активные цели ({inProgressGoals.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {inProgressGoals.map((goal) => (
                  <SavingsGoalCard
                    key={goal.id}
                    goal={goal}
                    onDeposit={handleDeposit}
                    onWithdraw={handleWithdraw}
                    onEdit={handleEdit}
                    onDelete={handleDeleteGoal}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Completed goals */}
          {completedGoals.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Выполненные цели ({completedGoals.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedGoals.map((goal) => (
                  <SavingsGoalCard
                    key={goal.id}
                    goal={goal}
                    onWithdraw={handleWithdraw}
                    onEdit={handleEdit}
                    onDelete={handleDeleteGoal}
                    showActions={true}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create goal modal */}
      <SavingsGoalForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateGoal}
        loading={formLoading}
      />

      {/* Edit goal modal */}
      <SavingsGoalForm
        isOpen={!!editingGoal}
        onClose={() => setEditingGoal(null)}
        onSubmit={handleUpdateGoal}
        goal={editingGoal || undefined}
        loading={formLoading}
      />

      {/* Savings transaction modal */}
      <SavingsTransactionModal
        isOpen={transactionModalOpen}
        onClose={handleCloseTransactionModal}
        onSubmit={handleSavingsTransaction}
        goal={selectedGoal}
        type={transactionType}
        loading={transactionLoading}
        availableBalance={balanceData.availableBalance}
      />
    </div>
  )
}

export default Savings
