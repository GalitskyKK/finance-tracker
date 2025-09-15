import React, { useMemo, useState } from "react"
import { PieChart } from "@/components/charts/PieChart"
import { LineChart } from "@/components/charts/LineChart"
import { useTransactionStoreSupabase } from "@/store/transactionStoreSupabase"
import { useCategoryStoreSupabase } from "@/store/categoryStoreSupabase"
import {
  BarChart3,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from "date-fns"
import { ru } from "date-fns/locale"
import { formatCurrency } from "@/utils/formatters"

const Analytics: React.FC = () => {
  const { transactions } = useTransactionStoreSupabase()
  const { categories } = useCategoryStoreSupabase()

  // Состояние для управления интерфейсом
  const [activeTab, setActiveTab] = useState<"expense" | "income">("expense")
  const [currentMonth, setCurrentMonth] = useState(new Date())

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
    const categoryTotals = new Map<string, { amount: number; count: number }>()

    filteredTransactions.forEach((transaction) => {
      const current = categoryTotals.get(transaction.categoryId) ?? { amount: 0, count: 0 }
      categoryTotals.set(transaction.categoryId, {
        amount: current.amount + transaction.amount,
        count: current.count + 1
      })
    })

    return Array.from(categoryTotals.entries())
      .map(([categoryId, data]) => {
        const category = categories.find((c) => c.id === categoryId)
        return {
          id: categoryId,
          name: category?.name ?? "Неизвестная категория",
          value: data.amount,
          count: data.count,
          color: category?.color ?? "#6B7280",
          icon: category?.icon ?? "💰"
        }
      })
      .sort((a, b) => b.value - a.value)
  }, [currentMonthTransactions, activeTab, categories])

  // Общая сумма за месяц
  const totalAmount = useMemo(() => {
    return activeTabData.reduce((sum, item) => sum + item.value, 0)
  }, [activeTabData])

  // Навигация по месяцам
  const goToPreviousMonth = () => setCurrentMonth((prev) => subMonths(prev, 1))
  const goToNextMonth = () => setCurrentMonth((prev) => addMonths(prev, 1))
  const isCurrentMonth = format(currentMonth, "yyyy-MM") === format(new Date(), "yyyy-MM")

  // Данные для тренда (последние 6 месяцев)
  const trendData = useMemo(() => {
    const months = []
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(currentMonth, i)
      months.push(monthDate)
    }

    return months.map((month) => {
      const startOfThisMonth = startOfMonth(month)
      const endOfThisMonth = endOfMonth(month)

      const monthTransactions = transactions.filter((transaction) => {
        const transactionDate = new Date(transaction.date)
        return transactionDate >= startOfThisMonth && transactionDate <= endOfThisMonth
      })

      const income = monthTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0)

      const expense = monthTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0)

      return {
        name: format(month, "MMM", { locale: ru }),
        income,
        expense,
        balance: income - expense
      }
    })
  }, [transactions, currentMonth])

  // Показываем только первые 4 категории, остальные группируем
  const displayData = useMemo(() => {
    const visible = activeTabData.slice(0, 4)
    const hidden = activeTabData.slice(4)

    if (hidden.length > 0) {
      const hiddenTotal = hidden.reduce((sum, item) => sum + item.value, 0)
      const hiddenCount = hidden.reduce((sum, item) => sum + item.count, 0)

      return {
        visible,
        hidden: {
          count: hidden.length,
          amount: hiddenTotal,
          transactions: hiddenCount
        }
      }
    }

    return { visible, hidden: null }
  }, [activeTabData])

  // Пустое состояние
  if (transactions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center">
            <BarChart3 className="w-10 h-10 text-purple-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Пока нет данных для анализа</h3>
          <p className="text-gray-500 mb-6">
            Начните добавлять транзакции, и здесь появятся красивые графики!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Мобильная версия (стиль Сбербанка) */}
      <div className="lg:hidden">
        <div className="bg-white">
          {/* Заголовок */}
          <div className="px-4 pt-6 pb-4">
            <h1 className="text-lg font-semibold text-gray-900">Анализ финансов</h1>
          </div>

          {/* Переключатель вкладок */}
          <div className="px-4 pb-6">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab("expense")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === "expense"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}>
                Расходы
              </button>
              <button
                onClick={() => setActiveTab("income")}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === "income"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}>
                Доходы
              </button>
            </div>
          </div>

          {/* Общая сумма */}
          <div className="px-4 pb-6 rounded-xl">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {formatCurrency(totalAmount)}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">
                {format(currentMonth, "LLLL yyyy", { locale: ru })}
              </span>
              <div className="flex items-center space-x-2">
                <button onClick={goToPreviousMonth} className="p-1 hover:bg-gray-100 rounded">
                  <ChevronLeft className="h-4 w-4 text-gray-600" />
                </button>
                <button
                  onClick={goToNextMonth}
                  disabled={isCurrentMonth}
                  className="p-1 hover:bg-gray-100 rounded disabled:opacity-50">
                  <ChevronRight className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Donut Chart */}
        <div className="bg-white rounded-xl shadow-sm mt-4">
          <div className="p-6">
            {activeTabData.length > 0 ? (
              <PieChart
                data={activeTabData.map((item) => ({
                  name: item.name,
                  value: item.value,
                  color: item.color
                }))}
                title=""
                height={300}
                showLegend={false}
                isDonut={true}
                centerText={format(currentMonth, "LLLL", { locale: ru })}
              />
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="text-lg font-medium mb-2">Нет данных</div>
                <div className="text-sm">
                  {activeTab === "expense" ? "Нет расходов" : "Нет доходов"} за этот месяц
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Список категорий */}
        <div className="bg-white rounded-xl shadow-sm mt-4">
          <div className="p-4 space-y-4">
            {displayData.visible.map((item) => (
              <div key={item.id} className="flex items-center space-x-3">
                <div className="text-2xl">{item.icon}</div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{item.name}</div>
                  <div className="text-sm text-gray-500">{item.count} операций</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{formatCurrency(item.value)}</div>
                </div>
              </div>
            ))}

            {displayData.hidden && (
              <div className="pt-4 border-t border-gray-100">
                <div className="text-sm text-gray-600">
                  Ещё {displayData.hidden.count} категорий на{" "}
                  {formatCurrency(displayData.hidden.amount)}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="h-20"></div> {/* Отступ для мобильной навигации */}
      </div>

      {/* Десктопная версия (сплит-экран) */}
      <div className="hidden lg:block p-8">
        <div className="max-w-7xl mx-auto">
          {/* Заголовок */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Анализ финансов</h1>
            <p className="text-gray-600">Понимайте свои траты и принимайте умные решения</p>
          </div>

          {/* Сплит-экран */}
          <div className="grid grid-cols-2 gap-8">
            {/* Левая панель - график и управление */}
            <div className="space-y-6">
              {/* Переключатель и навигация */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setActiveTab("expense")}
                      className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        activeTab === "expense"
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}>
                      Расходы
                    </button>
                    <button
                      onClick={() => setActiveTab("income")}
                      className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        activeTab === "income"
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}>
                      Доходы
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={goToPreviousMonth}
                      className="p-2 hover:bg-gray-100 rounded-lg">
                      <ChevronLeft className="h-4 w-4 text-gray-600" />
                    </button>
                    <span className="text-sm font-medium text-gray-900 min-w-[120px] text-center">
                      {format(currentMonth, "LLLL yyyy", { locale: ru })}
                    </span>
                    <button
                      onClick={goToNextMonth}
                      disabled={isCurrentMonth}
                      className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50">
                      <ChevronRight className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                </div>

                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {formatCurrency(totalAmount)}
                  </div>
                  <div className="text-gray-600">
                    {activeTab === "expense" ? "Общие расходы" : "Общие доходы"} за месяц
                  </div>
                </div>

                {/* Donut Chart */}
                {activeTabData.length > 0 ? (
                  <PieChart
                    data={activeTabData.map((item) => ({
                      name: item.name,
                      value: item.value,
                      color: item.color
                    }))}
                    title=""
                    height={400}
                    showLegend={false}
                    isDonut={true}
                    centerText={format(currentMonth, "LLLL", { locale: ru })}
                  />
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-lg font-medium mb-2">Нет данных</div>
                    <div className="text-sm">
                      {activeTab === "expense" ? "Нет расходов" : "Нет доходов"} за этот месяц
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Правая панель - список и тренд */}
            <div className="space-y-6">
              {/* Список категорий */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {activeTab === "expense" ? "Категории расходов" : "Категории доходов"}
                </h3>

                <div className="space-y-4">
                  {displayData.visible.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="text-2xl">{item.icon}</div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.count} операций</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">
                          {formatCurrency(item.value)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {totalAmount > 0
                            ? `${((item.value / totalAmount) * 100).toFixed(1)}%`
                            : "0%"}
                        </div>
                      </div>
                    </div>
                  ))}

                  {displayData.hidden && (
                    <div className="pt-4 border-t border-gray-100">
                      <div className="text-sm text-gray-600 text-center">
                        Ещё {displayData.hidden.count} категорий на{" "}
                        {formatCurrency(displayData.hidden.amount)}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Мини-тренд */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Тренд по месяцам</h3>
                <LineChart
                  data={trendData}
                  title=""
                  height={200}
                  showLegend={false}
                  lines={[
                    activeTab === "expense"
                      ? { dataKey: "expense", color: "#EF4444", name: "Расходы" }
                      : { dataKey: "income", color: "#10B981", name: "Доходы" }
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics
