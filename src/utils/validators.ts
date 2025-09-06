/**
 * Валидация суммы транзакции
 */
export const validateAmount = (value: string | number): string | undefined => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(numValue)) {
    return 'Введите корректную сумму';
  }

  if (numValue <= 0) {
    return 'Сумма должна быть больше 0';
  }

  if (numValue > 1000000) {
    return 'Сумма не может превышать 1,000,000';
  }

  return undefined;
};

/**
 * Валидация описания транзакции
 */
export const validateDescription = (value: string): string | undefined => {
  if (!value || value.trim().length === 0) {
    return 'Описание обязательно';
  }

  if (value.trim().length < 2) {
    return 'Описание должно содержать минимум 2 символа';
  }

  if (value.trim().length > 100) {
    return 'Описание не может превышать 100 символов';
  }

  return undefined;
};

/**
 * Валидация названия категории
 */
export const validateCategoryName = (value: string): string | undefined => {
  if (!value || value.trim().length === 0) {
    return 'Название категории обязательно';
  }

  if (value.trim().length < 2) {
    return 'Название должно содержать минимум 2 символа';
  }

  if (value.trim().length > 30) {
    return 'Название не может превышать 30 символов';
  }

  return undefined;
};

/**
 * Валидация даты
 */
export const validateDate = (value: string): string | undefined => {
  if (!value) {
    return 'Дата обязательна';
  }

  const date = new Date(value);
  const today = new Date();

  if (isNaN(date.getTime())) {
    return 'Введите корректную дату';
  }

  if (date > today) {
    return 'Дата не может быть в будущем';
  }

  return undefined;
};
