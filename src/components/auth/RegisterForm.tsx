import { useState } from "react"
import { useForm } from "react-hook-form"
import { Eye, EyeOff, UserPlus, Mail, Lock, User } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { useAuthStore } from "@/store/authStore"
import type { RegisterCredentials } from "@/types"

interface RegisterFormProps {
  onToggleMode: () => void
}

interface RegisterFormData extends RegisterCredentials {
  confirmPassword: string
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onToggleMode }) => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { signUp, loading, error, clearError } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset
  } = useForm<RegisterFormData>()

  const password = watch("password")

  const onSubmit = async (data: RegisterFormData): Promise<void> => {
    try {
      clearError()
      const { confirmPassword: _confirmPassword, ...credentials } = data
      await signUp(credentials)
      reset()
    } catch (_error) {
      // Ошибка уже обработана в store
      // Registration error handled in store
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
          <UserPlus className="w-8 h-8 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Создать аккаунт</h1>
        <p className="text-gray-600">Начните управлять своими финансами уже сегодня</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Имя</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                {...register("name", {
                  minLength: {
                    value: 2,
                    message: "Имя должно быть не менее 2 символов"
                  },
                  maxLength: {
                    value: 50,
                    message: "Имя не должно превышать 50 символов"
                  }
                })}
                type="text"
                placeholder="Ваше имя"
                className="pl-10"
                disabled={loading}
                error={errors.name?.message}
              />
            </div>
          </div>

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
                  },
                  pattern: {
                    value: /^(?=.*[a-zA-Z])(?=.*\d).+$/,
                    message: "Пароль должен содержать буквы и цифры"
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Подтвердите пароль
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                {...register("confirmPassword", {
                  required: "Подтвердите пароль",
                  validate: (value) => value === password || "Пароли не совпадают"
                })}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                className="pl-10 pr-10"
                disabled={loading}
                error={errors.confirmPassword?.message}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={loading}>
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-500">
          <p>
            Создавая аккаунт, вы соглашаетесь с нашими{" "}
            <a href="#" className="text-blue-600 hover:text-blue-500">
              Условиями использования
            </a>{" "}
            и{" "}
            <a href="#" className="text-blue-600 hover:text-blue-500">
              Политикой конфиденциальности
            </a>
          </p>
        </div>

        <Button type="submit" variant="primary" className="w-full" disabled={loading}>
          {loading ? "Создание аккаунта..." : "Создать аккаунт"}
        </Button>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Уже есть аккаунт?{" "}
            <button
              type="button"
              onClick={onToggleMode}
              className="text-blue-600 hover:text-blue-500 font-medium"
              disabled={loading}>
              Войти
            </button>
          </p>
        </div>
      </form>
    </div>
  )
}
