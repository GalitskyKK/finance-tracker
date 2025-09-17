import React from "react"

interface WaveProgressProps {
  value: number // 0-100
  height?: number
  color?: string
  backgroundColor?: string
  className?: string
  animated?: boolean
  showPercentage?: boolean
}

export const WaveProgress: React.FC<WaveProgressProps> = ({
  value,
  height = 8,
  color = "#10b981", // emerald-500
  backgroundColor = "#e5e7eb", // gray-200
  className = "",
  animated = true,
  showPercentage = false
}) => {
  const normalizedValue = Math.max(0, Math.min(100, value))

  return (
    <div className={`relative w-full ${className}`}>
      {/* Background */}
      <div
        className="w-full rounded-full overflow-hidden"
        style={{
          height: `${height}px`,
          backgroundColor
        }}>
        {/* Progress fill with wave effect */}
        <div
          className={`h-full rounded-full relative overflow-hidden ${
            animated ? "transition-all duration-1000 ease-out" : ""
          }`}
          style={{
            width: `${normalizedValue}%`,
            background: `linear-gradient(45deg, ${color}, ${color}dd)`,
            boxShadow: `0 0 10px ${color}33`
          }}>
          {/* Wave animation */}
          {animated && normalizedValue > 0 && (
            <>
              <div
                className="absolute inset-0 opacity-30 animate-pulse"
                style={{
                  background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)`,
                  animationDuration: "2s",
                  animationIterationCount: "infinite",
                  animationTimingFunction: "linear",
                  transform: "translateX(-100%)",
                  animation: "wave 2s infinite linear"
                }}
              />
              <style>{`
                @keyframes wave {
                  0% { transform: translateX(-100%); }
                  100% { transform: translateX(100%); }
                }
              `}</style>
            </>
          )}
        </div>
      </div>

      {/* Percentage text */}
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="text-xs font-medium"
            style={{
              color: normalizedValue > 50 ? "white" : "#374151",
              textShadow: normalizedValue > 50 ? "0 1px 2px rgba(0,0,0,0.5)" : "none"
            }}>
            {Math.round(normalizedValue)}%
          </span>
        </div>
      )}
    </div>
  )
}
