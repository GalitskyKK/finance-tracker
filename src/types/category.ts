export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  type: 'income' | 'expense';
  isDefault: boolean;
}

export interface CreateCategoryData {
  name: string;
  color: string;
  icon: string;
  type: 'income' | 'expense';
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {
  id: string;
}
