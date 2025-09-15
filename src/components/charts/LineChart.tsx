import React, { useState } from "react"
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart
} from "recharts"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { formatCurrency } from "@/utils/formatters"

interface LineChartData {
  name: string
  income?: number
  expense?: number
  balance?: number
  [key: string]: string | number | undefined
}

interface LineChartProps {
  data: LineChartData[]
  title: string
  className?: string
  height?: number
  showLegend?: boolean
  showTooltip?: boolean
  lines?: Array<{
    dataKey: string
    color: string
    name: string
  }>
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  title,
  className = "",
  height = 300,
  showLegend = true,
  showTooltip = true,
  lines = [
    { dataKey: "income", color: "#10B981", name: "Доходы" },
    { dataKey: "expense", color: "#EF4444", name: "Расходы" },
    { dataKey: "balance", color: "#3B82F6", name: "Баланс" }
  ]
}) => {
  const [activeDataKey, setActiveDataKey] = useState<string | null>(null)
  // Современный красивый tooltip
  const CustomTooltip = ({
    active,
    payload,
    label
  }: {
    active?: boolean
    payload?: Array<{ color: string; name: string; value: number }>
    label?: string
  }): React.ReactElement | null => {
    if (active && payload?.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm p-5 border border-gray-200/60 rounded-2xl shadow-2xl shadow-gray-900/10 animate-slide-up min-w-[200px]">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
            <p className="font-bold text-gray-900 text-base">{label}</p>
          </div>

          <div className="space-y-3">
            {payload.map((entry: { color: string; name: string; value: number }, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full shadow-sm"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm font-medium text-gray-700">{entry.name}</span>
                </div>
                <span className="font-bold text-base" style={{ color: entry.color }}>
                  {formatCurrency(entry.value)}
                </span>
              </div>
            ))}
          </div>

          {/* Мини-статистика */}
          {payload.length >= 2 && (
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="text-xs text-gray-500 text-center">
                {payload[0].value > payload[1].value
                  ? "📈 Положительная динамика"
                  : "📉 Отрицательная динамика"}
              </div>
            </div>
          )}
        </div>
      )
    }
    return null
  }

  if (!data || data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <p>Нет данных для отображения</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <ComposedChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            onMouseMove={(state: { activeLabel?: string }) => {
              if (state?.activeLabel) {
                // Можно добавить логику для активного элемента
              }
            }}>
            {/* Градиентная определяющая */}
            <defs>
              {lines.map((line) => (
                <linearGradient
                  key={`gradient-${line.dataKey}`}
                  id={`gradient-${line.dataKey}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1">
                  <stop offset="5%" stopColor={line.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={line.color} stopOpacity={0.1} />
                </linearGradient>
              ))}
            </defs>

            {/* Красивая сетка */}
            <CartesianGrid
              strokeDasharray="2 4"
              stroke="#e5e7eb"
              strokeOpacity={0.7}
              vertical={false}
            />

            {/* Оси */}
            <XAxis
              dataKey="name"
              stroke="#6b7280"
              fontSize={12}
              fontWeight={500}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              fontWeight={500}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: number) => {
                if (value >= 1000000) return `${(value / 1000000).toFixed(1)}М`
                if (value >= 1000) return `${(value / 1000).toFixed(0)}к`
                return value.toString()
              }}
            />

            {showTooltip && <Tooltip content={<CustomTooltip />} />}

            {/* Линии с градиентной заливкой */}
            {lines.map((line) => {
              const isActive = activeDataKey === line.dataKey
              return (
                <Line
                  key={line.dataKey}
                  type="monotone"
                  dataKey={line.dataKey}
                  stroke={line.color}
                  strokeWidth={isActive ? 4 : 3}
                  dot={{
                    fill: "white",
                    stroke: line.color,
                    strokeWidth: 3,
                    r: 5,
                    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
                  }}
                  activeDot={{
                    r: 8,
                    stroke: line.color,
                    strokeWidth: 3,
                    fill: "white",
                    filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.15))",
                    style: {
                      animation: "pulse 2s infinite"
                    }
                  }}
                  name={line.name}
                  animationDuration={1500}
                  animationEasing="ease-out"
                  style={{
                    filter: isActive
                      ? "drop-shadow(0 0 8px rgba(59, 130, 246, 0.3))"
                      : "drop-shadow(0 1px 2px rgba(0,0,0,0.1))"
                  }}
                  onMouseEnter={() => setActiveDataKey(line.dataKey)}
                  onMouseLeave={() => setActiveDataKey(null)}
                />
              )
            })}

            {showLegend && (
              <Legend
                wrapperStyle={{
                  paddingTop: "20px",
                  fontSize: "14px",
                  fontWeight: "500"
                }}
                iconType="circle"
                formatter={(value: string, _entry: { color?: string }) => (
                  <span
                    style={{
                      color: "#374151",
                      fontSize: "14px",
                      fontWeight: "500"
                    }}>
                    {value}
                  </span>
                )}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
