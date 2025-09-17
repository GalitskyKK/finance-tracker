import React, { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

interface PageHeaderProps {
  title: string
  subtitle?: string
  description?: string
  icon?: React.ReactNode
  actions?: React.ReactNode
  className?: string
  collapsibleDescription?: boolean
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  description,
  icon,
  actions,
  className = "",
  collapsibleDescription = false
}) => {
  const [isDescriptionVisible, setIsDescriptionVisible] = useState(!collapsibleDescription)

  return (
    <div className={`mb-6 ${className}`}>
      {/* Main Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {icon && (
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              {icon}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          </div>
        </div>
        {actions}
      </div>

      {/* Description */}
      {description && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start justify-between">
            <p
              className={`text-blue-800 text-sm ${
                !isDescriptionVisible && collapsibleDescription ? "line-clamp-1" : ""
              }`}>
              {description}
            </p>
            {collapsibleDescription && (
              <button
                onClick={() => setIsDescriptionVisible(!isDescriptionVisible)}
                className="ml-3 flex-shrink-0 text-blue-600 hover:text-blue-800 transition-colors">
                {isDescriptionVisible ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
