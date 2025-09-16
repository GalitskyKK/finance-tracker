import React from "react"
import { Header } from "./Header"
import { Sidebar } from "./Sidebar"
import { BottomNavigation } from "./BottomNavigation"
import { NetworkStatus } from "@/components/ui/NetworkStatus"
import { useTransactionFilterStore } from "@/store/transactionFilterStore"

interface LayoutProps {
  children: React.ReactNode
  currentPage: string
  onPageChange: (page: string) => void
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  currentPage,
  onPageChange
}): React.ReactElement => {
  const { clearFilter } = useTransactionFilterStore()

  const handleLogoClick = (): void => {
    clearFilter() // Сбрасываем фильтры при переходе на главную
    onPageChange("dashboard")
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen">
        {/* Desktop Sidebar - скрыт на мобильных */}
        <div className="hidden lg:block">
          <Sidebar currentPage={currentPage} onPageChange={onPageChange} />
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <Header onLogoClick={handleLogoClick} />

          {/* Main content */}
          <main className="flex-1 p-4 lg:p-8 pb-20 lg:pb-8">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation - показывается только на мобильных */}
      <BottomNavigation currentPage={currentPage} onPageChange={onPageChange} />

      {/* Network Status для отображения офлайн/онлайн статуса */}
      <NetworkStatus />
    </div>
  )
}
