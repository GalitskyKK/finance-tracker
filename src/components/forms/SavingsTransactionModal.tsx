import React from "react"
import { useForm } from "react-hook-form"
import type { CreateSavingsTransactionData, SavingsGoal } from "@/types"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { Modal } from "@/components/ui/Modal"
import { formatCurrency } from "@/utils/formatters"
import { format } from "date-fns"

interface SavingsTransactionFormData {
  amount: number
  description: string
  date: string
}

interface SavingsTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateSavingsTransactionData) => Promise<void>
  goal: SavingsGoal | null
  type: "deposit" | "withdraw"
  loading?: boolean
  availableBalance?: number // Свободный баланс для проверки при пополнении
}

export const SavingsTransactionModal: React.FC<SavingsTransactionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  goal,
  type,
  loading = false,
  availableBalance = 0
}) => {
  const isDeposit = type === "deposit"
  const isWithdraw = type === "withdraw"

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setError,
    clearErrors
  } = useForm<SavingsTransactionFormData>({
    defaultValues: {
      amount: 0,
      description: "",
      date: format(new Date(), "yyyy-MM-dd")
    }
  })

  const watchedAmount = watch("amount")

  // Максимальная сумма для операции
  const maxAmount = isDeposit ? availableBalance : goal?.currentAmount || 0

  const handleFormSubmit = async (data: SavingsTransactionFormData): Promise<void> => {
    if (!goal) return

    // Валидация сумм
    const amount = Number(data.amount)
    if (isNaN(amount) || amount <= 0) {
      setError("amount", { message: "Сумма должна быть больше 0" })
      return
    }

    if (amount > maxAmount) {
      const errorMessage = isDeposit
        ? `Недостаточно свободных средств. Доступно: ${formatCurrency(maxAmount)}`
        : `Нельзя снять больше накопленной суммы. Доступно: ${formatCurrency(maxAmount)}`
      setError("amount", { message: errorMessage })
      return
    }

    try {
      const transactionData: CreateSavingsTransactionData = {
        savingsGoalId: goal.id,
        amount: Number(data.amount),
        type,
        description: data.description || (isDeposit ? "Пополнение цели" : "Снятие с цели"),
        date: new Date(data.date).toISOString()
      }

      await onSubmit(transactionData)
      handleClose()
    } catch (error) {
      console.error("Error submitting savings transaction:", error)
      throw error
    }
  }

  const handleClose = (): void => {
    reset()
    clearErrors()
    onClose()
  }

  if (!goal) return null

  const title = isDeposit ? "Пополнить цель" : "Снять с цели"
  const submitButtonText = isDeposit ? "💰 Пополнить" : "💳 Снять"
  const submitButtonColor = isDeposit ? "emerald" : "amber"

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Goal info */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center space-x-3">
            <span
              className="text-2xl w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${goal.color}20`, color: goal.color }}>
              {goal.icon}
            </span>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{goal.name}</h3>
              <p className="text-sm text-gray-600">
                Накоплено: {formatCurrency(goal.currentAmount)} из{" "}
                {formatCurrency(goal.targetAmount)}
              </p>
            </div>
          </div>
        </div>

        {/* Available balance info */}
        <div
          className={`p-3 rounded-lg ${
            isDeposit ? "bg-blue-50 border border-blue-200" : "bg-amber-50 border border-amber-200"
          }`}>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">
              {isDeposit ? "Доступно для пополнения:" : "Доступно для снятия:"}
            </span>
            <span className="text-sm font-bold text-gray-900">{formatCurrency(maxAmount)}</span>
          </div>
        </div>

        {/* Amount input */}
        <Input
          {...register("amount", {
            required: "Сумма обязательна",
            min: { value: 0.01, message: "Минимальная сумма 0.01 ₽" },
            max: { value: maxAmount, message: `Максимальная сумма ${formatCurrency(maxAmount)}` }
          })}
          type="number"
          step="0.01"
          label="Сумма (₽)"
          placeholder="1000"
          error={errors.amount?.message}
        />

        {/* Amount preview */}
        {watchedAmount > 0 && (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">
                {isDeposit ? "После пополнения:" : "После снятия:"}
              </span>
              <span className="font-medium text-gray-900">
                {formatCurrency(
                  isDeposit
                    ? Number(goal.currentAmount) + Number(watchedAmount || 0)
                    : Number(goal.currentAmount) - Number(watchedAmount || 0)
                )}
              </span>
            </div>
            {isDeposit && (
              <div className="flex justify-between items-center text-sm mt-1">
                <span className="text-gray-600">Прогресс:</span>
                <span className="font-medium" style={{ color: goal.color }}>
                  {(
                    ((Number(goal.currentAmount) + Number(watchedAmount || 0)) /
                      Number(goal.targetAmount)) *
                    100
                  ).toFixed(1)}
                  %
                </span>
              </div>
            )}
          </div>
        )}

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Описание (необязательно)
          </label>
          <textarea
            {...register("description", {
              maxLength: { value: 200, message: "Максимум 200 символов" }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={2}
            placeholder={isDeposit ? "Пополнение цели..." : "Снятие с цели..."}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        {/* Date */}
        <Input
          {...register("date", { required: "Дата обязательна" })}
          type="date"
          label="Дата операции"
          error={errors.date?.message}
        />

        {/* Warning for withdraw */}
        {isWithdraw && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <span className="text-amber-500 text-lg">⚠️</span>
              <div className="text-sm text-amber-800">
                <p className="font-medium">Внимание!</p>
                <p>Снятие денег с цели уменьшит ваш прогресс по достижению цели.</p>
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={loading}
            className="flex-1">
            Отмена
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={!watchedAmount || watchedAmount <= 0 || watchedAmount > maxAmount}
            className={`flex-1 ${
              submitButtonColor === "emerald"
                ? "bg-emerald-500 hover:bg-emerald-600"
                : "bg-amber-500 hover:bg-amber-600"
            } text-white`}>
            {submitButtonText}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
