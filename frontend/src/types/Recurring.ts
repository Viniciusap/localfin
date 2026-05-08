export interface RecurringTemplate {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'outcome';
  category: string;
  dayOfMonth: number;
  defaultStatus: 'confirmed' | 'pending';
}
