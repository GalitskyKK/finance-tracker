import React, { useState, useMemo } from "react"
import { Edit, Trash2, Plus, Filter, X, TrendingUp, TrendingDown } from "lucide-react"
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

interface TransactionDetailsModalProps {
  transaction: Transaction
  category?: { id: string; name: string; color: string; icon: string } | null
  onEdit: () => void
  onDelete: () => void
  onClose: () => void
}

const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({
  transaction,
  category,
  onEdit,
  onDelete,
  onClose
}) => {
  const isIncome = transaction.type === "income"

  return (
    <div className="space-y-6">
      {/* Заголовок с иконкой и суммой */}
      <div className="text-center">
        <div
          className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
            isIncome ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
          }`}>
          {isIncome ? <TrendingUp className="h-8 w-8" /> : <TrendingDown className="h-8 w-8" />}
        </div>
        <div
          className={`text-3xl font-bold mb-2 ${isIncome ? "text-emerald-600" : "text-red-600"}`}>
          {formatAmountWithSign(transaction.amount, transaction.type)}
        </div>
        <div
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            isIncome ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
          }`}>
          {isIncome ? "Доход" : "Расход"}
        </div>
      </div>

      {/* Детали транзакции */}
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          {/* Описание */}
          <div className="flex justify-between items-start">
            <span className="text-gray-600 font-medium">Описание:</span>
            <span className="text-gray-900 font-semibold text-right">
              {transaction.description}
            </span>
          </div>

          {/* Категория */}
          <div className="flex justify-between items-center">
            <span className="text-gray-600 font-medium">Категория:</span>
            <div className="flex items-center space-x-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: category?.color ?? "#6B7280" }}
              />
              <span className="text-gray-900 font-semibold">
                {category?.name ?? "Неизвестная категория"}
              </span>
            </div>
          </div>

          {/* Дата */}
          <div className="flex justify-between items-center">
            <span className="text-gray-600 font-medium">Дата:</span>
            <span className="text-gray-900 font-semibold">{formatDate(transaction.date)}</span>
          </div>

          {/* Время создания */}
          <div className="flex justify-between items-center">
            <span className="text-gray-600 font-medium">Создано:</span>
            <span className="text-gray-500 text-sm">
              {new Date(transaction.createdAt).toLocaleString("ru-RU")}
            </span>
          </div>
        </div>
      </div>

      {/* Стильные действия */}
      <div className="border-t border-gray-100 pt-6 space-y-3">
        {/* Основное действие - редактирование */}
        <button
          onClick={onEdit}
          className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/25 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2">
          <Edit className="h-5 w-5" />
          <span>Редактировать транзакцию</span>
        </button>

        {/* Вторичное действие - удаление */}
        <button
          onClick={() => {
            if (window.confirm("Вы уверены, что хотите удалить эту транзакцию?")) {
              onDelete()
            }
          }}
          className="w-full bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-700 font-medium py-3 px-4 rounded-xl transition-all duration-200 hover:border-red-200 border border-gray-200 flex items-center justify-center space-x-2 group">
          <Trash2 className="h-4 w-4 group-hover:text-red-600" />
          <span>Удалить транзакцию</span>
        </button>
      </div>
    </div>
  )
}

