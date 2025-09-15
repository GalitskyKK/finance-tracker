import React from "react"
import { Wallet } from "lucide-react"
import { UserMenu } from "@/components/auth/UserMenu"

interface HeaderProps {
  className?: string
  onLogoClick?: () => void
}

export const Header: React.FC<HeaderProps> = ({ className = "", onLogoClick }) => {
  return (
    <header
      className={`bg-white/95 backdrop-blur-md border-b border-emerald-100/60 shadow-sm ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={onLogoClick}
            className="flex items-center space-x-3 group transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl shadow-lg group-hover:shadow-xl group-hover:shadow-emerald-500/25 transition-all duration-200">
              <Wallet className="h-6 w-6 text-white group-hover:scale-110 transition-transform duration-200" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-700 to-emerald-600 bg-clip-text text-transparent group-hover:from-emerald-600 group-hover:to-emerald-500 transition-all duration-200">
                KashKontrol
              </h1>
              <p className="text-sm text-emerald-600 hidden sm:block font-medium group-hover:text-emerald-500 transition-colors duration-200">
                Контроль ваших финансов
              </p>
            </div>
          </button>

          <div className="flex items-center space-x-4">
            <div className="text-sm font-medium text-emerald-700 hidden md:block px-3 py-2 bg-emerald-50 rounded-lg border border-emerald-100">
              {new Date().toLocaleDateString("ru-RU", {
                year: "numeric",
                month: "long",
                day: "numeric"
              })}
            </div>
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  )
}
