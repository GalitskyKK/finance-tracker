import React, { useState } from "react"
import { Menu } from "lucide-react"
import { Header } from "./Header"
import { Sidebar } from "./Sidebar"
import { Button } from "@/components/ui/Button"

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
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = (): void => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          currentPage={currentPage}
          onPageChange={onPageChange}
          isOpen={sidebarOpen}
          onToggle={toggleSidebar}
        />

        {/* Main content */}
        <div className="flex-1 lg:ml-0">
          {/* Mobile menu button */}
          <div className="lg:hidden fixed top-4 left-4 z-30">
            <Button variant="secondary" size="sm" onClick={toggleSidebar} className="!p-2">
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <main className="p-4 lg:p-8 pt-16 lg:pt-8">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </div>
  )
}
