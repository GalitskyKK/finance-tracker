import React, { useState } from "react"
import { CategoryCard } from "./CategoryCard"
import { formatCurrency } from "@/utils/formatters"
import { ChevronDown, ChevronUp } from "lucide-react"

interface CategoryData {
  id: string
  name: string
  amount: number
  color: string
  icon?: string
  transactionCount?: number
  trend?: {
    value: number
    isPositive: boolean
  }
}

interface FinanceOverviewProps {
  totalAmount: number
  categories: CategoryData[]
  type: "income" | "expense"
  period?: string
  className?: string
  onCategoryClick?: (categoryId: string) => void
  maxVisibleCategories?: number
}

export const FinanceOverview: React.FC<FinanceOverviewProps> = ({
  totalAmount,
  categories,
  type,
  period = "",
  className = "",
  onCategoryClick,
  maxVisibleCategories = 4
}) => {
  const [showAllCategories, setShowAllCategories] = useState(false)

  const sortedCategories = categories.sort((a, b) => b.amount - a.amount)
  const visibleCategories = showAllCategories
    ? sortedCategories
    : sortedCategories.slice(0, maxVisibleCategories)
  const hiddenCount = sortedCategories.length - maxVisibleCategories

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Total Amount Card */}
      {totalAmount > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm text-center">
          <div className="text-3xl font-bold text-gray-900 mb-2">{formatCurrency(totalAmount)}</div>
          <div className="text-sm text-gray-500">{period}</div>
        </div>
      )}

      {/* Categories List */}
      {visibleCategories.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
          {visibleCategories.map((category) => (
            <CategoryCard
              key={category.id}
              name={category.name}
              amount={category.amount}
              totalAmount={totalAmount}
              color={category.color}
              icon={category.icon}
              transactionCount={category.transactionCount}
              trend={category.trend}
              onClick={() => onCategoryClick?.(category.id)}
            />
          ))}

          {/* Show More/Less Button */}
          {hiddenCount > 0 && (
            <div className="p-4">
              <button
                onClick={() => setShowAllCategories(!showAllCategories)}
                className="w-full flex items-center justify-center py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                {showAllCategories ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-1" />
                    Скрыть
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-1" />
                    Ещё {hiddenCount} {hiddenCount === 1 ? "категория" : "категорий"}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Empty state */
        <div className="bg-white rounded-xl p-8 shadow-sm text-center">
          <div className="text-gray-400 text-4xl mb-3">{type === "income" ? "💰" : "💸"}</div>
          <div className="text-lg font-medium text-gray-900 mb-1">Нет данных</div>
          <div className="text-sm text-gray-500">
            {type === "income" ? "Добавьте доходы" : "Добавьте расходы"} за этот период
          </div>
        </div>
      )}
    </div>
  )
}
