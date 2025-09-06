export type { Transaction, CreateTransactionData, UpdateTransactionData } from './transaction';
export type { Category, CreateCategoryData, UpdateCategoryData } from './category';
export type { Budget, CreateBudgetData, UpdateBudgetData } from './budget';

// Общие типы для UI
export interface SelectOption {
  value: string;
  label: string;
  color?: string;
  icon?: string;
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface FilterOptions {
  type?: 'income' | 'expense' | 'all';
  categoryId?: string;
  dateFrom?: string;
  dateTo?: string;
}
