import React from 'react';
import { TransactionList } from '@/components/TransactionList';

const Transactions: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Транзакции</h1>
        <p className="text-gray-600">Управление вашими доходами и расходами</p>
      </div>

      <TransactionList />
    </div>
  );
};

export default Transactions;
