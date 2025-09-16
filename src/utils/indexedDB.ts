import type { Category } from "@/types/category"
import type { Transaction } from "@/types/transaction"

import type { CreateTransactionData } from "@/types/transaction"

interface OfflineTransactionOperation {
  id: string
  type: "create" | "update" | "delete"
  table: "transactions"
  data: CreateTransactionData & { tempId?: string }
  timestamp: number
  synced: boolean
}

interface OfflineCategoryOperation {
  id: string
  type: "create" | "update" | "delete"
  table: "categories"
  data: Category
  timestamp: number
  synced: boolean
}

type OfflineOperation = OfflineTransactionOperation | OfflineCategoryOperation

class IndexedDBManager {
  private dbName = "finance-tracker-db"
  private version = 2 // Увеличиваем версию для исправления схемы
  private db: IDBDatabase | null = null
  private isSupported = true
  private initAttempted = false

  private checkIndexedDBSupport(): boolean {
    if (typeof window === "undefined") return false

    // Проверяем базовую поддержку
    if (!window.indexedDB) {
      return false
    }

    // Проверяем доступность в текущем контексте (PWA может блокировать)
    try {
      // Пытаемся создать простой запрос
      const testRequest = indexedDB.open("_test_", 1)
      testRequest.onerror = (): void => {
        this.isSupported = false
      }
      // Удаляем тестовую базу сразу
      testRequest.onsuccess = (): void => {
        testRequest.result.close()
        indexedDB.deleteDatabase("_test_")
      }
      return true
    } catch {
      return false
    }
  }

