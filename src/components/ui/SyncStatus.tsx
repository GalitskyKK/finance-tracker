import React from "react"
import { Cloud, CloudOff, RefreshCw, AlertCircle, CheckCircle, Clock } from "lucide-react"
import { useOfflineSync } from "@/hooks/useOfflineSync"
import { useNetworkStatus } from "@/hooks/useNetworkStatus"
import { Button } from "./Button"

export const SyncStatus: React.FC = () => {
  const { isOnline } = useNetworkStatus()
  const { syncStatus, isOfflineDataAvailable, syncNow } = useOfflineSync()

  const handleSyncClick = (): void => {
    if (isOnline && !syncStatus.isSyncing) {
      syncNow().catch((_error): void => {
        // Sync failed, will be retried later
      })
    }
  }

  const formatLastSyncTime = (timestamp: number | null): string => {
    if (!timestamp) return "Никогда"

    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return "Только что"
    if (minutes < 60) return `${minutes} мин назад`
    if (hours < 24) return `${hours} ч назад`
    return `${days} дн назад`
  }

  // Не показываем ничего если нет офлайн данных и мы онлайн
  if (!isOfflineDataAvailable && isOnline && syncStatus.pendingOperations === 0) {
    return null
  }

  return (
    <div className="fixed bottom-20 left-4 lg:bottom-4 z-40 max-w-sm">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        <div className="flex items-center gap-3">
          {/* Иконка статуса */}
          <div className="flex-shrink-0">
            {syncStatus.isSyncing ? (
              <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
            ) : isOnline ? (
              syncStatus.pendingOperations > 0 ? (
                <Clock className="w-5 h-5 text-amber-500" />
              ) : (
                <Cloud className="w-5 h-5 text-emerald-500" />
              )
            ) : (
              <CloudOff className="w-5 h-5 text-gray-500" />
            )}
          </div>

          {/* Основная информация */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">
                {syncStatus.isSyncing
                  ? "Синхронизация..."
                  : isOnline
                  ? syncStatus.pendingOperations > 0
                    ? "Ожидает синхронизации"
                    : "Подключено"
                  : "Офлайн режим"}
              </span>

              {syncStatus.pendingOperations > 0 && (
                <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
                  {syncStatus.pendingOperations}
                </span>
              )}
            </div>

            {/* Дополнительная информация */}
            <div className="text-xs text-gray-500 mt-1">
              {syncStatus.error ? (
                <div className="flex items-center gap-1 text-red-600">
                  <AlertCircle className="w-3 h-3" />
                  <span>{syncStatus.error}</span>
                </div>
              ) : isOfflineDataAvailable && !isOnline ? (
                <span>Используются сохраненные данные</span>
              ) : syncStatus.lastSyncTime ? (
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-emerald-500" />
                  <span>Синхронизация: {formatLastSyncTime(syncStatus.lastSyncTime)}</span>
                </div>
              ) : (
                <span>Готов к работе</span>
              )}
            </div>
          </div>

          {/* Кнопка действия */}
          {isOnline && syncStatus.pendingOperations > 0 && !syncStatus.isSyncing && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSyncClick}
              className="flex items-center gap-1 text-xs">
              <RefreshCw className="w-3 h-3" />
              Синхронизировать
            </Button>
          )}
        </div>

        {/* Прогресс синхронизации */}
        {syncStatus.isSyncing && (
          <div className="mt-3">
            <div className="bg-gray-200 rounded-full h-1.5 overflow-hidden">
              <div className="bg-blue-500 h-full rounded-full animate-pulse w-3/4"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SyncStatus
