import { useState } from "react"
import { useForm } from "react-hook-form"
import { ArrowLeft, Mail, Send, Check } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { useAuthStore } from "@/store/authStore"
import type { ResetPasswordData } from "@/types"

interface ForgotPasswordFormProps {
  onBackToLogin: () => void
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBackToLogin }) => {
  const [isEmailSent, setIsEmailSent] = useState(false)
  const { resetPassword, loading, error, clearError } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    reset
  } = useForm<ResetPasswordData>()

  const onSubmit = async (data: ResetPasswordData): Promise<void> => {
    try {
      clearError()
      await resetPassword(data)
      setIsEmailSent(true)
      reset()
    } catch (_error) {
      // Ошибка уже обработана в store
      // Password reset error handled in store
    }
  }

  const handleBackToLogin = (): void => {
    setIsEmailSent(false)
    clearError()
    onBackToLogin()
  }

  if (isEmailSent) {
    const email = getValues("email")

    return (
      <div className="w-full max-w-md mx-auto text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
          <Check className="w-8 h-8 text-emerald-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Письмо отправлено!</h1>

        <p className="text-gray-600 mb-6">
          Мы отправили инструкции по восстановлению пароля на{" "}
          <span className="font-medium text-gray-900">{email}</span>
        </p>

        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Не видите письмо?</strong> Проверьте папку спам или повторите отправку через
              несколько минут.
            </p>
          </div>

          <Button onClick={handleBackToLogin} variant="secondary" className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Вернуться к входу
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
          <Send className="w-8 h-8 text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Забыли пароль?</h1>
        <p className="text-gray-600">
          Введите ваш email и мы отправим инструкции по восстановлению пароля
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

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

        <div className="space-y-4">
          <Button type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? "Отправка..." : "Отправить инструкции"}
          </Button>

          <Button
            type="button"
            onClick={handleBackToLogin}
            variant="secondary"
            className="w-full"
            disabled={loading}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Вернуться к входу
          </Button>
        </div>
      </form>

      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-xs text-gray-600">
          <strong>Примечание:</strong> Ссылка для восстановления пароля будет действительна в
          течение 24 часов. После этого потребуется повторная отправка.
        </p>
      </div>
    </div>
  )
}
