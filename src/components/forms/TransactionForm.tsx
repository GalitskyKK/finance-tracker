import React from "react"
import { useForm, Controller } from "react-hook-form"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { useTransactionStoreSupabase } from "@/store/transactionStoreSupabase"
import { useCategoryStoreSupabase } from "@/store/categoryStoreSupabase"
import { CreateTransactionData } from "@/types"
import { validateAmount, validateDescription, validateDate } from "@/utils/validators"
import { formatDateForInput } from "@/utils/formatters"

interface TransactionFormProps {
  onSuccess?: () => void
  initialData?: Partial<CreateTransactionData>
  isEditing?: boolean
  transactionId?: string
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  onSuccess,
  initialData,
  isEditing = false,
  transactionId
}) => {
  const { addTransaction, updateTransaction, loading } = useTransactionStoreSupabase()
  const { getCategoriesByType } = useCategoryStoreSupabase()

  const {
    handleSubmit,
    watch,
    control,
    formState: { errors },
    reset,
    setValue
  } = useForm<CreateTransactionData>({
    defaultValues: {
      amount: initialData?.amount || 0,
      type: initialData?.type || "expense",
      categoryId: initialData?.categoryId || "",
      description: initialData?.description || "",
      date: initialData?.date || formatDateForInput(new Date().toISOString())
    }
  })

  const selectedType = watch("type")
  const availableCategories = getCategoriesByType(selectedType)

  const categoryOptions = availableCategories.map((category) => ({
    value: category.id,
    label: category.name,
    color: category.color,
    icon: category.icon
  }))

  const onSubmit = async (data: CreateTransactionData) => {
    try {
      // Преобразуем amount в число
      const processedData = {
        ...data,
        amount: Number(data.amount)
      }

      if (isEditing && transactionId) {
        await updateTransaction(transactionId, processedData)
      } else {
        await addTransaction(processedData)
      }

      reset()
      onSuccess?.()
    } catch (_error) {
      // TODO: Добавить toast уведомление об ошибке
      // console.error('Ошибка при сохранении транзакции:', error);
    }
  }

  const handleTypeChange = (type: "income" | "expense") => {
    setValue("type", type)
    setValue("categoryId", "") // Сбрасываем категорию при смене типа
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Редактировать транзакцию" : "Добавить транзакцию"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Тип транзакции */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Тип транзакции</label>
            <div className="flex space-x-4">
              <Button
                type="button"
                variant={selectedType === "expense" ? "primary" : "secondary"}
                onClick={() => handleTypeChange("expense")}
                className="flex-1">
                Расход
              </Button>
              <Button
                type="button"
                variant={selectedType === "income" ? "success" : "secondary"}
                onClick={() => handleTypeChange("income")}
                className="flex-1">
                Доход
              </Button>
            </div>
          </div>

          {/* Сумма */}
          <Controller
            name="amount"
            control={control}
            rules={{
              required: "Сумма обязательна",
              validate: validateAmount
            }}
            render={({ field }) => (
              <Input
                {...field}
                type="number"
                label="Сумма"
                placeholder="Введите сумму"
                error={errors.amount?.message}
                min={0.01}
                step={0.01}
              />
            )}
          />

          {/* Категория */}
          <Controller
            name="categoryId"
            control={control}
            rules={{ required: "Выберите категорию" }}
            render={({ field }) => (
              <Select
                {...field}
                options={categoryOptions}
                label="Категория"
                placeholder="Выберите категорию"
                error={errors.categoryId?.message}
              />
            )}
          />

          {/* Описание */}
          <Controller
            name="description"
            control={control}
            rules={{
              required: "Описание обязательно",
              validate: validateDescription
            }}
            render={({ field }) => (
              <Input
                {...field}
                type="text"
                label="Описание"
                placeholder="Введите описание транзакции"
                error={errors.description?.message}
              />
            )}
          />

          {/* Дата */}
          <Controller
            name="date"
            control={control}
            rules={{
              required: "Дата обязательна",
              validate: validateDate
            }}
            render={({ field }) => (
              <Input {...field} type="date" label="Дата" error={errors.date?.message} />
            )}
          />

          {/* Кнопки */}
          <div className="flex space-x-4 pt-4">
            <Button type="submit" variant="primary" loading={loading} className="flex-1">
              {isEditing ? "Сохранить изменения" : "Добавить транзакцию"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => reset()} className="flex-1">
              Сбросить
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
