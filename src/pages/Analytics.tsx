import React, { useMemo } from "react"
import { PieChart } from "@/components/charts/PieChart"
import { LineChart } from "@/components/charts/LineChart"
import { useTransactionStoreSupabase } from "@/store/transactionStoreSupabase"
import { useCategoryStoreSupabase } from "@/store/categoryStoreSupabase"

import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval } from "date-fns"

const Analytics: React.FC = () => {
  const { transactions } = useTransactionStoreSupabase()
  const { categories } = useCategoryStoreSupabase()

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
        return isWithinInterval(transactionDate, {
          start: day,
          end: day
        })
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

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Аналитика</h1>
        <p className="text-gray-600">Детальный анализ ваших финансовых данных</p>
      </div>

      {/* Графики по категориям */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PieChart data={expenseDataByCategory} title="Расходы по категориям" height={350} />

        <PieChart data={incomeDataByCategory} title="Доходы по категориям" height={350} />
      </div>

      {/* Графики по времени */}
      <div className="grid grid-cols-1 gap-6">
        <LineChart
          data={dailyData}
          title="Динамика по дням (текущий месяц)"
          height={400}
          lines={[
            { dataKey: "income", color: "#10B981", name: "Доходы" },
            { dataKey: "expense", color: "#EF4444", name: "Расходы" },
            { dataKey: "balance", color: "#3B82F6", name: "Баланс" }
          ]}
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <LineChart
          data={monthlyData}
          title="Динамика по месяцам"
          height={400}
          lines={[
            { dataKey: "income", color: "#10B981", name: "Доходы" },
            { dataKey: "expense", color: "#EF4444", name: "Расходы" },
            { dataKey: "balance", color: "#3B82F6", name: "Баланс" }
          ]}
        />
      </div>

      {/* Дополнительная статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Топ категории расходов</h3>
          <div className="space-y-3">
            {expenseDataByCategory.slice(0, 5).map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-gray-700">{item.name}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {item.value.toLocaleString("ru-RU")} ₽
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Топ категории доходов</h3>
          <div className="space-y-3">
            {incomeDataByCategory.slice(0, 5).map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-gray-700">{item.name}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {item.value.toLocaleString("ru-RU")} ₽
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Общая статистика</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Всего транзакций:</span>
              <span className="text-sm font-semibold">{transactions.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Категорий:</span>
              <span className="text-sm font-semibold">{categories.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Средняя транзакция:</span>
              <span className="text-sm font-semibold">
                {transactions.length > 0
                  ? (
                      transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length
                    ).toLocaleString("ru-RU") + " ₽"
                  : "0 ₽"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics
