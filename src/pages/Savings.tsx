import React, { useState, useEffect } from "react"
import type { SavingsGoal, CreateSavingsGoalData, UpdateSavingsGoalData } from "@/types"
import { useSavingsStoreSupabase } from "@/store/savingsStoreSupabase"
import { SavingsGoalCard } from "@/components/ui/SavingsGoalCard"
import { SavingsGoalForm } from "@/components/forms/SavingsGoalForm"
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
    clearError
  } = useSavingsStoreSupabase()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null)
  const [formLoading, setFormLoading] = useState(false)

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

  const handleDeposit = (goalId: string): void => {
    // TODO: Открыть модал для пополнения цели
    console.log("Deposit to goal:", goalId)
  }

  const handleWithdraw = (goalId: string): void => {
    // TODO: Открыть модал для снятия с цели
    console.log("Withdraw from goal:", goalId)
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

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium opacity-90">Всего накоплено</h3>
              <p className="text-3xl font-bold">{formatCurrency(totalSavingsAmount)}</p>
            </div>
            <div className="text-4xl opacity-80">💰</div>
          </div>
        </div>

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
    </div>
  )
}

export default Savings
