import { useState, useEffect } from "react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

interface UsePWAInstallReturn {
  isInstallable: boolean
  isInstalled: boolean
  showInstallPrompt: () => Promise<void>
}

// Расширяем Navigator интерфейс для iOS Safari
interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean
}

export const usePWAInstall = (): UsePWAInstallReturn => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Проверяем, установлено ли уже приложение
    const checkIfInstalled = (): void => {
      if (window.matchMedia("(display-mode: standalone)").matches) {
        setIsInstalled(true)
      } else if ((window.navigator as NavigatorWithStandalone).standalone === true) {
        // iOS Safari
        setIsInstalled(true)
      }
    }

    checkIfInstalled()

    // Обработчик события beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event): void => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
    }

    // Обработчик события appinstalled
    const handleAppInstalled = (): void => {
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
      // PWA установлено успешно
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    return (): void => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  const showInstallPrompt = async (): Promise<void> => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      // Пользователь принял установку PWA
    } else {
      // Пользователь отклонил установку PWA
    }

    setDeferredPrompt(null)
    setIsInstallable(false)
  }

  return {
    isInstallable: isInstallable && !isInstalled,
    isInstalled,
    showInstallPrompt
  }
}
