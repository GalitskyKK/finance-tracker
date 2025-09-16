import { useState, useEffect } from "react"

interface NetworkStatus {
  isOnline: boolean
  wasOffline: boolean
}

export const useNetworkStatus = (): NetworkStatus => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [wasOffline, setWasOffline] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      // Показываем уведомление о восстановлении соединения только если были офлайн
      if (wasOffline) {
        setWasOffline(false)
        console.log("Соединение с интернетом восстановлено")
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
      setWasOffline(true)
      console.log("Потеряно соединение с интернетом. Приложение работает в офлайн режиме")
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [wasOffline])

  return { isOnline, wasOffline }
}
