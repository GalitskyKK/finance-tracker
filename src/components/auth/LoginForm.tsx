import { useState } from "react"
import { useForm } from "react-hook-form"
import { Eye, EyeOff, LogIn, Mail, Lock } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { useAuthStore } from "@/store/authStore"
import type { LoginCredentials } from "@/types"

interface LoginFormProps {
  onToggleMode: () => void
  onForgotPassword: () => void
}

export const LoginForm: React.FC<LoginFormProps> = ({ onToggleMode, onForgotPassword }) => {
  const [showPassword, setShowPassword] = useState(false)
  const { signIn, loading, error, clearError } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<LoginCredentials>()

  const onSubmit = async (data: LoginCredentials): Promise<void> => {
    try {
      clearError()
      await signIn(data)
      reset()
    } catch (_error) {
      // Ошибка уже обработана в store
      // Login error handled in store
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <LogIn className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Добро пожаловать!</h1>
        <p className="text-gray-600">Войдите в свой аккаунт для управления финансами</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                {...register("email", {
                  required: "Email обязателен",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Неверный формат email"
                  }
                })}
                type="email"
                placeholder="your@email.com"
                className="pl-10"
                disabled={loading}
                error={errors.email?.message}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Пароль</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                {...register("password", {
                  required: "Пароль обязателен",
                  minLength: {
                    value: 6,
                    message: "Пароль должен быть не менее 6 символов"
                  }
                })}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="pl-10 pr-10"
                disabled={loading}
                error={errors.password?.message}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={loading}>
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm text-blue-600 hover:text-blue-500"
            disabled={loading}>
            Забыли пароль?
          </button>
        </div>

        <Button type="submit" variant="primary" className="w-full" disabled={loading}>
          {loading ? "Вход..." : "Войти"}
        </Button>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Нет аккаунта?{" "}
            <button
              type="button"
              onClick={onToggleMode}
              className="text-blue-600 hover:text-blue-500 font-medium"
              disabled={loading}>
              Зарегистрироваться
            </button>
          </p>
        </div>
      </form>
    </div>
  )
}
