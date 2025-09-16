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
  private version = 1
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Создаем stores если их нет
        if (!db.objectStoreNames.contains("categories")) {
          const categoryStore = db.createObjectStore("categories", { keyPath: "id" })
          categoryStore.createIndex("type", "type", { unique: false })
          categoryStore.createIndex("name", "name", { unique: false })
        }

        if (!db.objectStoreNames.contains("transactions")) {
          const transactionStore = db.createObjectStore("transactions", { keyPath: "id" })
          transactionStore.createIndex("categoryId", "categoryId", { unique: false })
          transactionStore.createIndex("type", "type", { unique: false })
          transactionStore.createIndex("date", "date", { unique: false })
        }

        if (!db.objectStoreNames.contains("offlineQueue")) {
          const queueStore = db.createObjectStore("offlineQueue", { keyPath: "id" })
          queueStore.createIndex("synced", "synced", { unique: false })
          queueStore.createIndex("timestamp", "timestamp", { unique: false })
        }

        if (!db.objectStoreNames.contains("metadata")) {
          db.createObjectStore("metadata", { keyPath: "key" })
        }
      }
    })
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init()
    }
    return this.db!
  }

  // ============ CATEGORIES ============

  async saveCategories(categories: Category[]): Promise<void> {
    const db = await this.ensureDB()
    const transaction = db.transaction(["categories"], "readwrite")
    const store = transaction.objectStore("categories")

    for (const category of categories) {
      store.put(category)
    }

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
  }

  async getCategories(): Promise<Category[]> {
    const db = await this.ensureDB()
    const transaction = db.transaction(["categories"], "readonly")
    const store = transaction.objectStore("categories")
    const request = store.getAll()

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async saveCategory(category: Category): Promise<void> {
    const db = await this.ensureDB()
    const transaction = db.transaction(["categories"], "readwrite")
    const store = transaction.objectStore("categories")
    store.put(category)

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
  }

  // ============ TRANSACTIONS ============

  async saveTransactions(transactions: Transaction[]): Promise<void> {
    const db = await this.ensureDB()
    const transaction = db.transaction(["transactions"], "readwrite")
    const store = transaction.objectStore("transactions")

    for (const trans of transactions) {
      store.put(trans)
    }

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
  }

  async getTransactions(): Promise<Transaction[]> {
    const db = await this.ensureDB()
    const transaction = db.transaction(["transactions"], "readonly")
    const store = transaction.objectStore("transactions")
    const request = store.getAll()

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async getTransaction(id: string): Promise<Transaction | null> {
    const db = await this.ensureDB()
    const transaction = db.transaction(["transactions"], "readonly")
    const store = transaction.objectStore("transactions")
    const request = store.get(id)

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  }

  async saveTransaction(transaction: Transaction): Promise<void> {
    const db = await this.ensureDB()
    const dbTransaction = db.transaction(["transactions"], "readwrite")
    const store = dbTransaction.objectStore("transactions")
    store.put(transaction)

    return new Promise((resolve, reject) => {
      dbTransaction.oncomplete = () => resolve()
      dbTransaction.onerror = () => reject(dbTransaction.error)
    })
  }

  async deleteTransaction(id: string): Promise<void> {
    const db = await this.ensureDB()
    const transaction = db.transaction(["transactions"], "readwrite")
    const store = transaction.objectStore("transactions")
    store.delete(id)

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
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
      transaction.oncomplete = () => resolve(operationWithId.id)
      transaction.onerror = () => reject(transaction.error)
    })
  }

  async getOfflineQueue(): Promise<OfflineOperation[]> {
    const db = await this.ensureDB()
    const transaction = db.transaction(["offlineQueue"], "readonly")
    const store = transaction.objectStore("offlineQueue")
    const index = store.index("synced")
    const request = index.getAll(IDBKeyRange.only(false)) // Только не синхронизированные

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async markOperationAsSynced(operationId: string): Promise<void> {
    const db = await this.ensureDB()
    const transaction = db.transaction(["offlineQueue"], "readwrite")
    const store = transaction.objectStore("offlineQueue")

    const getRequest = store.get(operationId)

    return new Promise((resolve, reject) => {
      getRequest.onsuccess = () => {
        const operation = getRequest.result
        if (operation) {
          operation.synced = true
          const putRequest = store.put(operation)
          putRequest.onsuccess = () => resolve()
          putRequest.onerror = () => reject(putRequest.error)
        } else {
          resolve()
        }
      }
      getRequest.onerror = () => reject(getRequest.error)
    })
  }

  async clearSyncedOperations(): Promise<void> {
    const db = await this.ensureDB()
    const transaction = db.transaction(["offlineQueue"], "readwrite")
    const store = transaction.objectStore("offlineQueue")
    const index = store.index("synced")
    const request = index.openCursor(IDBKeyRange.only(true)) // Только синхронизированные

    return new Promise((resolve, reject) => {
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        if (cursor) {
          store.delete(cursor.primaryKey)
          cursor.continue()
        } else {
          resolve()
        }
      }
      request.onerror = () => reject(request.error)
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
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
  }

  async getLastSyncTime(): Promise<number | null> {
    const db = await this.ensureDB()
    const transaction = db.transaction(["metadata"], "readonly")
    const store = transaction.objectStore("metadata")
    const request = store.get("lastSync")

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const result = request.result
        resolve(result ? result.value : null)
      }
      request.onerror = () => reject(request.error)
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
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
  }

  async isDataAvailable(): Promise<boolean> {
    try {
      const categories = await this.getCategories()
      const transactions = await this.getTransactions()
      return categories.length > 0 || transactions.length > 0
    } catch (error) {
      console.error("Error checking data availability:", error)
      return false
    }
  }
}

// Создаем singleton
export const indexedDBManager = new IndexedDBManager()
