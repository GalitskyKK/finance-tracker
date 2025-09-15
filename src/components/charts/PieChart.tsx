import React, { useState } from "react"
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from "recharts"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { ChartData } from "@/types"
import { formatCurrency } from "@/utils/formatters"

interface PieChartProps {
  data: ChartData[]
  title: string
  className?: string
  height?: number
  showLegend?: boolean
  showTooltip?: boolean
}

export const PieChart: React.FC<PieChartProps> = ({
  data,
  title,
  className = "",
  height = 300,
  showLegend = true,
  showTooltip = true
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  // Современная цветовая палитра с градиентами
  const modernColors = [
    "#6366F1", // Indigo
    "#EF4444", // Red
    "#10B981", // Emerald
    "#F59E0B", // Amber
    "#8B5CF6", // Violet
    "#06B6D4", // Cyan
    "#EC4899", // Pink
    "#84CC16", // Lime
    "#F97316", // Orange
    "#6B7280" // Gray
  ]

  // Обогащаем данные современными цветами
  const enrichedData = data.map((item, index) => ({
    ...item,
    color: item.color ?? modernColors[index % modernColors.length]
  }))
  // Стильный современный tooltip
  const CustomTooltip = ({
    active,
    payload
  }: {
    active?: boolean
    payload?: Array<{
      name: string
      value: number
      payload: { percent: number; color: string }
    }>
  }): React.ReactElement | null => {
    if (active && payload?.length) {
      const data = payload[0]
      return (
        <div className="bg-white/95 backdrop-blur-sm p-4 border border-gray-200/60 rounded-2xl shadow-2xl shadow-gray-900/10 animate-slide-up">
          <div className="flex items-center space-x-3 mb-3">
            <div
              className="w-4 h-4 rounded-full shadow-sm"
              style={{ backgroundColor: data.payload.color }}
            />
            <p className="font-bold text-gray-900 text-base">{data.name}</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Сумма:</span>
              <span className="font-bold text-gray-900 text-lg">{formatCurrency(data.value)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Доля:</span>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-emerald-600 text-lg">
                  {data.payload.percent.toFixed(1)}%
                </span>
                <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: data.payload.color,
                      width: `${Math.min(data.payload.percent, 100)}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  // Красивые лейблы с тенями
  const renderCustomizedLabel = (entry: {
    innerRadius: number
    outerRadius: number
    cx: number
    cy: number
    midAngle: number
    percent: number
  }): React.ReactElement => {
    const RADIAN = Math.PI / 180
    const radius = entry.innerRadius + (entry.outerRadius - entry.innerRadius) * 0.7
    const x = entry.cx + radius * Math.cos(-entry.midAngle * RADIAN)
    const y = entry.cy + radius * Math.sin(-entry.midAngle * RADIAN)

    if (entry.percent < 5) return <></>

    return (
      <g>
        {/* Тень для текста */}
        <text
          x={x}
          y={y + 1}
          fill="rgba(0,0,0,0.3)"
          textAnchor={x > entry.cx ? "start" : "end"}
          dominantBaseline="central"
          fontSize={13}
          fontWeight="700">
          {`${entry.percent.toFixed(0)}%`}
        </text>
        {/* Основной текст */}
        <text
          x={x}
          y={y}
          fill="white"
          textAnchor={x > entry.cx ? "start" : "end"}
          dominantBaseline="central"
          fontSize={13}
          fontWeight="700"
          style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))" }}>
          {`${entry.percent.toFixed(0)}%`}
        </text>
      </g>
    )
  }

  // Обработка hover эффектов
  const onPieEnter = (_: unknown, index: number): void => {
    setActiveIndex(index)
  }

  const onPieLeave = (): void => {
    setActiveIndex(null)
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
          <RechartsPieChart>
            <defs>
              {/* Градиентные определения для каждого сегмента */}
              {enrichedData.map((_entry, index) => (
                <radialGradient key={`gradient-${index}`} id={`gradient-${index}`}>
                  <stop offset="0%" stopColor={_entry.color} stopOpacity={0.9} />
                  <stop offset="100%" stopColor={_entry.color} stopOpacity={0.7} />
                </radialGradient>
              ))}
            </defs>

            <Pie
              data={enrichedData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={Math.min(height * 0.35, 120)}
              innerRadius={0}
              fill="#8884d8"
              dataKey="value"
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
              animationBegin={0}
              animationDuration={1200}
              animationEasing="ease-out"
              style={{ outline: "none" }}>
              {enrichedData.map((_entry, index) => {
                const isActive = activeIndex === index
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={`url(#gradient-${index})`}
                    stroke="white"
                    strokeWidth={isActive ? 3 : 2}
                    style={{
                      filter: isActive
                        ? "drop-shadow(0 4px 12px rgba(0,0,0,0.15)) brightness(1.1)"
                        : "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
                      transform: isActive ? "scale(1.05)" : "scale(1)",
                      transformOrigin: "center",
                      transition: "all 0.3s ease"
                    }}
                  />
                )
              })}
            </Pie>

            {showTooltip && <Tooltip content={<CustomTooltip />} />}

            {showLegend && (
              <Legend
                verticalAlign="bottom"
                height={40}
                iconType="circle"
                wrapperStyle={{
                  paddingTop: "20px",
                  fontSize: "14px",
                  fontWeight: "500"
                }}
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
          </RechartsPieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
