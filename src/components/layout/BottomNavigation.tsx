import React from "react"
import { Home, CreditCard, BarChart3, Settings } from "lucide-react"

interface BottomNavigationProps {
  currentPage: string
  onPageChange: (page: string) => void
  className?: string
}

const menuItems = [
  { id: "dashboard", label: "Главная", icon: Home },
  { id: "transactions", label: "Финансы", icon: CreditCard },
  { id: "analytics", label: "Отчеты", icon: BarChart3 },
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
        fixed bottom-0 left-0 right-0 z-50 bg-white/95 border-t border-emerald-100/60 
        lg:hidden safe-area-pb backdrop-blur-md shadow-lg shadow-emerald-500/5
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
              className="group flex flex-col items-center justify-center space-y-1 transition-all duration-300 relative overflow-hidden active:scale-95">
              {/* Фоновая волна при нажатии */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-50 to-transparent rounded-t-2xl" />
              )}

              <div className="relative z-10 flex flex-col items-center justify-center space-y-1">
                <div
                  className={`
                  relative flex items-center justify-center transition-all duration-300
                  ${
                    isActive
                      ? "transform -translate-y-0.5"
                      : "group-hover:transform group-hover:-translate-y-0.5"
                  }
                `}>
                  <div
                    className={`
                    p-1.5 rounded-xl transition-all duration-300
                    ${
                      isActive
                        ? "bg-emerald-500 shadow-lg shadow-emerald-500/25"
                        : "bg-transparent group-hover:bg-emerald-50"
                    }
                  `}>
                    <Icon
                      className={`
                      h-5 w-5 transition-all duration-300
                      ${isActive ? "text-white" : "text-gray-400 group-hover:text-emerald-600"}
                    `}
                    />
                  </div>

                  {/* Активная точка */}
                  {isActive && (
                    <div className="absolute -top-2 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  )}
                </div>

                <span
                  className={`
                  text-xs font-medium transition-all duration-300 text-center
                  ${
                    isActive
                      ? "text-emerald-600 font-bold"
                      : "text-gray-400 group-hover:text-emerald-600"
                  }
                `}>
                  {item.label}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
