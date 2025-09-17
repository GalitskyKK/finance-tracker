import React from "react"
import { Cloud, CloudOff, RefreshCw, AlertCircle, Clock } from "lucide-react"
import { useOfflineSync } from "@/hooks/useOfflineSync"
import { useNetworkStatus } from "@/hooks/useNetworkStatus"

interface CompactSyncStatusProps {
  className?: string
  onShowDetails?: () => void
}

/**
 * Компактный индикатор статуса синхронизации для хедера (мобильные устройства)
 * Показывает только иконку с цветовой индикацией
 */
export const CompactSyncStatus: React.FC<CompactSyncStatusProps> = ({
  className = "",
  onShowDetails
}) => {
  const { isOnline } = useNetworkStatus()
  const { syncStatus, isOfflineDataAvailable } = useOfflineSync()

  // Определяем иконку и цвет в зависимости от состояния
  const getStatusIcon = () => {
    if (syncStatus.error) {
      return <AlertCircle className="w-4 h-4 text-red-500" />
    }

    if (syncStatus.isSyncing) {
      return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
    }

    if (!isOnline) {
      return <CloudOff className="w-4 h-4 text-gray-500" />
    }

    if (syncStatus.pendingOperations > 0) {
      return <Clock className="w-4 h-4 text-amber-500" />
    }

    // Все хорошо - показываем зеленое облачко
    return <Cloud className="w-4 h-4 text-emerald-500" />
  }

  const getTooltipText = () => {
    if (syncStatus.error) {
      return `Ошибка синхронизации: ${syncStatus.error}`
    }

    if (syncStatus.isSyncing) {
      return "Синхронизация..."
    }

    if (!isOnline) {
      return isOfflineDataAvailable ? "Офлайн режим" : "Нет подключения"
    }

    if (syncStatus.pendingOperations > 0) {
      return `Ожидает синхронизации: ${syncStatus.pendingOperations} операций`
    }

    return "Подключено к облаку"
  }

  // Не показываем ничего если нет офлайн данных и все в порядке
  if (
    !isOfflineDataAvailable &&
    isOnline &&
    syncStatus.pendingOperations === 0 &&
    !syncStatus.error &&
    !syncStatus.isSyncing
  ) {
    return null
  }

  const handleClick = () => {
    if (onShowDetails) {
      onShowDetails()
    }
  }

  return (
    <div className={`relative ${className}`} title={getTooltipText()}>
      <div
        className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
        onClick={handleClick}>
        {getStatusIcon()}
      </div>

      {/* Индикатор количества ожидающих операций */}
      {syncStatus.pendingOperations > 0 && (
        <div className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
          {syncStatus.pendingOperations > 9 ? "9+" : syncStatus.pendingOperations}
        </div>
      )}

      {/* Индикатор ошибки */}
      {syncStatus.error && (
        <div className="absolute -top-1 -right-1 bg-red-500 rounded-full w-3 h-3 border-2 border-white"></div>
      )}
    </div>
  )
}
