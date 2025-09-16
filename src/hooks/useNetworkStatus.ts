import { useState, useEffect } from "react"

interface NetworkStatus {
  isOnline: boolean
  wasOffline: boolean
}

// Более надежная проверка сети для PWA
const checkRealNetworkStatus = async (): Promise<boolean> => {
  // Fallback если navigator.onLine неточный
  if (!navigator.onLine) {
    return false
  }

  // Дополнительная проверка через fetch с timeout
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000)

    await fetch("/favicon.ico", {
      method: "HEAD",
      cache: "no-cache",
      signal: controller.signal
    })

    clearTimeout(timeoutId)
    return true
  } catch {
    return false
  }
}

export const useNetworkStatus = (): NetworkStatus => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [wasOffline, setWasOffline] = useState(false)
  const [isChecking, setIsChecking] = useState(false)

  useEffect(() => {
    const handleOnline = async (): Promise<void> => {
      // Дополнительная проверка для PWA на Android
      if (isChecking) return
      setIsChecking(true)

      const actuallyOnline = await checkRealNetworkStatus()
      setIsOnline(actuallyOnline)

      if (actuallyOnline && wasOffline) {
        setWasOffline(false)
        // Connection restored
      }

      setIsChecking(false)
    }

    const handleOffline = (): void => {
      setIsOnline(false)
      setWasOffline(true)
      setIsChecking(false)
      // Lost internet connection, app working offline
    }

    // Проверяем статус при загрузке для PWA
    const checkInitialStatus = async (): Promise<void> => {
      const actuallyOnline = await checkRealNetworkStatus()
      setIsOnline(actuallyOnline)
      if (!actuallyOnline) {
        setWasOffline(true)
      }
    }

    checkInitialStatus()

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Дополнительная периодическая проверка для PWA
    const interval = setInterval(async () => {
      if (!isChecking) {
        const actuallyOnline = await checkRealNetworkStatus()
        if (actuallyOnline !== isOnline) {
          setIsOnline(actuallyOnline)
          if (!actuallyOnline && !wasOffline) {
            setWasOffline(true)
          }
        }
      }
    }, 10000) // Проверяем каждые 10 секунд

    return (): void => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      clearInterval(interval)
    }
  }, [wasOffline, isOnline, isChecking])

  return { isOnline, wasOffline }
}
