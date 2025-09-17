import React from "react"
import { formatCurrency } from "@/utils/formatters"

interface TrendTimelineData {
  period: string
  amount: number
  type: "income" | "expense"
}

interface TrendTimelineProps {
  data: TrendTimelineData[]
  className?: string
  type: "income" | "expense"
}

export const TrendTimeline: React.FC<TrendTimelineProps> = ({ data, className = "", type }) => {
  const maxAmount = Math.max(...data.map((item) => item.amount))
  const color = type === "income" ? "#10b981" : "#ef4444"
  const bgColor = type === "income" ? "#10b98110" : "#ef444410"

  if (!data.length) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <div className="text-sm">Нет данных для отображения</div>
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {data.map((item, index) => {
        const heightPercentage = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0
        const prevAmount = index > 0 ? data[index - 1].amount : item.amount
        const change = prevAmount > 0 ? ((item.amount - prevAmount) / prevAmount) * 100 : 0
        const isPositive = change >= 0

        return (
          <div key={`${item.period}-${index}`} className="group relative">
            {/* Timeline item */}
            <div className="flex items-center space-x-4 p-3 rounded-lg transition-all duration-200 hover:bg-gray-50">
              {/* Visual bar */}
              <div className="flex-shrink-0 w-16 h-8 relative">
                <div
                  className="absolute bottom-0 left-0 rounded-sm transition-all duration-700 ease-out"
                  style={{
                    width: "100%",
                    height: `${Math.max(heightPercentage, 5)}%`,
                    backgroundColor: color,
                    background: `linear-gradient(to top, ${color}, ${color}aa)`
                  }}
                />
                <div
                  className="absolute inset-0 rounded-sm opacity-20"
                  style={{ backgroundColor: bgColor }}
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{item.period}</div>
                    <div className="text-lg font-bold" style={{ color }}>
                      {formatCurrency(item.amount)}
                    </div>
                  </div>

                  {/* Change indicator */}
                  {index > 0 && (
                    <div
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        isPositive ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"
                      }`}>
                      {isPositive ? "↗" : "↘"} {Math.abs(change).toFixed(1)}%
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Connection line to next item */}
            {index < data.length - 1 && (
              <div
                className="absolute left-8 top-full w-0.5 h-3 -mt-1"
                style={{ backgroundColor: `${color}33` }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
