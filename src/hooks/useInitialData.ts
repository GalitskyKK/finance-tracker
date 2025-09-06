import { useEffect } from 'react';
import { useTransactionStore } from '@/store/transactionStore';
import { useCategoryStore } from '@/store/categoryStore';
import { mockTransactions } from '@/data/mockData';
import { STORAGE_KEYS } from '@/utils/constants';

/**
 * Хук для инициализации данных при первом запуске приложения
 */
export const useInitialData = () => {
  const { setTransactions, transactions } = useTransactionStore();
  const { setCategories, categories } = useCategoryStore();

  useEffect(() => {
    // Инициализация транзакций
    const savedTransactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!savedTransactions && transactions.length === 0) {
      setTransactions(mockTransactions);
    }

    // Инициализация категорий (уже есть дефолтные в store)
    const savedCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (!savedCategories) {
      setCategories(categories);
    }
  }, [setTransactions, setCategories, transactions.length, categories]);
};
