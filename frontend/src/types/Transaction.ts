// Mesmo tipo de backend/src/types/Transaction.ts — mantenha sincronizado
export type TransactionStatus = 'confirmed' | 'pending';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'outcome';
  status: TransactionStatus;
  category: string;
  date: string;
  transferredFrom?: string;
}

export interface Summary {
  income: number;
  outcome: number;
  balance: number;
  count: number;
  pendingIncome: number;
  pendingOutcome: number;
  pendingBalance: number;
  pendingCount: number;
  projectedBalance: number;
}