  async init(): Promise<void> {
    if (this.initAttempted) {
      // Если уже пытались инициализировать, просто возвращаемся
      // Fallback на localStorage будет использован автоматически
      return
    }

    this.initAttempted = true

    if (!this.checkIndexedDBSupport()) {
      this.isSupported = false
      // Не выбрасываем ошибку, просто используем fallback
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      try {
        const request = indexedDB.open(this.dbName, this.version)

        request.onerror = (): void => {
          // Если ошибка связана с конфликтом данных, пытаемся пересоздать базу
          const errorMessage = request.error?.message ?? "Unknown error"
          if (errorMessage.includes("Data provided to an operation does not meet requirements")) {
            // Удаляем старую базу и пытаемся создать заново
            indexedDB.deleteDatabase(this.dbName)
            // Повторная попытка через небольшую задержку
            setTimeout(() => {
              this.initAttempted = false
              this.init()
                .then(resolve)
                .catch(() => {
                  this.isSupported = false
                  resolve() // Не выбрасываем ошибку, используем fallback
                })
            }, 100)
            return
          }

          this.isSupported = false
          resolve() // Не выбрасываем ошибку для других случаев, используем fallback
        }

        request.onsuccess = (): void => {
          this.db = request.result
          this.isSupported = true
          resolve()
        }

        request.onupgradeneeded = (event: IDBVersionChangeEvent): void => {
          const db = (event.target as IDBOpenDBRequest).result
          const oldVersion = event.oldVersion

          // Удаляем старые stores если они существуют (для пересоздания схемы)
          if (oldVersion > 0) {
            // Удаляем все старые object stores для чистого обновления
            const storeNames = Array.from(db.objectStoreNames)
            storeNames.forEach((storeName) => {
              if (db.objectStoreNames.contains(storeName)) {
                db.deleteObjectStore(storeName)
              }
            })
          }

          // Создаем новые stores с правильной схемой
          const categoryStore = db.createObjectStore("categories", { keyPath: "id" })
          categoryStore.createIndex("type", "type", { unique: false })
          categoryStore.createIndex("name", "name", { unique: false })

          const transactionStore = db.createObjectStore("transactions", { keyPath: "id" })
          transactionStore.createIndex("categoryId", "categoryId", { unique: false })
          transactionStore.createIndex("type", "type", { unique: false })
          transactionStore.createIndex("date", "date", { unique: false })

          const queueStore = db.createObjectStore("offlineQueue", { keyPath: "id" })
          queueStore.createIndex("synced", "synced", { unique: false })
          queueStore.createIndex("timestamp", "timestamp", { unique: false })

          db.createObjectStore("metadata", { keyPath: "key" })
        }

        // Таймаут для случаев когда IndexedDB висит
        setTimeout(() => {
          if (!this.db) {
            this.isSupported = false
            reject(new Error("IndexedDB initialization timeout"))
          }
        }, 5000)
      } catch (error) {
        this.isSupported = false
        reject(
          new Error(
            `IndexedDB initialization failed: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          )
        )
      }
    })
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.isSupported) {
      throw new Error("IndexedDB not supported - using localStorage fallback")
    }

    if (!this.db) {
      await this.init()
    }

    if (!this.db) {
      throw new Error("Failed to initialize IndexedDB")
    }

    return this.db
  }

  // ============ FALLBACK METHODS (localStorage) ============

  private getLocalStorageKey(table: string): string {
    return `finance-tracker-${table}`
  }

  private saveToLocalStorage<T>(table: string, data: T[]): void {
    try {
      localStorage.setItem(this.getLocalStorageKey(table), JSON.stringify(data))
    } catch (error) {
      throw new Error(
        `Failed to save to localStorage: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      )
    }
  }

  private getFromLocalStorage<T>(table: string): T[] {
    try {
      const data = localStorage.getItem(this.getLocalStorageKey(table))
      return data ? (JSON.parse(data) as T[]) : []
    } catch {
      return []
    }
  }

  // ============ CATEGORIES ============

  async saveCategories(categories: Category[]): Promise<void> {
    // Fallback to localStorage if IndexedDB not supported
    if (!this.isSupported) {
      this.saveToLocalStorage("categories", categories)
      return
    }

    try {
      const db = await this.ensureDB()
      const transaction = db.transaction(["categories"], "readwrite")
      const store = transaction.objectStore("categories")

      for (const category of categories) {
        store.put(category)
      }

      return new Promise((resolve, reject) => {
        transaction.oncomplete = (): void => resolve()
        transaction.onerror = (): void => reject(transaction.error)
      })
    } catch {
      // Fallback to localStorage if IndexedDB fails
      this.isSupported = false
      this.saveToLocalStorage("categories", categories)
    }
  }

  async getCategories(): Promise<Category[]> {
    // Fallback to localStorage if IndexedDB not supported
    if (!this.isSupported) {
      return this.getFromLocalStorage<Category>("categories")
    }

    try {
      const db = await this.ensureDB()
      const transaction = db.transaction(["categories"], "readonly")
      const store = transaction.objectStore("categories")
      const request = store.getAll()

      return new Promise((resolve, reject) => {
        request.onsuccess = (): void => resolve(request.result)
        request.onerror = (): void => reject(request.error)
      })
    } catch {
      // Fallback to localStorage if IndexedDB fails
      this.isSupported = false
      return this.getFromLocalStorage<Category>("categories")
    }
  }

  async saveCategory(category: Category): Promise<void> {
    const db = await this.ensureDB()
    const transaction = db.transaction(["categories"], "readwrite")
    const store = transaction.objectStore("categories")
    store.put(category)

    return new Promise((resolve, reject) => {
      transaction.oncomplete = (): void => resolve()
      transaction.onerror = (): void => reject(transaction.error)
    })
  }

  // ============ TRANSACTIONS ============

  async saveTransactions(transactions: Transaction[]): Promise<void> {
    // Fallback to localStorage if IndexedDB not supported
    if (!this.isSupported) {
      this.saveToLocalStorage("transactions", transactions)
      return
    }

    try {
      const db = await this.ensureDB()
      const transaction = db.transaction(["transactions"], "readwrite")
      const store = transaction.objectStore("transactions")

      for (const trans of transactions) {
        store.put(trans)
      }

      return new Promise((resolve, reject) => {
        transaction.oncomplete = (): void => resolve()
        transaction.onerror = (): void => reject(transaction.error)
      })
    } catch {
      // Fallback to localStorage if IndexedDB fails
      this.isSupported = false
      this.saveToLocalStorage("transactions", transactions)
    }
  }

  async getTransactions(): Promise<Transaction[]> {
    // Fallback to localStorage if IndexedDB not supported
    if (!this.isSupported) {
      return this.getFromLocalStorage<Transaction>("transactions")
    }

    try {
      const db = await this.ensureDB()
      const transaction = db.transaction(["transactions"], "readonly")
      const store = transaction.objectStore("transactions")
      const request = store.getAll()

      return new Promise((resolve, reject) => {
        request.onsuccess = (): void => resolve(request.result)
        request.onerror = (): void => reject(request.error)
      })
    } catch {
      // Fallback to localStorage if IndexedDB fails
      this.isSupported = false
      return this.getFromLocalStorage<Transaction>("transactions")
    }
  }

  async getTransaction(id: string): Promise<Transaction | null> {
    const db = await this.ensureDB()
    const transaction = db.transaction(["transactions"], "readonly")
    const store = transaction.objectStore("transactions")
    const request = store.get(id)

    return new Promise((resolve, reject) => {
      request.onsuccess = (): void => resolve((request.result as Transaction) ?? null)
      request.onerror = (): void => reject(request.error)
    })
  }

  async saveTransaction(transaction: Transaction): Promise<void> {
    // Fallback to localStorage if IndexedDB not supported
    if (!this.isSupported) {
      const transactions = this.getFromLocalStorage<Transaction>("transactions")
      const existingIndex = transactions.findIndex((t) => t.id === transaction.id)

      if (existingIndex >= 0) {
        transactions[existingIndex] = transaction
      } else {
        transactions.push(transaction)
      }

      this.saveToLocalStorage("transactions", transactions)
      return
    }

    try {
      const db = await this.ensureDB()
      const dbTransaction = db.transaction(["transactions"], "readwrite")
      const store = dbTransaction.objectStore("transactions")
      store.put(transaction)

      return new Promise((resolve, reject) => {
        dbTransaction.oncomplete = (): void => resolve()
        dbTransaction.onerror = (): void => reject(dbTransaction.error)
      })
    } catch {
      // Fallback to localStorage if IndexedDB fails
      this.isSupported = false
      const transactions = this.getFromLocalStorage<Transaction>("transactions")
      const existingIndex = transactions.findIndex((t) => t.id === transaction.id)

      if (existingIndex >= 0) {
        transactions[existingIndex] = transaction
      } else {
        transactions.push(transaction)
      }

      this.saveToLocalStorage("transactions", transactions)
    }
  }

  async deleteTransaction(id: string): Promise<void> {
    const db = await this.ensureDB()
    const transaction = db.transaction(["transactions"], "readwrite")
    const store = transaction.objectStore("transactions")
    store.delete(id)

    return new Promise((resolve, reject) => {
      transaction.oncomplete = (): void => resolve()
      transaction.onerror = (): void => reject(transaction.error)
    })
  }

  // ============ OFFLINE QUEUE ============

  async addToOfflineQueue(operation: Omit<OfflineOperation, "id">): Promise<string> {
    const db = await this.ensureDB()
    const operationWithId = {
      ...operation,
      id: crypto.randomUUID()
    }

    const transaction = db.transaction(["offlineQueue"], "readwrite")
    const store = transaction.objectStore("offlineQueue")
    store.add(operationWithId)

    return new Promise((resolve, reject) => {
      transaction.oncomplete = (): void => resolve(operationWithId.id)
      transaction.onerror = (): void => reject(transaction.error)
    })
  }

  async getOfflineQueue(): Promise<OfflineOperation[]> {
    const db = await this.ensureDB()
    const transaction = db.transaction(["offlineQueue"], "readonly")
    const store = transaction.objectStore("offlineQueue")
    const index = store.index("synced")
    const request = index.getAll(IDBKeyRange.only(false)) // Только не синхронизированные

    return new Promise((resolve, reject) => {
      request.onsuccess = (): void => resolve(request.result)
      request.onerror = (): void => reject(request.error)
    })
  }

  async markOperationAsSynced(operationId: string): Promise<void> {
    const db = await this.ensureDB()
    const transaction = db.transaction(["offlineQueue"], "readwrite")
    const store = transaction.objectStore("offlineQueue")

    const getRequest = store.get(operationId)

    return new Promise((resolve, reject) => {
      getRequest.onsuccess = (): void => {
        const operation = getRequest.result as OfflineOperation | undefined
        if (operation) {
          operation.synced = true
          const putRequest = store.put(operation)
          putRequest.onsuccess = (): void => resolve()
          putRequest.onerror = (): void => reject(putRequest.error)
        } else {
          resolve()
        }
      }
      getRequest.onerror = (): void => reject(getRequest.error)
    })
  }

  async clearSyncedOperations(): Promise<void> {
    const db = await this.ensureDB()
    const transaction = db.transaction(["offlineQueue"], "readwrite")
    const store = transaction.objectStore("offlineQueue")
    const index = store.index("synced")
    const request = index.openCursor(IDBKeyRange.only(true)) // Только синхронизированные

    return new Promise((resolve, reject) => {
      request.onsuccess = (event: Event): void => {
        const cursor = (event.target as IDBRequest).result as IDBCursorWithValue | null
        if (cursor) {
          store.delete(cursor.primaryKey)
          cursor.continue()
        } else {
          resolve()
        }
      }
      request.onerror = (): void => reject(request.error)
    })
  }

  // ============ METADATA ============

  async setLastSyncTime(): Promise<void> {
    const db = await this.ensureDB()
    const transaction = db.transaction(["metadata"], "readwrite")
    const store = transaction.objectStore("metadata")

    store.put({
      key: "lastSync",
      value: Date.now()
    })

    return new Promise((resolve, reject) => {
      transaction.oncomplete = (): void => resolve()
      transaction.onerror = (): void => reject(transaction.error)
    })
  }

  async getLastSyncTime(): Promise<number | null> {
    const db = await this.ensureDB()
    const transaction = db.transaction(["metadata"], "readonly")
    const store = transaction.objectStore("metadata")
    const request = store.get("lastSync")

    return new Promise((resolve, reject) => {
      request.onsuccess = (): void => {
        const result = request.result as { value: number } | undefined
        resolve(result ? result.value : null)
      }
      request.onerror = (): void => reject(request.error)
    })
  }

  // ============ UTILITIES ============

  async clearAllData(): Promise<void> {
    const db = await this.ensureDB()
    const transaction = db.transaction(
      ["categories", "transactions", "offlineQueue", "metadata"],
      "readwrite"
    )

    transaction.objectStore("categories").clear()
    transaction.objectStore("transactions").clear()
    transaction.objectStore("offlineQueue").clear()
    transaction.objectStore("metadata").clear()

    return new Promise((resolve, reject) => {
      transaction.oncomplete = (): void => resolve()
      transaction.onerror = (): void => reject(transaction.error)
    })
  }

  async isDataAvailable(): Promise<boolean> {
    try {
      const categories = await this.getCategories()
      const transactions = await this.getTransactions()
      return categories.length > 0 || transactions.length > 0
    } catch (_error) {
      // Error checking data availability
      return false
    }
  }
}

// Создаем singleton
export const indexedDBManager = new IndexedDBManager()
