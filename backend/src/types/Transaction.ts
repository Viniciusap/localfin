// Fonte única de verdade — mantenha sincronizado com frontend/src/types/Transaction.ts
export type TransactionStatus = 'confirmed' | 'pending';

export interface Transaction {
  id: string;
  title: string;
  amount: number;        // sempre positivo; sinal vem de `type`
  type: 'income' | 'outcome';
  status: TransactionStatus; // 'pending' = previsto, ainda não realizado
  category: string;
  date: string;          // ISO 8601 (YYYY-MM-DD); mês derivado via date.slice(0, 7)
  transferredFrom?: string; // YYYY-MM origem se for transação de transferência
  recurringId?: string;      // id do RecurringTemplate que gerou esta transação
}
