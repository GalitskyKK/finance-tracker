import React from "react"
import { useForm, Controller } from "react-hook-form"
import { Select } from "@/components/ui/Select"
import { useTransactionStoreSupabase } from "@/store/transactionStoreSupabase"
import { useCategoryStoreSupabase } from "@/store/categoryStoreSupabase"
import { useNetworkStatus } from "@/hooks/useNetworkStatus"
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
  const { addTransaction, addTransactionOffline, updateTransaction, loading } =
    useTransactionStoreSupabase()
  const { getCategoriesByType } = useCategoryStoreSupabase()
  const { isOnline } = useNetworkStatus()

  // Debug: проверяем что store подключен
  console.log("🟡 TransactionForm render:", {
    hasAddTransaction: !!addTransaction,
    hasAddTransactionOffline: !!addTransactionOffline,
    isOnline,
    loading
  })

  const {
    handleSubmit,
    watch,
    control,
    formState: { errors },
    reset,
    setValue
  } = useForm<CreateTransactionData>({
    defaultValues: {
      amount: initialData?.amount ?? 0,
      type: initialData?.type ?? "expense",
      categoryId: initialData?.categoryId ?? "",
      description: initialData?.description ?? "",
      date: initialData?.date ?? formatDateForInput(new Date().toISOString())
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

  const onSubmit = async (data: CreateTransactionData): Promise<void> => {
    console.log("🚨🚨🚨 FORM SUBMIT:", {
      description: data.description,
      isOnline,
      amount: data.amount
    })
    alert(`🚨 ФОРМА ОТПРАВЛЕНА: ${data.description} (${isOnline ? "ОНЛАЙН" : "ОФЛАЙН"})`)
    try {
      // Преобразуем amount в число
      const processedData = {
        ...data,
        amount: Number(data.amount)
      }

      if (isEditing && transactionId) {
        // Редактирование пока только онлайн
        console.log("🟡 Editing mode, calling updateTransaction")
        if (!isOnline) {
          throw new Error("Редактирование транзакций доступно только при подключении к интернету")
        }
        await updateTransaction(transactionId, processedData)
      } else {
        // Создание: онлайн или офлайн
        if (isOnline) {
          console.log("🌐 CALLING ONLINE addTransaction")
          await addTransaction(processedData)
          console.log("✅ ONLINE addTransaction completed")
        } else {
          console.log("📱 CALLING OFFLINE addTransactionOffline")
          await addTransactionOffline(processedData)
          console.log("✅ OFFLINE addTransactionOffline completed")
        }
      }

      console.log("🟢 TransactionForm success, calling reset and onSuccess")
      reset()
      onSuccess?.()
    } catch (error) {
      console.error("🔴 TransactionForm error:", error)
      // TODO: Добавить toast уведомление об ошибке
    }
  }

  const handleTypeChange = (type: "income" | "expense"): void => {
    setValue("type", type)
    setValue("categoryId", "") // Сбрасываем категорию при смене типа
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Стильный переключатель типа транзакции */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-800">Тип транзакции</label>
          <div className="p-1 bg-gray-100 rounded-xl flex space-x-1">
            <button
              type="button"
              onClick={() => handleTypeChange("expense")}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                selectedType === "expense"
                  ? "bg-red-500 text-white shadow-lg shadow-red-500/25 transform scale-[1.02]"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}>
              <span className="w-2 h-2 rounded-full bg-current"></span>
              <span>Расход</span>
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange("income")}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                selectedType === "income"
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 transform scale-[1.02]"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}>
              <span className="w-2 h-2 rounded-full bg-current"></span>
              <span>Доход</span>
            </button>
          </div>
        </div>

        {/* Группа основных полей */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Сумма */}
          <Controller
            name="amount"
            control={control}
            rules={{
              required: "Сумма обязательна",
              validate: validateAmount
            }}
            render={({ field }) => (
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-800">Сумма</label>
                <div className="relative">
                  <input
                    {...field}
                    type="number"
                    min={0.01}
                    step={0.01}
                    placeholder="0.00"
                    className={`w-full px-4 py-3 border rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 text-lg font-semibold ${
                      errors.amount ? "border-red-300" : "border-gray-200"
                    }`}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium">
                    ₽
                  </div>
                </div>
                {errors.amount && <p className="text-red-500 text-sm">{errors.amount.message}</p>}
              </div>
            )}
          />

          {/* Категория */}
          <Controller
            name="categoryId"
            control={control}
            rules={{ required: "Выберите категорию" }}
            render={({ field }) => (
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-800">Категория</label>
                <Select
                  {...field}
                  options={categoryOptions}
                  placeholder="Выберите категорию"
                  error={errors.categoryId?.message}
                />
              </div>
            )}
          />
        </div>

        {/* Описание */}
        <Controller
          name="description"
          control={control}
          rules={{
            required: "Описание обязательно",
            validate: validateDescription
          }}
          render={({ field }) => (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">Описание</label>
              <input
                {...field}
                type="text"
                placeholder="Например: Покупка продуктов в Магните"
                className={`w-full px-4 py-3 border rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 ${
                  errors.description ? "border-red-300" : "border-gray-200"
                }`}
              />
              {errors.description && (
                <p className="text-red-500 text-sm">{errors.description.message}</p>
              )}
            </div>
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
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">Дата</label>
              <input
                {...field}
                type="date"
                className={`w-full px-4 py-3 border rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 ${
                  errors.date ? "border-red-300" : "border-gray-200"
                }`}
              />
              {errors.date && <p className="text-red-500 text-sm">{errors.date.message}</p>}
            </div>
          )}
        />

        {/* Стильные кнопки действий */}
        <div className="border-t border-gray-100 pt-6 space-y-3">
          {/* Индикатор офлайн режима */}
          {!isOnline && !isEditing && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
              <span className="text-amber-800 text-sm font-medium">
                Офлайн режим: транзакция будет синхронизирована при восстановлении соединения
              </span>
            </div>
          )}

          {/* Предупреждение для редактирования офлайн */}
          {!isOnline && isEditing && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-red-800 text-sm font-medium">
                Редактирование недоступно в офлайн режиме
              </span>
            </div>
          )}

          {/* Основная кнопка */}
          <button
            type="submit"
            disabled={loading || (!isOnline && isEditing)}
            onClick={() =>
              console.log("🟡 Submit button clicked:", { isOnline, loading, isEditing })
            }
            className={`w-full font-semibold py-4 px-6 rounded-xl transition-all duration-200 hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100 flex items-center justify-center space-x-2 ${
              !isOnline && !isEditing
                ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white hover:shadow-amber-500/25"
                : "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white hover:shadow-emerald-500/25"
            } disabled:from-gray-400 disabled:to-gray-500`}>
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Сохранение...</span>
              </>
            ) : !isOnline && !isEditing ? (
              <>
                <span>Сохранить офлайн</span>
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              </>
            ) : (
              <span>{isEditing ? "Сохранить изменения" : "Добавить транзакцию"}</span>
            )}
          </button>

          {/* Кнопка сброса */}
          <button
            type="button"
            onClick={() => reset()}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-xl transition-all duration-200 border border-gray-200 hover:border-gray-300">
            Сбросить форму
          </button>
        </div>
      </form>
    </div>
  )
}
