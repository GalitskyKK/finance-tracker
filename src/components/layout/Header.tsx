import React from "react"
import { Wallet } from "lucide-react"
import { UserMenu } from "@/components/auth/UserMenu"

interface HeaderProps {
  className?: string
}

export const Header: React.FC<HeaderProps> = ({ className = "" }) => {
  return (
    <header
      className={`bg-white/80 backdrop-blur-md border-b border-gray-200/60 shadow-sm ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Finance Tracker
              </h1>
              <p className="text-sm text-gray-500 hidden sm:block">Управление финансами</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm font-medium text-gray-600 hidden md:block px-3 py-1 bg-gray-50 rounded-lg">
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
