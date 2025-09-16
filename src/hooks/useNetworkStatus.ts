import { useState, useEffect } from "react"

interface NetworkStatus {
  isOnline: boolean
  wasOffline: boolean
}

export const useNetworkStatus = (): NetworkStatus => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [wasOffline, setWasOffline] = useState(false)

  useEffect(() => {
    const handleOnline = (): void => {
      setIsOnline(true)
      // Показываем уведомление о восстановлении соединения только если были офлайн
      if (wasOffline) {
        setWasOffline(false)
        // Connection restored
      }
    }

    const handleOffline = (): void => {
      setIsOnline(false)
      setWasOffline(true)
      // Lost internet connection, app working offline
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return (): void => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [wasOffline])

  return { isOnline, wasOffline }
}
