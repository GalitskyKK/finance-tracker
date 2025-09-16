import React from "react"
import { WifiOff, CheckCircle } from "lucide-react"
import { useNetworkStatus } from "@/hooks/useNetworkStatus"

export const NetworkStatus: React.FC = () => {
  const { isOnline, wasOffline } = useNetworkStatus()

  if (isOnline && !wasOffline) {
    return null // Не показываем ничего если всегда были онлайн
  }

  if (isOnline && wasOffline) {
    // Показываем уведомление о восстановлении соединения
    return (
      <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-pulse">
        <CheckCircle className="w-4 h-4" />
        <span className="text-sm font-medium">Соединение восстановлено</span>
      </div>
    )
  }

  // Офлайн режим
  return (
    <div className="fixed top-4 right-4 z-50 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
      <WifiOff className="w-4 h-4" />
      <span className="text-sm font-medium">Офлайн режим</span>
    </div>
  )
}

export default NetworkStatus
