import React, { useMemo, useState } from "react"
import { FinanceOverview } from "@/components/ui/FinanceOverview"
import { ToggleSlider } from "@/components/ui/ToggleSlider"
import { PageHeader } from "@/components/ui/PageHeader"
import { Modal } from "@/components/ui/Modal"
import { TransactionForm } from "@/components/forms/TransactionForm"
import { Button } from "@/components/ui/Button"
import { useTransactionStoreSupabase } from "@/store/transactionStoreSupabase"
import { useCategoryStoreSupabase } from "@/store/categoryStoreSupabase"
import { ChevronLeft, ChevronRight, TrendingUp, BarChart3, Plus } from "lucide-react"
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from "date-fns"
import { ru } from "date-fns/locale"

const Analytics: React.FC = () => {
  const { transactions } = useTransactionStoreSupabase()
  const { categories } = useCategoryStoreSupabase()

  const [activeTab, setActiveTab] = useState<"expense" | "income">("expense")
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [showDetails, setShowDetails] = useState(false)
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false)

  // Фильтрация транзакций по текущему месяцу
  const currentMonthTransactions = useMemo(() => {
    const startOfCurrentMonth = startOfMonth(currentMonth)
    const endOfCurrentMonth = endOfMonth(currentMonth)

    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date)
      return transactionDate >= startOfCurrentMonth && transactionDate <= endOfCurrentMonth
    })
  }, [transactions, currentMonth])

  // Данные для активной вкладки
  const activeTabData = useMemo(() => {
    const filteredTransactions = currentMonthTransactions.filter((t) => t.type === activeTab)

    const groupedByCategory = filteredTransactions.reduce((acc, transaction) => {
      const categoryId = transaction.categoryId
      if (!acc[categoryId]) {
        acc[categoryId] = {
          id: categoryId,
          amount: 0,
          transactions: []
        }
      }
      acc[categoryId].amount += transaction.amount
      acc[categoryId].transactions.push(transaction)
      return acc
    }, {} as Record<string, { id: string; amount: number; transactions: typeof filteredTransactions }>)

    return Object.values(groupedByCategory)
      .map((group) => {
        const category = categories.find((cat) => cat.id === group.id)
        return {
          id: group.id,
          name: category?.name ?? "Неизвестная категория",
          amount: group.amount,
          color: category?.color ?? "#6B7280",
          icon: category?.icon ?? "💰",
          transactionCount: group.transactions.length
        }
      })
      .filter((item) => item.amount > 0)
      .sort((a, b) => b.amount - a.amount)
  }, [currentMonthTransactions, categories, activeTab])

  const totalAmount = activeTabData.reduce((sum, item) => sum + item.amount, 0)

  // Сравнение с прошлым месяцем
  const prevMonthComparison = useMemo(() => {
    const prevMonth = subMonths(currentMonth, 1)
    const prevMonthStart = startOfMonth(prevMonth)
    const prevMonthEnd = endOfMonth(prevMonth)

    const prevMonthTransactions = transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date)
      return (
        transactionDate >= prevMonthStart &&
        transactionDate <= prevMonthEnd &&
        transaction.type === activeTab
      )
    })

    const prevMonthTotal = prevMonthTransactions.reduce((sum, t) => sum + t.amount, 0)

    if (prevMonthTotal === 0) return null

    const change = ((totalAmount - prevMonthTotal) / prevMonthTotal) * 100
    const isPositive = change > 0

    return {
      change: Math.abs(change),
      isPositive,
      direction: activeTab === "expense" ? !isPositive : isPositive
    }
  }, [transactions, currentMonth, activeTab, totalAmount])

  const handlePreviousMonth = (): void => {
    setCurrentMonth((prev) => subMonths(prev, 1))
  }

  const handleNextMonth = (): void => {
    setCurrentMonth((prev) => addMonths(prev, 1))
  }

  const handleCategoryClick = (_categoryId: string): void => {
    // Логика для детального просмотра категории
  }

  const handleToggleChange = (value: "left" | "right"): void => {
    setActiveTab(value === "left" ? "expense" : "income")
  }

  const handleAddTransaction = (): void => {
    setIsTransactionModalOpen(true)
  }

  const handleTransactionSuccess = (): void => {
    setIsTransactionModalOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container">
        {/* Unified Header */}
        <PageHeader
          title="Анализ финансов"
          subtitle={format(currentMonth, "LLLL yyyy", { locale: ru })}
          description="Анализируйте свои доходы и расходы по категориям. Отслеживайте тренды и контролируйте бюджет."
          icon={<BarChart3 className="w-5 h-5 text-white" />}
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

        <div className="space-y-4">
          {/* Toggle Slider */}
          <ToggleSlider
            leftLabel="Расходы"
            rightLabel="Доходы"
            value={activeTab === "expense" ? "left" : "right"}
            onChange={handleToggleChange}
          />

          {/* Month Navigation */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between">
              <button
                onClick={handlePreviousMonth}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>

              <div className="text-center">
                <div className="font-medium text-gray-900">
                  {format(currentMonth, "LLLL yyyy", { locale: ru })}
                </div>
                <div className="flex items-center justify-center mt-1 text-sm text-gray-500">
                  <span className="mr-2">
                    {currentMonthTransactions.filter((t) => t.type === activeTab).length} операций
                  </span>
                  {prevMonthComparison && (
                    <div className="flex items-center">
                      <TrendingUp
                        className={`w-3 h-3 mr-1 ${
                          prevMonthComparison.direction ? "text-green-500" : "text-red-500"
                        }`}
                        style={{
                          transform: prevMonthComparison.direction ? "none" : "rotate(180deg)"
                        }}
                      />
                      <span
                        className={`text-xs ${
                          prevMonthComparison.direction ? "text-green-600" : "text-red-600"
                        }`}>
                        {prevMonthComparison.change.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleNextMonth}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Main Content */}
          <FinanceOverview
            totalAmount={totalAmount}
            categories={activeTabData}
            type={activeTab}
            period={format(currentMonth, "LLLL yyyy", { locale: ru })}
            onCategoryClick={handleCategoryClick}
            maxVisibleCategories={4}
          />

          {/* Optional Details */}
          {currentMonthTransactions.length > 0 && (
            <div className="mt-4">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="w-full p-3 text-center text-sm text-gray-500 hover:text-gray-700 transition-colors">
                {showDetails ? "Скрыть статистику" : "Показать статистику"}
              </button>

              {showDetails && (
                <div className="mt-3 bg-white rounded-xl p-4 shadow-sm">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Средний чек:</span>
                      <div className="font-medium">
                        {(
                          totalAmount /
                          (currentMonthTransactions.filter((t) => t.type === activeTab).length || 1)
                        ).toLocaleString("ru-RU", {
                          style: "currency",
                          currency: "RUB",
                          minimumFractionDigits: 0
                        })}
                      </div>
                    </div>
                    {activeTabData.length > 0 && (
                      <div>
                        <span className="text-gray-500">Топ категория:</span>
                        <div className="font-medium">{activeTabData[0]?.name}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Add Transaction Modal */}
        <Modal isOpen={isTransactionModalOpen} onClose={() => setIsTransactionModalOpen(false)}>
          <TransactionForm onSuccess={handleTransactionSuccess} />
        </Modal>
      </div>
    </div>
  )
}

export default Analytics
