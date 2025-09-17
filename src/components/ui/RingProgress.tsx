import React from "react"

interface RingProgressProps {
  value: number // 0-100
  size?: number // размер в px
  strokeWidth?: number
  color?: string
  backgroundColor?: string
  children?: React.ReactNode
  className?: string
  animated?: boolean
}

export const RingProgress: React.FC<RingProgressProps> = ({
  value,
  size = 120,
  strokeWidth = 8,
  color = "#10b981", // emerald-500
  backgroundColor = "#e5e7eb", // gray-200
  children,
  className = "",
  animated = true
}) => {
  const normalizedValue = Math.max(0, Math.min(100, value))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (normalizedValue / 100) * circumference

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}>
      {/* Background circle */}
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        style={{ position: "absolute" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={animated ? "transition-all duration-1000 ease-out" : ""}
          style={{
            filter: "drop-shadow(0 0 6px rgba(16, 185, 129, 0.3))"
          }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">{children}</div>
      </div>
    </div>
  )
}
