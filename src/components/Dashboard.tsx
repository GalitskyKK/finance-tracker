import React, { useMemo } from "react"
import { TrendingUp, TrendingDown, Target, Calendar, Home, Award, PiggyBank } from "lucide-react"
import { useTransactionFilterStore } from "@/store/transactionFilterStore"
import { useTransactionStoreSupabase } from "@/store/transactionStoreSupabase"
import { useSavingsStoreSupabase } from "@/store/savingsStoreSupabase"
import type { BalanceWithSavings } from "@/types"
import { formatCurrency } from "@/utils/formatters"
import { format, startOfMonth, endOfMonth, isWithinInterval } from "date-fns"
import { ru } from "date-fns/locale"
import { PageHeader } from "@/components/ui/PageHeader"

interface DashboardProps {
  className?: string
  onPageChange?: (page: string) => void
}

export const Dashboard: React.FC<DashboardProps> = ({ className = "", onPageChange }) => {
  const { transactions } = useTransactionStoreSupabase()
  const savingsStore = useSavingsStoreSupabase()
  const { setFilter } = useTransactionFilterStore()

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

    // Данные о сбережениях
    const balanceData: BalanceWithSavings = savingsStore.getBalanceWithSavings(totalBalance)
    const activeSavingsGoals = savingsStore.savingsGoals.filter((goal) => goal.isActive)

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

    // Количество транзакций
    const totalTransactions = transactions.length
    const monthlyTransactions = currentMonthTransactions.length

    return {
      totalBalance,
      totalIncome,
      totalExpenses,
      monthlyIncome,
      monthlyExpenses,
      totalTransactions,
      monthlyTransactions,
      balanceData,
      activeSavingsGoals
    }
  }, [transactions, savingsStore])

  const ModernStatCard: React.FC<{
    title: string
    value: string
    subtitle?: string
    icon: React.ReactNode
    gradient: string
    iconColor: string
    description?: string
    onClick?: () => void
  }> = ({ title, value, subtitle, icon, gradient, iconColor, description, onClick }) => {
    return (
      <div
        onClick={onClick}
        className={`relative bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-200 group overflow-hidden ${
          onClick ? "cursor-pointer hover:scale-[1.02] active:scale-[0.98]" : ""
        }`}>
        {/* Градиентный фон */}
        <div className={`absolute top-0 left-0 w-full h-1.5 ${gradient}`} />

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-3">
              <div className="p-2 rounded-xl bg-gray-50 group-hover:bg-gray-100 transition-colors duration-200">
                <div className={iconColor}>{icon}</div>
              </div>
              <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
            </div>

            <div className="space-y-1">
              <p className="text-3xl font-bold text-gray-900">{value}</p>
              {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
              {description && (
                <p className="text-xs text-gray-400 leading-relaxed">{description}</p>
              )}
            </div>
          </div>

          {onClick && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-1">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Unified Header */}
      <PageHeader
        title="Главная"
        subtitle={`Ваш финансовый обзор за ${format(new Date(), "MMMM yyyy", { locale: ru })}`}
        description={
          stats.totalBalance >= 0
            ? "Отличная работа! Ваши финансы в порядке 💚 Продолжайте в том же духе и контролируйте расходы."
            : "Давайте вместе приведем финансы в порядок! 📈 Начните с отслеживания ежедневных трат."
        }
        icon={<Home className="w-5 h-5 text-white" />}
        collapsibleDescription={true}
      />

      {/* Обзор баланса с сбережениями */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Обзор баланса</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white rounded-xl">
            <p className="text-sm text-gray-600 mb-1">Общий баланс</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalBalance)}</p>
            <p className="text-xs text-gray-500">
              {stats.totalBalance >= 0 ? "Все хорошо!" : "Нужно подтянуть"}
            </p>
          </div>
          <div className="text-center p-4 bg-white rounded-xl">
            <p className="text-sm text-emerald-600 mb-1">Свободные средства</p>
            <p className="text-2xl font-bold text-emerald-600">
              {formatCurrency(stats.balanceData.availableBalance)}
            </p>
            <p className="text-xs text-gray-500">Доступно для трат</p>
          </div>
          <div className="text-center p-4 bg-white rounded-xl">
            <p className="text-sm text-blue-600 mb-1">В целях КопиКопи</p>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(stats.balanceData.reservedBalance)}
            </p>
            <p className="text-xs text-gray-500">{stats.activeSavingsGoals.length} целей</p>
          </div>
        </div>
        {stats.balanceData.availableBalance < 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <span className="text-red-500 text-lg">⚠️</span>
              <div className="text-sm text-red-800">
                <p className="font-medium">Внимание!</p>
                <p>
                  У вас отрицательный свободный баланс. Рассмотрите возможность снять деньги с
                  некоторых целей.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Современные карточки метрик */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <ModernStatCard
          title="Заработал"
          value={formatCurrency(stats.totalIncome)}
          subtitle="Общий доход"
          icon={<TrendingUp className="h-5 w-5" />}
          iconColor="text-emerald-600"
          gradient="bg-gradient-to-r from-emerald-500 to-green-500"
          description="Сумма всех ваших доходов"
          onClick={() => {
            setFilter("income")
            onPageChange?.("transactions")
          }}
        />

        <ModernStatCard
          title="Потратил"
          value={formatCurrency(stats.totalExpenses)}
          subtitle="Общий расход"
          icon={<TrendingDown className="h-5 w-5" />}
          iconColor="text-red-600"
          gradient="bg-gradient-to-r from-red-500 to-red-600"
          description="Сумма всех ваших расходов"
          onClick={() => {
            setFilter("expense")
            onPageChange?.("transactions")
          }}
        />

        <ModernStatCard
          title="КопиКопи"
          value={stats.activeSavingsGoals.length.toString()}
          subtitle={`${formatCurrency(stats.balanceData.reservedBalance)} накоплено`}
          icon={<PiggyBank className="h-5 w-5" />}
          iconColor="text-blue-600"
          gradient="bg-gradient-to-r from-blue-500 to-indigo-500"
          description="Ваши сберегательные цели"
          onClick={() => onPageChange?.("savings")}
        />

        <ModernStatCard
          title="Операций"
          value={stats.totalTransactions.toString()}
          subtitle={`${stats.monthlyTransactions} в этом месяце`}
          icon={<Target className="h-5 w-5" />}
          iconColor="text-purple-600"
          gradient="bg-gradient-to-r from-purple-500 to-pink-500"
          description="Количество всех транзакций"
          onClick={() => onPageChange?.("transactions")}
        />
      </div>

      {/* Месячная статистика с красивыми карточками */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-6">
          <Calendar className="h-5 w-5 text-emerald-600" />
          <h2 className="text-xl font-bold text-gray-900">Этот месяц</h2>
          <span className="text-gray-500">— {format(new Date(), "MMMM", { locale: ru })}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="p-2 rounded-xl bg-emerald-100">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-gray-800">Доходы</h3>
              </div>
              <p className="text-4xl font-bold text-emerald-600 mb-2">
                {formatCurrency(stats.monthlyIncome)}
              </p>
              <p className="text-sm text-gray-500">
                {stats.monthlyIncome > 0 && stats.totalIncome > 0
                  ? `${((stats.monthlyIncome / stats.totalIncome) * 100).toFixed(
                      1
                    )}% от общего дохода`
                  : "Пока доходов нет"}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="p-2 rounded-xl bg-red-100">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                </div>
                <h3 className="font-semibold text-gray-800">Расходы</h3>
              </div>
              <p className="text-4xl font-bold text-red-600 mb-2">
                {formatCurrency(stats.monthlyExpenses)}
              </p>
              <p className="text-sm text-gray-500">
                {stats.monthlyExpenses > 0 && stats.totalExpenses > 0
                  ? `${((stats.monthlyExpenses / stats.totalExpenses) * 100).toFixed(
                      1
                    )}% от общих расходов`
                  : "Расходов пока нет"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Интересная статистика */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-2 mb-6">
            <div className="p-2 rounded-xl bg-blue-100">
              <Target className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Ваши привычки</h3>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
              <span className="text-gray-700 font-medium">Средний доход</span>
              <span className="font-bold text-emerald-600">
                {stats.totalIncome > 0
                  ? formatCurrency(
                      stats.totalIncome / transactions.filter((t) => t.type === "income").length
                    )
                  : formatCurrency(0)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
              <span className="text-gray-700 font-medium">Средний расход</span>
              <span className="font-bold text-red-600">
                {stats.totalExpenses > 0
                  ? formatCurrency(
                      stats.totalExpenses / transactions.filter((t) => t.type === "expense").length
                    )
                  : formatCurrency(0)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
              <span className="text-gray-700 font-medium">Операций в месяц</span>
              <span className="font-bold text-blue-600">{stats.monthlyTransactions}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-2 mb-6">
            <div className="p-2 rounded-xl bg-purple-100">
              <Award className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Финансовое здоровье</h3>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-emerald-700 font-medium">Соотношение доходы/расходы</span>
                <span className="font-bold text-emerald-600">
                  {stats.totalExpenses > 0
                    ? (stats.totalIncome / stats.totalExpenses).toFixed(2)
                    : "∞"}
                </span>
              </div>
              <p className="text-xs text-emerald-600">
                {stats.totalExpenses > 0 && stats.totalIncome / stats.totalExpenses >= 1.2
                  ? "Отличный баланс! 🎯"
                  : "Стоит увеличить доходы или сократить расходы"}
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700 font-medium">Уровень сбережений</span>
                <span
                  className={`font-bold ${
                    stats.totalBalance >= 0 ? "text-emerald-600" : "text-red-600"
                  }`}>
                  {stats.totalIncome > 0
                    ? `${((stats.totalBalance / stats.totalIncome) * 100).toFixed(1)}%`
                    : "0%"}
                </span>
              </div>
              <div
                className={`text-xs ${
                  stats.totalBalance >= 0 ? "text-emerald-600" : "text-red-600"
                }`}>
                {stats.totalBalance >= 0
                  ? "Вы откладываете деньги! 💪"
                  : "Тратите больше, чем зарабатываете"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
