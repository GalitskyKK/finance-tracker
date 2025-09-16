import { supabase } from "@/lib/supabase"
import type { CreateTransactionData } from "@/types/transaction"
import type { Category } from "@/types/category"

/**
 * Синхронизация офлайн операций с Supabase
 */

interface OfflineOperation {
  id: string
  type: "create" | "update" | "delete"
  table: "transactions" | "categories"
  data: CreateTransactionData | Category | { tempId?: string }
  timestamp: number
  synced: boolean
}

export class SupabaseSync {
  /**
   * Синхронизирует операцию с Supabase
   */
  async syncOperation(operation: OfflineOperation): Promise<{ success: boolean; newId?: string }> {
    try {
      switch (operation.table) {
        case "transactions":
          return await this.syncTransactionOperation(operation)
        case "categories":
          return await this.syncCategoryOperation(operation)
        default:
          throw new Error(`Unsupported table: ${operation.table}`)
      }
    } catch (_error) {
      // Failed to sync operation
      return { success: false }
    }
  }

  /**
   * Синхронизация операций с транзакциями
   */
  private async syncTransactionOperation(
    operation: OfflineOperation
  ): Promise<{ success: boolean; newId?: string }> {
    const { type, data } = operation

    // Получаем текущего пользователя
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error("User not authenticated")
    }

    switch (type) {
      case "create": {
        const transactionData = data as CreateTransactionData & { tempId?: string }

        // Проверяем что категория существует
        const { data: categoryExists } = await supabase
          .from("global_categories")
          .select("id")
          .eq("id", transactionData.categoryId)
          .single()

        if (!categoryExists) {
          throw new Error(`Category ${transactionData.categoryId} not found`)
        }

        // Создаем транзакцию в Supabase
        const { data: newTransaction, error } = await supabase
          .from("transactions")
          .insert({
            user_id: user.id,
            amount: transactionData.amount,
            type: transactionData.type,
            category_id: transactionData.categoryId,
            description: transactionData.description,
            date: transactionData.date
          })
          .select()
          .single()

        if (error) throw error

        return {
          success: true,
          newId: newTransaction.id // Возвращаем реальный ID для замены временного
        }
      }

      case "update": {
        const updateData = data as Partial<CreateTransactionData> & { id: string }

        const updatePayload: Record<string, any> = {}
        if (updateData.amount !== undefined) updatePayload.amount = updateData.amount
        if (updateData.type !== undefined) updatePayload.type = updateData.type
        if (updateData.categoryId !== undefined) updatePayload.category_id = updateData.categoryId
        if (updateData.description !== undefined) updatePayload.description = updateData.description
        if (updateData.date !== undefined) updatePayload.date = updateData.date

        const { error } = await supabase
          .from("transactions")
          .update(updatePayload)
          .eq("id", updateData.id)
          .eq("user_id", user.id) // Защита от изменения чужих транзакций

        if (error) throw error

        return { success: true }
      }

      case "delete": {
        const deleteData = data as { id: string }

        const { error } = await supabase
          .from("transactions")
          .delete()
          .eq("id", deleteData.id)
          .eq("user_id", user.id) // Защита от удаления чужих транзакций

        if (error) throw error

        return { success: true }
      }

      default:
        throw new Error(`Unsupported operation type: ${type}`)
    }
  }

  /**
   * Синхронизация операций с категориями (пока заглушка)
   */
  private async syncCategoryOperation(_operation: OfflineOperation): Promise<{ success: boolean }> {
    // Категории пока только глобальные, изменения не синхронизируются
    return { success: true }
  }

  /**
   * Проверяет доступность Supabase
   */
  async isSupabaseAvailable(): Promise<boolean> {
    try {
      const { error } = await supabase.from("global_categories").select("id").limit(1)
      return !error
    } catch {
      return false
    }
  }

  /**
   * Пакетная синхронизация операций с ограничением
   */
  async syncBatch(
    operations: OfflineOperation[],
    batchSize: number = 5
  ): Promise<{
    successful: Array<{ operationId: string; newId?: string }>
    failed: Array<{ operationId: string; error: string }>
  }> {
    const successful: Array<{ operationId: string; newId?: string }> = []
    const failed: Array<{ operationId: string; error: string }> = []

    // Обрабатываем операции пакетами чтобы не перегружать сервер
    for (let i = 0; i < operations.length; i += batchSize) {
      const batch = operations.slice(i, i + batchSize)

      const promises = batch.map(async (operation) => {
        try {
          const result = await this.syncOperation(operation)
          if (result.success) {
            successful.push({
              operationId: operation.id,
              newId: result.newId
            })
          } else {
            failed.push({
              operationId: operation.id,
              error: "Sync failed"
            })
          }
        } catch (error) {
          failed.push({
            operationId: operation.id,
            error: error instanceof Error ? error.message : "Unknown error"
          })
        }
      })

      await Promise.all(promises)

      // Небольшая пауза между пакетами
      if (i + batchSize < operations.length) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    }

    return { successful, failed }
  }
}

export const supabaseSync = new SupabaseSync()
