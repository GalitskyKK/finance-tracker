import React, { useMemo, useState } from "react"
import { PieChart } from "@/components/charts/PieChart"
import { LineChart } from "@/components/charts/LineChart"
import { useTransactionStoreSupabase } from "@/store/transactionStoreSupabase"
import { useCategoryStoreSupabase } from "@/store/categoryStoreSupabase"
import {
  TrendingUp,
  TrendingDown,
  Eye,
  BarChart3,
  Calendar,
  Award,
  AlertCircle
} from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns"
import { ru } from "date-fns/locale"
import { formatCurrency } from "@/utils/formatters"

const Analytics: React.FC = () => {
  const { transactions } = useTransactionStoreSupabase()
  const { categories } = useCategoryStoreSupabase()
  const [showDetails, setShowDetails] = useState(false)

  // Данные для pie chart расходов по категориям
  const expenseDataByCategory = useMemo(() => {
    const expenseTransactions = transactions.filter((t) => t.type === "expense")
    const categoryTotals = new Map<string, number>()

    expenseTransactions.forEach((transaction) => {
      const current = categoryTotals.get(transaction.categoryId) ?? 0
      categoryTotals.set(transaction.categoryId, current + transaction.amount)
    })

    return Array.from(categoryTotals.entries())
      .map(([categoryId, amount]) => {
        const category = categories.find((c) => c.id === categoryId)
        return {
          name: category?.name ?? "Неизвестная категория",
          value: amount,
          color: category?.color ?? "#6B7280"
        }
      })
      .sort((a, b) => b.value - a.value)
  }, [transactions, categories])

  // Данные для pie chart доходов по категориям
  const incomeDataByCategory = useMemo(() => {
    const incomeTransactions = transactions.filter((t) => t.type === "income")
    const categoryTotals = new Map<string, number>()

    incomeTransactions.forEach((transaction) => {
      const current = categoryTotals.get(transaction.categoryId) ?? 0
      categoryTotals.set(transaction.categoryId, current + transaction.amount)
    })

    return Array.from(categoryTotals.entries())
      .map(([categoryId, amount]) => {
        const category = categories.find((c) => c.id === categoryId)
        return {
          name: category?.name ?? "Неизвестная категория",
          value: amount,
          color: category?.color ?? "#6B7280"
        }
      })
      .sort((a, b) => b.value - a.value)
  }, [transactions, categories])

  // Данные для line chart по дням текущего месяца
  const dailyData = useMemo(() => {
    const now = new Date()
    const startOfCurrentMonth = startOfMonth(now)
    const endOfCurrentMonth = endOfMonth(now)

    const days = eachDayOfInterval({
      start: startOfCurrentMonth,
      end: endOfCurrentMonth
    })

    return days.map((day) => {
      const dayTransactions = transactions.filter((transaction) => {
        const transactionDate = new Date(transaction.date)
        return isSameDay(transactionDate, day)
      })

      const income = dayTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0)

      const expense = dayTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0)

      const balance = income - expense

      return {
        name: format(day, "dd.MM"),
        income,
        expense,
        balance
      }
    })
  }, [transactions])

  // Данные для line chart по месяцам
  const monthlyData = useMemo(() => {
    const monthlyTotals = new Map<string, { income: number; expense: number }>()

    transactions.forEach((transaction) => {
      const monthKey = format(new Date(transaction.date), "yyyy-MM")
      const current = monthlyTotals.get(monthKey) ?? { income: 0, expense: 0 }

      if (transaction.type === "income") {
        current.income += transaction.amount
      } else {
        current.expense += transaction.amount
      }

      monthlyTotals.set(monthKey, current)
    })

    return Array.from(monthlyTotals.entries())
      .map(([month, totals]) => ({
        name: format(new Date(month + "-01"), "MMM yyyy"),
        income: totals.income,
        expense: totals.expense,
        balance: totals.income - totals.expense
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [transactions])

  // Умные инсайты
  const insights = useMemo(() => {
    if (transactions.length === 0) return []

    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0)
    const totalExpenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0)

    const topExpenseCategory = expenseDataByCategory[0]
    const topIncomeCategory = incomeDataByCategory[0]

    const insights = []

    // Главная категория расходов
    if (topExpenseCategory) {
      const percentage = ((topExpenseCategory.value / totalExpenses) * 100).toFixed(0)
      insights.push({
        icon: <TrendingDown className="h-5 w-5" />,
        title: "Больше всего тратите на",
        value: topExpenseCategory.name,
        description: `${percentage}% от всех расходов (${formatCurrency(
          topExpenseCategory.value
        )})`,
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200"
      })
    }

    // Главная категория доходов
    if (topIncomeCategory) {
      const percentage = ((topIncomeCategory.value / totalIncome) * 100).toFixed(0)
      insights.push({
        icon: <TrendingUp className="h-5 w-5" />,
        title: "Основной источник дохода",
        value: topIncomeCategory.name,
        description: `${percentage}% от всех доходов (${formatCurrency(topIncomeCategory.value)})`,
        color: "text-emerald-600",
        bgColor: "bg-emerald-50",
        borderColor: "border-emerald-200"
      })
    }

    // Финансовое здоровье
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0
    if (savingsRate > 0) {
      insights.push({
        icon: <Award className="h-5 w-5" />,
        title: "Уровень сбережений",
        value: `${savingsRate.toFixed(0)}%`,
        description:
          savingsRate >= 20
            ? "Отличный результат! 🎉"
            : savingsRate >= 10
            ? "Хорошо, можно лучше"
            : "Стоит сократить расходы",
        color: "text-purple-600",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-200"
      })
    }

    return insights
  }, [expenseDataByCategory, incomeDataByCategory, transactions])

  // Пустое состояние
  if (transactions.length === 0) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Ваши финансовые отчеты</h1>
              <p className="text-gray-600 mt-1">
                Понимайте куда идут ваши деньги и принимайте умные решения
              </p>
            </div>
          </div>
        </div>

        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center">
            <BarChart3 className="w-10 h-10 text-purple-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Пока нет данных для анализа</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Начните добавлять транзакции, и здесь появятся красивые графики и полезные инсайты о
            ваших тратах!
          </p>
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4 max-w-sm mx-auto">
            <div className="flex items-center space-x-2 text-purple-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Совет: добавьте хотя бы 5-10 транзакций</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Дружелюбный заголовок */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Ваши финансовые отчеты</h1>
            <p className="text-gray-600 mt-1">
              Понимайте куда идут ваши деньги и принимайте умные решения
            </p>
          </div>
        </div>
      </div>

      {/* Ключевые инсайты */}
      {insights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {insights.map((insight, index) => (
            <div
              key={index}
              className={`p-6 rounded-2xl border ${insight.bgColor} ${insight.borderColor} hover:shadow-lg transition-all duration-200`}>
              <div className="flex items-start space-x-3">
                <div
                  className={`p-2 rounded-xl ${insight.color.replace(
                    "text-",
                    "text-"
                  )} bg-white/50`}>
                  {insight.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-700 mb-1">{insight.title}</h3>
                  <p className={`text-lg font-bold ${insight.color} mb-1 truncate`}>
                    {insight.value}
                  </p>
                  <p className="text-xs text-gray-600">{insight.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Основной график - куда тратятся деньги */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Куда уходят ваши деньги?</h2>
              <p className="text-gray-600 text-sm">Распределение расходов по категориям</p>
            </div>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
              <Eye className="h-4 w-4" />
              <span className="text-sm font-medium">
                {showDetails ? "Скрыть детали" : "Показать детали"}
              </span>
            </button>
          </div>
        </div>

        <div className="p-6">
          {expenseDataByCategory.length > 0 ? (
            <PieChart data={expenseDataByCategory} title="" height={400} showLegend={true} />
          ) : (
            <div className="text-center py-12 text-gray-500">
              <TrendingDown className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Пока нет расходов для анализа</p>
            </div>
          )}
        </div>
      </div>

      {/* Дополнительная информация */}
      {showDetails && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Доходы по категориям */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">Откуда приходят деньги</h3>
              </div>
              <div className="p-4">
                {incomeDataByCategory.length > 0 ? (
                  <PieChart data={incomeDataByCategory} title="" height={300} />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Нет доходов</p>
                  </div>
                )}
              </div>
            </div>

            {/* Топ категории */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">Топ категории расходов</h3>
              </div>
              <div className="p-4 space-y-3">
                {expenseDataByCategory.slice(0, 5).map((item, index) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div
                        className="flex items-center justify-center w-8 h-8 rounded-full text-white text-xs font-bold"
                        style={{ backgroundColor: item.color }}>
                        {index + 1}
                      </div>
                      <span className="font-medium text-gray-700">{item.name}</span>
                    </div>
                    <span className="font-bold text-gray-900">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* График по месяцам */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-gray-600" />
                <h3 className="font-bold text-gray-900">Тренд по месяцам</h3>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Как менялись ваши доходы и расходы со временем
              </p>
            </div>
            <div className="p-4">
              <LineChart
                data={monthlyData}
                title=""
                height={350}
                lines={[
                  { dataKey: "income", color: "#10B981", name: "Доходы" },
                  { dataKey: "expense", color: "#EF4444", name: "Расходы" },
                  { dataKey: "balance", color: "#6366F1", name: "Баланс" }
                ]}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Analytics
