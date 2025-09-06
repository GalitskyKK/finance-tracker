import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

/**
 * Форматирует число в валюту
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Форматирует дату в читаемый формат
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, 'dd.MM.yyyy', { locale: ru });
  } catch {
    return dateString;
  }
};

/**
 * Форматирует дату и время
 */
export const formatDateTime = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, 'dd.MM.yyyy HH:mm', { locale: ru });
  } catch {
    return dateString;
  }
};

/**
 * Форматирует дату для input[type="date"]
 */
export const formatDateForInput = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    return format(date, 'yyyy-MM-dd');
  } catch {
    return dateString;
  }
};

/**
 * Форматирует сумму с знаком + или -
 */
export const formatAmountWithSign = (amount: number, type: 'income' | 'expense'): string => {
  const sign = type === 'income' ? '+' : '-';
  return `${sign}${formatCurrency(Math.abs(amount))}`;
};
