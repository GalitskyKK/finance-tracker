import React from "react"

interface ToggleSliderProps {
  leftLabel: string
  rightLabel: string
  value: "left" | "right"
  onChange: (value: "left" | "right") => void
  leftColor?: string
  rightColor?: string
  className?: string
}

export const ToggleSlider: React.FC<ToggleSliderProps> = ({
  leftLabel,
  rightLabel,
  value,
  onChange,
  leftColor = "linear-gradient(135deg, #f87171, #ef4444)", // soft red gradient
  rightColor = "linear-gradient(135deg, #34d399, #10b981)", // soft emerald gradient
  className = ""
}) => {
  return (
    <div className={`relative ${className}`}>
      <div className="flex bg-gray-100 rounded-lg p-1">
        {/* Left Option */}
        <button
          onClick={() => onChange("left")}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
            value === "left" ? "text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
          }`}
          style={{
            background: value === "left" ? leftColor : "transparent"
          }}>
          {leftLabel}
        </button>

        {/* Right Option */}
        <button
          onClick={() => onChange("right")}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
            value === "right" ? "text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
          }`}
          style={{
            background: value === "right" ? rightColor : "transparent"
          }}>
          {rightLabel}
        </button>
      </div>
    </div>
  )
}
