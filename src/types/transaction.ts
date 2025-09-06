export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  categoryId: string;
  description: string;
  date: string; // ISO string
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionData {
  amount: number;
  type: 'income' | 'expense';
  categoryId: string;
  description: string;
  date: string;
}

export interface UpdateTransactionData extends Partial<CreateTransactionData> {
  id: string;
}
