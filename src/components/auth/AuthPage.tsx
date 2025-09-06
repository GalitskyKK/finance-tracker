import { useState } from "react"
import { LoginForm } from "./LoginForm"
import { RegisterForm } from "./RegisterForm"
import { ForgotPasswordForm } from "./ForgotPasswordForm"

type AuthMode = "login" | "register" | "forgot-password"

export const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>("login")

  const handleModeChange = (newMode: AuthMode): void => {
    setMode(newMode)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            {mode === "login" && (
              <LoginForm
                onToggleMode={() => handleModeChange("register")}
                onForgotPassword={() => handleModeChange("forgot-password")}
              />
            )}

            {mode === "register" && <RegisterForm onToggleMode={() => handleModeChange("login")} />}

            {mode === "forgot-password" && (
              <ForgotPasswordForm onBackToLogin={() => handleModeChange("login")} />
            )}
          </div>

          {/* Дополнительная информация */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Ваши данные защищены и не передаются третьим лицам
            </p>
          </div>
        </div>
      </div>

      {/* Декоративные элементы */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-40 left-20 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}
