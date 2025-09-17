import React, { useEffect } from "react"
import { indexedDBManager } from "@/utils/indexedDB"

/**
 * Невидимый компонент для автоматического исправления проблем IndexedDB
 * Запускается при загрузке приложения на всех устройствах (включая мобильные)
 */
export const AutoFixIndexedDB: React.FC = () => {
  useEffect(() => {
    const checkAndFixIndexedDB = async (): Promise<void> => {
      try {
        // Пытаемся получить данные КопиКопи из IndexedDB
        await indexedDBManager.getSavingsGoals()
        await indexedDBManager.getSavingsTransactions()

        // Если добрались сюда - все работает корректно
      } catch (error) {
        // Если ошибка связана с object store - автоматически исправляем
        const errorMessage = (error as Error)?.message || ""
        if (
          errorMessage.includes("object store") ||
          errorMessage.includes("savingsGoals") ||
          errorMessage.includes("savingsTransactions")
        ) {
          try {
            // Тихо пересоздаем IndexedDB
            await indexedDBManager.forceReinitializeDB()
          } catch (_fixError) {
            // Если исправление не удалось - приложение продолжит работать на localStorage
            // Не показываем ошибки пользователю
          }
        }
      }
    }

    // Запускаем проверку с небольшой задержкой после инициализации
    const timeoutId = setTimeout(checkAndFixIndexedDB, 1000)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [])

  // Компонент невидимый - ничего не рендерим
  return null
}
