import React from "react"
import { Home, CreditCard, BarChart3, Settings } from "lucide-react"

interface SidebarProps {
  currentPage: string
  onPageChange: (page: string) => void
  className?: string
}

const menuItems = [
  { id: "dashboard", label: "Дашборд", icon: Home },
  { id: "transactions", label: "Транзакции", icon: CreditCard },
  { id: "analytics", label: "Аналитика", icon: BarChart3 },
  { id: "settings", label: "Настройки", icon: Settings }
]

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange, className = "" }) => {
  return (
    <aside
      className={`
      w-64 min-h-screen bg-gradient-to-b from-white to-emerald-50/30 border-r border-emerald-100
      ${className}
    `}>
      <div className="h-16 px-6 border-b border-emerald-100/60 bg-white/80 backdrop-blur-sm flex items-center">
        <h2 className="text-lg font-semibold bg-gradient-to-r from-emerald-800 to-emerald-600 bg-clip-text text-transparent">
          Навигация
        </h2>
      </div>

      <nav className="my-6 px-3">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.id

            return (
              <li key={item.id}>
                <button
                  onClick={() => onPageChange(item.id)}
                  className={`
                      w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl
                      transition-all duration-200 ease-in-out group relative overflow-hidden
                      ${
                        isActive
                          ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25 transform scale-[1.02]"
                          : "text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-emerald-100 hover:text-emerald-800 hover:transform hover:scale-[1.01] hover:shadow-md hover:border-emerald-200"
                      }
                    `}>
                  <div
                    className={`
                      flex items-center justify-center w-8 h-8 rounded-lg mr-3 transition-all duration-200
                      ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-gray-100 text-gray-500 group-hover:bg-emerald-100 group-hover:text-emerald-700 group-hover:shadow-sm"
                      }
                    `}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <div className="absolute right-3 w-2 h-2 bg-white rounded-full animate-pulse" />
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      {/* <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">Finance Tracker v1.0.0</div>
        </div> */}
    </aside>
  )
}
