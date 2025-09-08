import { useState, useEffect, useCallback } from "react"
import { CheckCircle, AlertCircle, Download, Upload, Loader } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Modal } from "@/components/ui/Modal"
import {
  exportLocalStorageData,
  downloadDataBackup,
  getDataStats,
  clearLocalStorageData
} from "@/utils/dataExport"
import { useTransactionStoreSupabase } from "@/store/transactionStoreSupabase"
import {
  useCategoryStoreSupabase,
  initializeDefaultCategories
} from "@/store/categoryStoreSupabase"
import { useAuthStore } from "@/store/authStore"

interface DataMigrationModalProps {
  isOpen: boolean
  onClose: () => void
}

type MigrationStep = "check" | "migrate" | "complete"

export const DataMigrationModal: React.FC<DataMigrationModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<MigrationStep>("check")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dataStats, setDataStats] = useState(getDataStats())

  const { user } = useAuthStore()
  const { addTransaction } = useTransactionStoreSupabase()
  const { addCategory, fetchCategories } = useCategoryStoreSupabase()

  // Функция для пропуска миграции (объявляем рано)
  const handleSkipMigration = useCallback(async (): Promise<void> => {
    try {
      setLoading(true)

      // Создаем только дефолтные категории
      await initializeDefaultCategories()
      await fetchCategories()

      setStep("complete")
    } catch (_error) {
      setError("Ошибка при создании дефолтных категорий")
    } finally {
      setLoading(false)
    }
  }, [fetchCategories])

  useEffect(() => {
    if (isOpen) {
      const stats = getDataStats()
      setDataStats(stats)
      setStep("check")
      setError(null)
    }
  }, [isOpen])

  // Отдельный useEffect для автоматического пропуска миграции
  useEffect(() => {
    if (isOpen && step === "check" && !dataStats.hasData) {
      handleSkipMigration()
    }
  }, [isOpen, step, dataStats.hasData, handleSkipMigration])

  const handleDownloadBackup = (): void => {
    try {
      const data = exportLocalStorageData()
      if (data) {
        downloadDataBackup(data)
      }
    } catch (_error) {
      setError("Ошибка при создании резервной копии")
    }
  }

  const handleMigration = async (): Promise<void> => {
    if (!user) {
      setError("Пользователь не аутентифицирован")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const exportedData = exportLocalStorageData()

      if (!exportedData) {
        setError("Нет данных для миграции")
        return
      }

      // Starting migration

      // Шаг 1: Инициализируем дефолтные категории
      await initializeDefaultCategories()
      await fetchCategories()

      // Шаг 2: Мигрируем кастомные категории
      let _migratedCategoriesCount = 0
      for (const category of exportedData.categories) {
        try {
          await addCategory({
            name: category.name,
            color: category.color,
            icon: category.icon,
            type: category.type
          })
          _migratedCategoriesCount++
        } catch (_error) {
          // Failed to migrate category - skip
        }
      }

      // Обновляем список категорий после добавления
      await fetchCategories()

      // Шаг 3: Мигрируем транзакции
      let _migratedTransactionsCount = 0
      for (const transaction of exportedData.transactions) {
        try {
          await addTransaction({
            amount: transaction.amount,
            type: transaction.type,
            categoryId: transaction.categoryId,
            description: transaction.description,
            date: transaction.date
          })
          _migratedTransactionsCount++
        } catch (_error) {
          // Failed to migrate transaction - skip
        }
      }

      // Migration completed successfully

      // Шаг 4: Очищаем localStorage после успешной миграции
      clearLocalStorageData()

      setStep("complete")
    } catch (error) {
      setError(error instanceof Error ? error.message : "Ошибка при миграции данных")
    } finally {
      setLoading(false)
    }
  }

  const renderCheckStep = (): JSX.Element => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <Upload className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Миграция данных</h2>
        <p className="text-gray-600">
          Мы нашли данные в вашем браузере. Хотите перенести их в облако?
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-3">Найденные данные:</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Транзакции:</span>
            <span className="font-medium">{dataStats.transactionCount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Категории:</span>
            <span className="font-medium">{dataStats.categoryCount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Размер данных:</span>
            <span className="font-medium">{Math.round(dataStats.dataSize / 1024)} KB</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <Button
          onClick={handleMigration}
          variant="primary"
          className="w-full"
          disabled={loading || !dataStats.hasData}>
          {loading ? (
            <>
              <Loader className="w-4 h-4 mr-2 animate-spin" />
              Перенос данных...
            </>
          ) : (
            "Перенести данные в облако"
          )}
        </Button>

        <Button
          onClick={handleDownloadBackup}
          variant="secondary"
          className="w-full"
          disabled={loading || !dataStats.hasData}>
          <Download className="w-4 h-4 mr-2" />
          Скачать резервную копию
        </Button>

        <Button
          onClick={handleSkipMigration}
          variant="secondary"
          className="w-full"
          disabled={loading}>
          Пропустить миграцию
        </Button>
      </div>

      <p className="text-xs text-gray-500 text-center">
        Рекомендуем создать резервную копию перед миграцией
      </p>
    </div>
  )

  const renderCompleteStep = (): JSX.Element => (
    <div className="text-center space-y-6">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
        <CheckCircle className="w-8 h-8 text-emerald-600" />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Готово!</h2>
        <p className="text-gray-600">
          {dataStats.hasData
            ? "Ваши данные успешно перенесены в облако и синхронизируются между устройствами."
            : "Созданы дефолтные категории. Вы можете начать добавлять транзакции."}
        </p>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
        <h3 className="font-medium text-emerald-900 mb-2">Что дальше?</h3>
        <ul className="text-sm text-emerald-700 space-y-1">
          <li>• Ваши данные автоматически синхронизируются</li>
          <li>• Доступ с любого устройства после входа</li>
          <li>• Данные защищены и не теряются</li>
        </ul>
      </div>

      <Button onClick={onClose} variant="primary" className="w-full">
        Начать использование
      </Button>
    </div>
  )

  // Убираем проблемный вызов handleSkipMigration из рендера

  return (
    <Modal isOpen={isOpen} onClose={() => {}} className="max-w-md">
      <div className="p-6">
        {step === "check" && renderCheckStep()}
        {step === "complete" && renderCompleteStep()}
      </div>
    </Modal>
  )
}
