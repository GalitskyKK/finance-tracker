import React from "react"
import { formatCurrency } from "@/utils/formatters"

interface CategoryCardProps {
  name: string
  amount: number
  totalAmount: number
  color: string
  icon?: string
  className?: string
  onClick?: () => void
  transactionCount?: number
  trend?: {
    value: number
    isPositive: boolean
  }
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  name,
  amount,
  totalAmount,
  color,
  icon,
  className = "",
  onClick,
  transactionCount,
  trend
}) => {
  const percentage = totalAmount > 0 ? (amount / totalAmount) * 100 : 0

  return (
    <div
      className={`flex items-center justify-between py-3 px-4 hover:bg-gray-50 transition-colors cursor-pointer ${className}`}
      onClick={onClick}>
      {/* Left side - Icon + Info */}
      <div className="flex items-center space-x-3">
        {icon && <div className="w-10 h-10 flex items-center justify-center text-2xl">{icon}</div>}
        <div>
          <div className="font-medium text-gray-900">{name}</div>
          <div className="text-sm text-gray-500">
            {transactionCount ? `${transactionCount} операций` : `${percentage.toFixed(1)}%`}
            {trend && (
              <span className={`ml-2 ${trend.isPositive ? "text-red-600" : "text-green-600"}`}>
                {trend.isPositive ? "↗" : "↘"} {Math.abs(trend.value)}%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right side - Amount */}
      <div className="text-right">
        <div className="font-semibold text-gray-900">{formatCurrency(amount)}</div>
      </div>
    </div>
  )
}
