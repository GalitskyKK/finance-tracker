import { useEffect } from "react"
import { useAuthStore } from "@/store/authStore"
import { AuthPage } from "./AuthPage"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuthStore()

  // Логируем состояние для отладки
  useEffect(() => {
    console.log("ProtectedRoute state:", { isAuthenticated, loading, user: user?.email })
  }, [isAuthenticated, loading, user])

  // Показываем загрузку пока проверяем аутентификацию
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Проверка аутентификации...</p>
        </div>
      </div>
    )
  }

  // Если не аутентифицирован - показываем страницу входа
  if (!isAuthenticated) {
    return <AuthPage />
  }

  // Если аутентифицирован - показываем защищенный контент
  return <>{children}</>
}
