import React, { useState, useMemo } from "react"
import { Edit, Trash2, Plus, Filter, X } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Modal } from "@/components/ui/Modal"
import { TransactionForm } from "@/components/forms/TransactionForm"
import { useTransactionStoreSupabase } from "@/store/transactionStoreSupabase"
import { useCategoryStoreSupabase } from "@/store/categoryStoreSupabase"
import { Transaction, FilterOptions } from "@/types"
import { formatDate, formatAmountWithSign } from "@/utils/formatters"

interface TransactionListProps {
  className?: string
}

export const TransactionList: React.FC<TransactionListProps> = ({ className = "" }) => {
  const { transactions, deleteTransaction } = useTransactionStoreSupabase()
  const { categories, getCategoryById } = useCategoryStoreSupabase()

  const [showAddModal, setShowAddModal] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<FilterOptions>({
    type: "all",
    categoryId: "",
    dateFrom: "",
    dateTo: ""
  })

  // Фильтрация транзакций
  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      // Фильтр по типу
      if (filters.type && filters.type !== "all" && transaction.type !== filters.type) {
        return false
      }

      // Фильтр по категории
      if (filters.categoryId && transaction.categoryId !== filters.categoryId) {
        return false
      }

      // Фильтр по дате от
      if (filters.dateFrom && transaction.date < filters.dateFrom) {
        return false
      }

      // Фильтр по дате до
      if (filters.dateTo && transaction.date > filters.dateTo) {
        return false
      }

      return true
    })
  }, [transactions, filters])

  // Сортировка по дате (новые сверху)
  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  }, [filteredTransactions])

  const handleDeleteTransaction = async (id: string) => {
    if (window.confirm("Вы уверены, что хотите удалить эту транзакцию?")) {
      try {
        await deleteTransaction(id)
      } catch (_error) {
        // TODO: Добавить toast уведомление об ошибке
      }
    }
  }

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction)
  }

  const handleCloseModals = () => {
    setShowAddModal(false)
    setEditingTransaction(null)
  }

  const clearFilters = () => {
    setFilters({
      type: "all",
      categoryId: "",
      dateFrom: "",
      dateTo: ""
    })
  }

  const hasActiveFilters =
    filters.type !== "all" || filters.categoryId || filters.dateFrom || filters.dateTo

  // Опции для фильтров
  const typeOptions = [
    { value: "all", label: "Все типы" },
    { value: "income", label: "Доходы" },
    { value: "expense", label: "Расходы" }
  ]

  const categoryOptions = [
    { value: "", label: "Все категории" },
    ...categories.map((category) => ({
      value: category.id,
      label: category.name,
      color: category.color
    }))
  ]

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Транзакции</CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? "bg-blue-100 text-blue-700" : ""}>
                <Filter className="h-4 w-4 mr-2" />
                Фильтры
                {hasActiveFilters && (
                  <span className="ml-1 bg-blue-500 text-white rounded-full px-1.5 py-0.5 text-xs">
                    !
                  </span>
                )}
              </Button>
              <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Добавить
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Фильтры */}
          {showFilters && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">Фильтры</h3>
                {hasActiveFilters && (
                  <Button variant="secondary" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Очистить
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Select
                  options={typeOptions}
                  value={filters.type}
                  onChange={(value) =>
                    setFilters((prev) => ({
                      ...prev,
                      type: value === "" ? "all" : (value as "income" | "expense" | "all")
                    }))
                  }
                  label="Тип"
                />

                <Select
                  options={categoryOptions}
                  value={filters.categoryId}
                  onChange={(value) => setFilters((prev) => ({ ...prev, categoryId: value }))}
                  label="Категория"
                />

                <Input
                  type="date"
                  label="Дата от"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))}
                />

                <Input
                  type="date"
                  label="Дата до"
                  value={filters.dateTo}
                  onChange={(e) => setFilters((prev) => ({ ...prev, dateTo: e.target.value }))}
                />
              </div>
            </div>
          )}

          {/* Список транзакций */}
          {sortedTransactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg
                  className="mx-auto h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {hasActiveFilters ? "Нет транзакций по выбранным фильтрам" : "Нет транзакций"}
              </h3>
              <p className="text-gray-500 mb-4">
                {hasActiveFilters
                  ? "Попробуйте изменить параметры фильтрации"
                  : "Добавьте первую транзакцию, чтобы начать отслеживать финансы"}
              </p>
              {!hasActiveFilters && (
                <Button variant="primary" onClick={() => setShowAddModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить транзакцию
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {sortedTransactions.map((transaction) => {
                const category = getCategoryById(transaction.categoryId)

                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                    <div className="flex items-center space-x-4">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                        style={{ backgroundColor: category?.color || "#6B7280" }}>
                        {category?.icon ? (
                          <span className="text-sm font-medium">
                            {category.name.charAt(0).toUpperCase()}
                          </span>
                        ) : (
                          <span className="text-sm font-medium">?</span>
                        )}
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900">{transaction.description}</h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span>{category?.name || "Неизвестная категория"}</span>
                          <span>•</span>
                          <span>{formatDate(transaction.date)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span
                        className={`font-semibold ${
                          transaction.type === "income" ? "text-green-600" : "text-red-600"
                        }`}>
                        {formatAmountWithSign(transaction.amount, transaction.type)}
                      </span>

                      <div className="flex space-x-1">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleEditTransaction(transaction)}
                          className="!p-2">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          className="!p-2">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Модальные окна */}
      <Modal
        isOpen={showAddModal}
        onClose={handleCloseModals}
        title="Добавить транзакцию"
        size="md">
        <TransactionForm onSuccess={handleCloseModals} />
      </Modal>

      <Modal
        isOpen={!!editingTransaction}
        onClose={handleCloseModals}
        title="Редактировать транзакцию"
        size="md">
        {editingTransaction && (
          <TransactionForm
            isEditing
            transactionId={editingTransaction.id}
            initialData={editingTransaction}
            onSuccess={handleCloseModals}
          />
        )}
      </Modal>
    </div>
  )
}
