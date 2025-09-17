import React from "react"
import type { SavingsGoal } from "@/types"
import { formatCurrency } from "@/utils/formatters"
import { format, parseISO, differenceInDays } from "date-fns"
import { ru } from "date-fns/locale"

interface SavingsGoalCardProps {
  goal: SavingsGoal
  onDeposit?: (goalId: string) => void
  onWithdraw?: (goalId: string) => void
  onEdit?: (goalId: string) => void
  onDelete?: (goalId: string) => void
  showActions?: boolean
}

export const SavingsGoalCard: React.FC<SavingsGoalCardProps> = ({
  goal,
  onDeposit,
  onWithdraw,
  onEdit,
  onDelete,
  showActions = true
}) => {
  const progressPercentage =
    goal.targetAmount > 0 ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100) : 0

  const remainingAmount = Math.max(goal.targetAmount - goal.currentAmount, 0)

  const daysToDeadline = goal.deadline
    ? differenceInDays(parseISO(goal.deadline), new Date())
    : null

  const isCompleted = goal.currentAmount >= goal.targetAmount
  const isExpired = daysToDeadline !== null && daysToDeadline < 0
  const isUrgent = daysToDeadline !== null && daysToDeadline <= 7 && daysToDeadline >= 0

  return (
    <div
      className={`
      bg-white rounded-xl shadow-md border-2 transition-all duration-300 hover:shadow-lg
      ${isCompleted ? "border-emerald-200 bg-emerald-50" : ""}
      ${isExpired ? "border-red-200 bg-red-50" : ""}
      ${isUrgent ? "border-amber-200 bg-amber-50" : ""}
      ${!isCompleted && !isExpired && !isUrgent ? "border-gray-200" : ""}
    `}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <span
              className="text-2xl w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${goal.color}20`, color: goal.color }}>
              {goal.icon}
            </span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{goal.name}</h3>
              {goal.description && <p className="text-sm text-gray-600 mt-1">{goal.description}</p>}
            </div>
          </div>

          {/* Status badges */}
          <div className="flex flex-col items-end space-y-1">
            {isCompleted && (
              <span className="bg-emerald-100 text-emerald-800 text-xs font-medium px-2 py-1 rounded-full">
                ✅ Выполнено
              </span>
            )}
            {isExpired && (
              <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                ⏰ Просрочено
              </span>
            )}
            {isUrgent && !isCompleted && (
              <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2 py-1 rounded-full">
                🔥 Срочно
              </span>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Прогресс</span>
            <span className="text-sm font-bold" style={{ color: goal.color }}>
              {progressPercentage.toFixed(1)}%
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${progressPercentage}%`,
                backgroundColor: goal.color
              }}
            />
          </div>
        </div>

        {/* Amounts */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Накоплено</p>
            <p className="text-lg font-bold" style={{ color: goal.color }}>
              {formatCurrency(goal.currentAmount)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Цель</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(goal.targetAmount)}</p>
          </div>
        </div>

        {/* Remaining info */}
        {!isCompleted && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Осталось накопить:</span>
              <span className="text-sm font-medium text-gray-900">
                {formatCurrency(remainingAmount)}
              </span>
            </div>

            {goal.deadline && (
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-600">Дедлайн:</span>
                <span
                  className={`text-sm font-medium ${
                    isExpired ? "text-red-600" : isUrgent ? "text-amber-600" : "text-gray-900"
                  }`}>
                  {format(parseISO(goal.deadline), "d MMMM yyyy", { locale: ru })}
                  {daysToDeadline !== null && daysToDeadline >= 0 && (
                    <span className="ml-1 text-xs">({daysToDeadline} дн.)</span>
                  )}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        {showActions && (
          <div className="flex space-x-2">
            {!isCompleted && onDeposit && (
              <button
                onClick={() => onDeposit(goal.id)}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors">
                💰 Пополнить
              </button>
            )}

            {goal.currentAmount > 0 && onWithdraw && (
              <button
                onClick={() => onWithdraw(goal.id)}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors">
                💳 Снять
              </button>
            )}

            {onEdit && (
              <button
                onClick={() => onEdit(goal.id)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-3 rounded-lg transition-colors">
                ✏️
              </button>
            )}

            {onDelete && (
              <button
                onClick={() => onDelete(goal.id)}
                className="bg-red-100 hover:bg-red-200 text-red-700 text-sm font-medium py-2 px-3 rounded-lg transition-colors">
                🗑️
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
