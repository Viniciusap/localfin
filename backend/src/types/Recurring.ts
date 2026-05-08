export interface RecurringTemplate {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'outcome';
  category: string;
  dayOfMonth: number;                       // 1–28 (safe for all months)
  defaultStatus: 'confirmed' | 'pending';
}
