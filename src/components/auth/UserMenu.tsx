import { useState, useRef, useEffect } from "react"
import { User, LogOut, Settings, ChevronDown } from "lucide-react"
import { useAuthStore } from "@/store/authStore"

export const UserMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { user, signOut, loading } = useAuthStore()

  // Закрытие меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleSignOut = async (): Promise<void> => {
    try {
      await signOut()
      setIsOpen(false)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Sign out failed"
      // Sign out error handled
    }
  }

  if (!user) return null

  const userName = user.user_metadata?.name ?? user.email?.split("@")[0] ?? "Пользователь"
  const userEmail = user.email ?? ""

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        disabled={loading}>
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-blue-600" />
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-gray-900">{userName}</p>
          <p className="text-xs text-gray-500">{userEmail}</p>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-gray-200">
            <p className="text-sm font-medium text-gray-900">{userName}</p>
            <p className="text-xs text-gray-500 truncate">{userEmail}</p>
          </div>

          <div className="py-2">
            <button
              onClick={() => {
                setIsOpen(false)
                // TODO: Открыть модал настроек
                // Open settings modal
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
              <Settings className="w-4 h-4 mr-3 text-gray-500" />
              Настройки
            </button>

            <button
              onClick={handleSignOut}
              disabled={loading}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50">
              <LogOut className="w-4 h-4 mr-3" />
              {loading ? "Выход..." : "Выйти"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