export const TransactionList: React.FC<TransactionListProps> = ({ className = "" }) => {
  const { transactions, deleteTransaction } = useTransactionStoreSupabase()
  const { categories, getCategoryById } = useCategoryStoreSupabase()

  const [showAddModal, setShowAddModal] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
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

  const handleDeleteTransaction = async (id: string): Promise<void> => {
    if (window.confirm("Вы уверены, что хотите удалить эту транзакцию?")) {
      try {
        await deleteTransaction(id)
      } catch (_error) {
        // TODO: Добавить toast уведомление об ошибке
      }
    }
  }

  const handleEditTransaction = (transaction: Transaction): void => {
    setEditingTransaction(transaction)
  }

  const handleCloseModals = (): void => {
    setShowAddModal(false)
    setEditingTransaction(null)
    setSelectedTransaction(null)
  }

  const handleTransactionClick = (transaction: Transaction): void => {
    setSelectedTransaction(transaction)
  }

  const clearFilters = (): void => {
    setFilters({
      type: "all",
      categoryId: "",
      dateFrom: "",
      dateTo: ""
    })
  }

  const hasActiveFilters =
    filters.type !== "all" || !!filters.categoryId || !!filters.dateFrom || !!filters.dateTo

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
      {/* Компактный заголовок с действиями */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Транзакции</h1>
            <p className="text-gray-500 text-sm mt-1">Управление доходами и расходами</p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={`${
                showFilters ? "!bg-emerald-50 !text-emerald-700 !border-emerald-200" : ""
              }`}>
              <Filter className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Фильтры</span>
              {hasActiveFilters && (
                <span className="ml-1 bg-emerald-500 text-white rounded-full px-1.5 py-0.5 text-xs">
                  {Object.values(filters).filter((v) => v && v !== "all").length}
                </span>
              )}
            </Button>
            <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Добавить</span>
            </Button>
          </div>
        </div>

        {/* Компактные фильтры */}
        {showFilters && (
          <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-emerald-900 text-sm">Фильтры</h3>
              {hasActiveFilters && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={clearFilters}
                  className="!px-3 !py-1.5 !text-xs">
                  <X className="h-3 w-3 mr-1" />
                  Сбросить
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
                label="С даты"
                value={filters.dateFrom}
                onChange={(e) => setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))}
              />

              <Input
                type="date"
                label="По дату"
                value={filters.dateTo}
                onChange={(e) => setFilters((prev) => ({ ...prev, dateTo: e.target.value }))}
              />
            </div>
          </div>
        )}

        {/* Современный список транзакций */}
        {sortedTransactions.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {hasActiveFilters ? "Нет транзакций по фильтрам" : "Нет транзакций"}
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {hasActiveFilters
                ? "Попробуйте изменить параметры фильтрации для поиска транзакций"
                : "Добавьте первую транзакцию, чтобы начать отслеживать ваши финансы"}
            </p>
            {!hasActiveFilters && (
              <Button variant="primary" onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Добавить транзакцию
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Подсказка о кликабельности (только на мобильных) */}
            <div className="lg:hidden bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center space-x-2 text-sm text-emerald-700">
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Нажмите на транзакцию для просмотра деталей</span>
            </div>

            <div className="space-y-3">
              {sortedTransactions.map((transaction) => {
                const category = getCategoryById(transaction.categoryId)
                const isIncome = transaction.type === "income"

                return (
                  <div
                    key={transaction.id}
                    onClick={() => handleTransactionClick(transaction)}
                    className="group relative bg-white rounded-xl border border-gray-200 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-200 overflow-hidden cursor-pointer active:scale-[0.99]">
                    {/* Цветная левая граница-индикатор */}
                    <div
                      className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-200 group-hover:w-1.5 ${
                        isIncome ? "bg-emerald-500" : "bg-red-500"
                      }`}
                    />

                    <div className="p-4 pl-6">
                      {/* Единая responsive структура */}
                      <div className="flex items-center justify-between">
                        {/* Левая часть: иконка + инфо */}
                        <div className="flex items-center space-x-4 flex-1 min-w-0">
                          {/* Иконка транзакции */}
                          <div className="flex-shrink-0">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                isIncome
                                  ? "bg-emerald-100 text-emerald-600"
                                  : "bg-red-100 text-red-600"
                              }`}>
                              {isIncome ? (
                                <TrendingUp className="h-5 w-5" />
                              ) : (
                                <TrendingDown className="h-5 w-5" />
                              )}
                            </div>
                          </div>

                          {/* Информация о транзакции */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-semibold text-gray-900 truncate">
                                {transaction.description}
                              </h4>
                              {/* Маленький индикатор категории */}
                              <div
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: category?.color ?? "#6B7280" }}
                                title={category?.name ?? "Неизвестная категория"}
                              />
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <span className="truncate">
                                {category?.name ?? "Неизвестная категория"}
                              </span>
                              <span className="hidden sm:inline">•</span>
                              <span className="hidden sm:inline">
                                {formatDate(transaction.date)}
                              </span>
                            </div>
                            {/* Дата на мобильных */}
                            <div className="sm:hidden text-xs text-gray-400 mt-1">
                              {formatDate(transaction.date)}
                            </div>
                          </div>
                        </div>

                        {/* Правая часть: сумма + действия */}
                        <div className="flex items-center space-x-3 flex-shrink-0 ml-4">
                          {/* Сумма */}
                          <div className="text-right">
                            <div
                              className={`font-bold text-lg ${
                                isIncome ? "text-emerald-600" : "text-red-600"
                              }`}>
                              {formatAmountWithSign(transaction.amount, transaction.type)}
                            </div>
                          </div>

                          {/* Элегантный индикатор для всех устройств */}
                          <div className="flex items-center text-gray-300 group-hover:text-emerald-400 transition-colors duration-200">
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

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

      {/* Модальное окно деталей транзакции */}
      <Modal
        isOpen={!!selectedTransaction}
        onClose={handleCloseModals}
        title="Детали транзакции"
        size="md">
        {selectedTransaction && (
          <TransactionDetailsModal
            transaction={selectedTransaction}
            category={getCategoryById(selectedTransaction.categoryId)}
            onEdit={() => {
              setEditingTransaction(selectedTransaction)
              setSelectedTransaction(null)
            }}
            onDelete={() => {
              handleDeleteTransaction(selectedTransaction.id)
              setSelectedTransaction(null)
            }}
            onClose={handleCloseModals}
          />
        )}
      </Modal>
    </div>
  )
}
