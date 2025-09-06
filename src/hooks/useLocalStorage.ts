import { useState } from "react"

/**
 * Хук для работы с localStorage
 */
export const useLocalStorage = <T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      if (item) {
        const parsed: unknown = JSON.parse(item)
        return parsed as T
      }
      return initialValue
    } catch (_error) {
      // Ошибка чтения из localStorage - возвращаем начальное значение
      return initialValue
    }
  })

  const setValue = (value: T | ((val: T) => T)): void => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (_error) {
      // Ошибка записи в localStorage - игнорируем
    }
  }

  const removeValue = (): void => {
    try {
      localStorage.removeItem(key)
      setStoredValue(initialValue)
    } catch (_error) {
      // Ошибка удаления из localStorage - игнорируем
    }
  }

  return [storedValue, setValue, removeValue] as const
}
