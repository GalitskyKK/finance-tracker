import React, { useMemo } from "react"
import { TrendingUp, TrendingDown, Wallet, Target } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { useTransactionStoreSupabase } from "@/store/transactionStoreSupabase"
import { formatCurrency } from "@/utils/formatters"
import { format, startOfMonth, endOfMonth, isWithinInterval } from "date-fns"
import { ru } from "date-fns/locale"

interface DashboardProps {
  className?: string
}

export const Dashboard: React.FC<DashboardProps> = ({ className = "" }) => {
  const { transactions } = useTransactionStoreSupabase()

  // Вычисляем статистику
  const stats = useMemo(() => {
    const now = new Date()
    const startOfCurrentMonth = startOfMonth(now)
    const endOfCurrentMonth = endOfMonth(now)

    // Все транзакции
    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0)

    const totalBalance = totalIncome - totalExpenses

    // Транзакции за текущий месяц
    const currentMonthTransactions = transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date)
      return isWithinInterval(transactionDate, {
        start: startOfCurrentMonth,
        end: endOfCurrentMonth
      })
    })

    const monthlyIncome = currentMonthTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0)

    const monthlyExpenses = currentMonthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0)

    const monthlyBalance = monthlyIncome - monthlyExpenses

    // Количество транзакций
    const totalTransactions = transactions.length
    const monthlyTransactions = currentMonthTransactions.length

    return {
      totalBalance,
      totalIncome,
      totalExpenses,
      monthlyBalance,
      monthlyIncome,
      monthlyExpenses,
      totalTransactions,
      monthlyTransactions
    }
  }, [transactions])

  const StatCard: React.FC<{
    title: string
    value: string
    subtitle?: string
    icon: React.ReactNode
    color: "green" | "red" | "blue" | "purple"
    trend?: {
      value: number
      isPositive: boolean
    }
  }> = ({ title, value, subtitle, icon, color, trend }) => {
    const colorClasses = {
      green: "bg-green-500 text-white",
      red: "bg-red-500 text-white",
      blue: "bg-blue-500 text-white",
      purple: "bg-purple-500 text-white"
    }

    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
              <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
              {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
              {trend && (
                <div
                  className={`flex items-center text-sm mt-2 ${
                    trend.isPositive ? "text-green-600" : "text-red-600"
                  }`}>
                  {trend.isPositive ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  )}
                  {Math.abs(trend.value)}%
                </div>
              )}
            </div>
            <div className={`p-3 rounded-full ${colorClasses[color]}`}>{icon}</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={className}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Дашборд</h1>
        <p className="text-gray-600">
          Обзор ваших финансов на {format(new Date(), "MMMM yyyy", { locale: ru })}
        </p>
      </div>

      {/* Основные метрики */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Общий баланс"
          value={formatCurrency(stats.totalBalance)}
          subtitle="За все время"
          icon={<Wallet className="h-6 w-6" />}
          color={stats.totalBalance >= 0 ? "green" : "red"}
        />

        <StatCard
          title="Доходы"
          value={formatCurrency(stats.totalIncome)}
          subtitle="За все время"
          icon={<TrendingUp className="h-6 w-6" />}
          color="green"
        />

        <StatCard
          title="Расходы"
          value={formatCurrency(stats.totalExpenses)}
          subtitle="За все время"
          icon={<TrendingDown className="h-6 w-6" />}
          color="red"
        />

        <StatCard
          title="Транзакции"
          value={stats.totalTransactions.toString()}
          subtitle={`${stats.monthlyTransactions} в этом месяце`}
          icon={<Target className="h-6 w-6" />}
          color="blue"
        />
      </div>

      {/* Месячная статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Месячный баланс</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p
                className={`text-3xl font-bold ${
                  stats.monthlyBalance >= 0 ? "text-green-600" : "text-red-600"
                }`}>
                {formatCurrency(stats.monthlyBalance)}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {format(new Date(), "MMMM yyyy", { locale: ru })}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Месячные доходы</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(stats.monthlyIncome)}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {stats.monthlyIncome > 0 && (
                  <span>
                    {((stats.monthlyIncome / stats.totalIncome) * 100).toFixed(1)}% от общих доходов
                  </span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Месячные расходы</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">
                {formatCurrency(stats.monthlyExpenses)}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {stats.monthlyExpenses > 0 && (
                  <span>
                    {((stats.monthlyExpenses / stats.totalExpenses) * 100).toFixed(1)}% от общих
                    расходов
                  </span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Быстрая статистика */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Средние показатели</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Средний доход за транзакцию:</span>
              <span className="font-semibold">
                {stats.totalIncome > 0
                  ? formatCurrency(
                      stats.totalIncome / transactions.filter((t) => t.type === "income").length
                    )
                  : formatCurrency(0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Средний расход за транзакцию:</span>
              <span className="font-semibold">
                {stats.totalExpenses > 0
                  ? formatCurrency(
                      stats.totalExpenses / transactions.filter((t) => t.type === "expense").length
                    )
                  : formatCurrency(0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Транзакций в месяц:</span>
              <span className="font-semibold">{stats.monthlyTransactions}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Финансовое здоровье</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Соотношение доходов к расходам:</span>
              <span className="font-semibold">
                {stats.totalExpenses > 0
                  ? (stats.totalIncome / stats.totalExpenses).toFixed(2)
                  : "∞"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Экономия:</span>
              <span
                className={`font-semibold ${
                  stats.totalBalance >= 0 ? "text-green-600" : "text-red-600"
                }`}>
                {stats.totalIncome > 0
                  ? `${((stats.totalBalance / stats.totalIncome) * 100).toFixed(1)}%`
                  : "0%"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Статус:</span>
              <span
                className={`font-semibold ${
                  stats.totalBalance >= 0 ? "text-green-600" : "text-red-600"
                }`}>
                {stats.totalBalance >= 0 ? "Положительный" : "Отрицательный"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
