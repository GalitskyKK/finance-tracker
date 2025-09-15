import React from "react"
import { Wallet } from "lucide-react"
import { UserMenu } from "@/components/auth/UserMenu"

interface HeaderProps {
  className?: string
}

export const Header: React.FC<HeaderProps> = ({ className = "" }) => {
  return (
    <header
      className={`bg-white/95 backdrop-blur-md border-b border-emerald-100/60 shadow-sm ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-700 to-emerald-600 bg-clip-text text-transparent">
                KashKontrol
              </h1>
              <p className="text-sm text-emerald-600 hidden sm:block font-medium">
                Контроль ваших финансов
              </p>
            </div>
          </div>

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
