import React from "react"
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
  // Кастомный tooltip
  const CustomTooltip = ({
    active,
    payload
  }: {
    active?: boolean
    payload?: Array<{
      name: string
      value: number
      payload: { percent: number }
    }>
  }): React.ReactElement | null => {
    if (active && payload?.length) {
      const data = payload[0]
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            Сумма: <span className="font-semibold">{formatCurrency(data.value)}</span>
          </p>
          <p className="text-sm text-gray-600">
            Процент: <span className="font-semibold">{data.payload.percent.toFixed(1)}%</span>
          </p>
        </div>
      )
    }
    return null
  }

  // Кастомная легенда
  const renderCustomizedLabel = (entry: {
    innerRadius: number
    outerRadius: number
    cx: number
    cy: number
    midAngle: number
    percent: number
  }): React.ReactElement => {
    const RADIAN = Math.PI / 180
    const radius = entry.innerRadius + (entry.outerRadius - entry.innerRadius) * 0.5
    const x = entry.cx + radius * Math.cos(-entry.midAngle * RADIAN)
    const y = entry.cy + radius * Math.sin(-entry.midAngle * RADIAN)

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > entry.cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold">
        {entry.percent > 5 ? `${entry.percent.toFixed(0)}%` : ""}
      </text>
    )
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
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color ?? `hsl(${index * 45}, 70%, 50%)`} />
              ))}
            </Pie>
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            {showLegend && (
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value: string, entry: { color?: string }) => (
                  <span style={{ color: entry.color ?? "#000" }}>{value}</span>
                )}
              />
            )}
          </RechartsPieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
