import React from "react"
import { Home, CreditCard, BarChart3, Settings } from "lucide-react"

interface BottomNavigationProps {
  currentPage: string
  onPageChange: (page: string) => void
  className?: string
}

const menuItems = [
  { id: "dashboard", label: "Главная", icon: Home },
  { id: "transactions", label: "Операции", icon: CreditCard },
  { id: "analytics", label: "Аналитика", icon: BarChart3 },
  { id: "settings", label: "Настройки", icon: Settings }
]

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentPage,
  onPageChange,
  className = ""
}) => {
  return (
    <nav
      className={`
        fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 
        lg:hidden safe-area-pb backdrop-blur-md bg-white/95
        ${className}
      `}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="grid grid-cols-4 h-16">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPage === item.id

          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`
                flex flex-col items-center justify-center space-y-1 transition-all duration-200
                ${
                  isActive
                    ? "text-blue-600"
                    : "text-gray-400 hover:text-gray-600 active:text-blue-500"
                }
              `}>
              <div
                className={`
                relative flex items-center justify-center transition-all duration-200
                ${isActive ? "transform -translate-y-0.5" : ""}
              `}>
                <Icon
                  className={`
                    h-6 w-6 transition-all duration-200
                    ${isActive ? "text-blue-600 stroke-2" : "text-gray-400 stroke-1.5"}
                  `}
                />
                {isActive && <div className="absolute -top-1 w-1 h-1 bg-blue-600 rounded-full" />}
              </div>
              <span
                className={`
                text-xs font-medium transition-all duration-200
                ${isActive ? "text-blue-600 font-semibold" : "text-gray-400"}
              `}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
