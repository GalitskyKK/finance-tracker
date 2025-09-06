// Цвета для категорий
export const CATEGORY_COLORS = [
  '#3B82F6', // blue-500
  '#10B981', // emerald-500
  '#F59E0B', // amber-500
  '#EF4444', // red-500
  '#8B5CF6', // violet-500
  '#06B6D4', // cyan-500
  '#84CC16', // lime-500
  '#F97316', // orange-500
  '#EC4899', // pink-500
  '#6B7280', // gray-500
];

// Иконки для категорий
export const CATEGORY_ICONS = [
  'shopping-cart',
  'home',
  'car',
  'utensils',
  'gamepad2',
  'shirt',
  'book',
  'heart',
  'briefcase',
  'graduation-cap',
  'plane',
  'music',
  'camera',
  'gift',
  'coffee',
  'smartphone',
  'laptop',
  'wifi',
  'fuel',
  'pills',
];

// Дефолтные категории доходов
export const DEFAULT_INCOME_CATEGORIES = [
  { name: 'Зарплата', color: '#10B981', icon: 'briefcase' },
  { name: 'Фриланс', color: '#3B82F6', icon: 'laptop' },
  { name: 'Инвестиции', color: '#8B5CF6', icon: 'trending-up' },
  { name: 'Подарки', color: '#EC4899', icon: 'gift' },
  { name: 'Прочее', color: '#6B7280', icon: 'more-horizontal' },
];

// Дефолтные категории расходов
export const DEFAULT_EXPENSE_CATEGORIES = [
  { name: 'Продукты', color: '#10B981', icon: 'shopping-cart' },
  { name: 'Транспорт', color: '#3B82F6', icon: 'car' },
  { name: 'Развлечения', color: '#F59E0B', icon: 'gamepad2' },
  { name: 'Одежда', color: '#EC4899', icon: 'shirt' },
  { name: 'Здоровье', color: '#EF4444', icon: 'heart' },
  { name: 'Образование', color: '#8B5CF6', icon: 'book' },
  { name: 'Жилье', color: '#06B6D4', icon: 'home' },
  { name: 'Прочее', color: '#6B7280', icon: 'more-horizontal' },
];

// Ключи для localStorage
export const STORAGE_KEYS = {
  TRANSACTIONS: 'finance-tracker-transactions',
  CATEGORIES: 'finance-tracker-categories',
  BUDGETS: 'finance-tracker-budgets',
} as const;
