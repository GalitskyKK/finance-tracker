import React, { useState } from "react"
import { useForm } from "react-hook-form"
import type { CreateSavingsGoalData, UpdateSavingsGoalData, SavingsGoal } from "@/types"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { Modal } from "@/components/ui/Modal"
import { format } from "date-fns"

interface SavingsGoalFormData {
  name: string
  description: string
  targetAmount: number
  color: string
  icon: string
  deadline?: string
}

interface SavingsGoalFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateSavingsGoalData | UpdateSavingsGoalData) => Promise<void>
  goal?: SavingsGoal // Для редактирования
  loading?: boolean
}

// Предустановленные цвета
const COLORS = [
  "#3B82F6", // blue
  "#10B981", // emerald
  "#F59E0B", // amber
  "#EF4444", // red
  "#8B5CF6", // violet
  "#06B6D4", // cyan
  "#EC4899", // pink
  "#84CC16", // lime
  "#F97316", // orange
  "#6366F1" // indigo
]

// Предустановленные иконки
const ICONS = [
  "🎯",
  "💰",
  "🏠",
  "🚗",
  "✈️",
  "🎓",
  "💍",
  "🎮",
  "📱",
  "💻",
  "👗",
  "🍔",
  "🎬",
  "📚",
  "⚡",
  "🎨",
  "🏆",
  "🎁",
  "🌟",
  "💎"
]

export const SavingsGoalForm: React.FC<SavingsGoalFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  goal,
  loading = false
}) => {
  const isEditing = !!goal

  const [selectedColor, setSelectedColor] = useState(goal?.color || COLORS[0])
  const [selectedIcon, setSelectedIcon] = useState(goal?.icon || ICONS[0])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<SavingsGoalFormData>({
    defaultValues: {
      name: goal?.name || "",
      description: goal?.description || "",
      targetAmount: goal?.targetAmount || 0,
      color: goal?.color || COLORS[0],
      icon: goal?.icon || ICONS[0],
      deadline: goal?.deadline ? format(new Date(goal.deadline), "yyyy-MM-dd") : ""
    }
  })

  // Обновляем форму при изменении цели
  React.useEffect(() => {
    if (goal) {
      setValue("name", goal.name)
      setValue("description", goal.description)
      setValue("targetAmount", goal.targetAmount)
      setValue("color", goal.color)
      setValue("icon", goal.icon)
      setValue("deadline", goal.deadline ? format(new Date(goal.deadline), "yyyy-MM-dd") : "")
      setSelectedColor(goal.color)
      setSelectedIcon(goal.icon)
    }
  }, [goal, setValue])

  const handleFormSubmit = async (data: SavingsGoalFormData): Promise<void> => {
    try {
      const formData = {
        ...data,
        color: selectedColor,
        icon: selectedIcon,
        deadline: data.deadline || undefined
      }

      if (isEditing) {
        await onSubmit({ id: goal.id, ...formData } as UpdateSavingsGoalData)
      } else {
        await onSubmit(formData as CreateSavingsGoalData)
      }

      handleClose()
    } catch (error) {
      console.error("Error submitting savings goal form:", error)
      // Ошибка будет обработана в родительском компоненте
    }
  }

  const handleClose = (): void => {
    reset()
    setSelectedColor(COLORS[0])
    setSelectedIcon(ICONS[0])
    onClose()
  }

  const targetAmount = watch("targetAmount")

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? "Редактировать цель" : "Новая цель КопиКопи"}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Preview */}
        <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300">
          <div className="flex items-center space-x-3">
            <span
              className="text-2xl w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${selectedColor}20`, color: selectedColor }}>
              {selectedIcon}
            </span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {watch("name") || "Название цели"}
              </h3>
              <p className="text-sm text-gray-600">
                Цель: {targetAmount ? `${targetAmount.toLocaleString("ru-RU")} ₽` : "0 ₽"}
              </p>
            </div>
          </div>
        </div>

        {/* Icon selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Иконка</label>
          <div className="grid grid-cols-10 gap-2">
            {ICONS.map((icon) => (
              <button
                key={icon}
                type="button"
                onClick={() => {
                  setSelectedIcon(icon)
                  setValue("icon", icon)
                }}
                className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center text-lg transition-all ${
                  selectedIcon === icon
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}>
                {icon}
              </button>
            ))}
          </div>
        </div>

        {/* Color selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Цвет</label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => {
                  setSelectedColor(color)
                  setValue("color", color)
                }}
                className={`w-8 h-8 rounded-full border-4 transition-all ${
                  selectedColor === color
                    ? "border-gray-800 scale-110"
                    : "border-gray-200 hover:border-gray-400"
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Name */}
        <Input
          {...register("name", {
            required: "Название цели обязательно",
            minLength: { value: 2, message: "Минимум 2 символа" },
            maxLength: { value: 50, message: "Максимум 50 символов" }
          })}
          label="Название цели"
          placeholder="Например: Новый ноутбук"
          error={errors.name?.message}
        />

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
            rows={3}
            placeholder="Краткое описание цели..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        {/* Target amount */}
        <Input
          {...register("targetAmount", {
            required: "Целевая сумма обязательна",
            min: { value: 1, message: "Сумма должна быть больше 0" },
            max: { value: 10000000, message: "Максимальная сумма 10,000,000 ₽" }
          })}
          type="number"
          label="Целевая сумма (₽)"
          placeholder="10000"
          error={errors.targetAmount?.message}
        />

        {/* Deadline */}
        <Input
          {...register("deadline")}
          type="date"
          label="Дедлайн (необязательно)"
          min={format(new Date(), "yyyy-MM-dd")}
        />

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
          <Button type="submit" variant="primary" loading={loading} className="flex-1">
            {isEditing ? "Сохранить" : "Создать цель"}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
