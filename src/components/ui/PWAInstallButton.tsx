import React from "react"
import { Download, Smartphone } from "lucide-react"
import { usePWAInstall } from "@/hooks/usePWAInstall"
import { Button } from "./Button"

interface PWAInstallButtonProps {
  variant?: "primary" | "secondary"
  size?: "sm" | "md" | "lg"
  className?: string
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = "primary",
  size = "md",
  className = ""
}) => {
  const { isInstallable, isInstalled, showInstallPrompt } = usePWAInstall()

  if (isInstalled) {
    return (
      <div className={`flex items-center gap-2 text-green-600 ${className}`}>
        <Smartphone className="w-4 h-4" />
        <span className="text-sm font-medium">Приложение установлено</span>
      </div>
    )
  }

  if (!isInstallable) {
    return null
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={showInstallPrompt}
      className={`flex items-center gap-2 ${className}`}>
      <Download className="w-4 h-4" />
      Установить приложение
    </Button>
  )
}

export default PWAInstallButton
