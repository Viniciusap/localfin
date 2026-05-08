import { Summary } from '../types/Transaction';
import { formatCurrency } from '../lib/format';
import { Card } from './ui/Card';

interface Props {
  summary: Summary;
}

export function SummaryCards({ summary }: Props) {
  const { income, outcome, balance, pendingIncome, pendingOutcome, projectedBalance } = summary;
  const hasPending = pendingIncome > 0 || pendingOutcome > 0;

  return (
    <div className="mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Entradas</p>
          <p className="text-2xl font-bold text-emerald-500">{formatCurrency(income)}</p>
          {pendingIncome > 0 && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">+ {formatCurrency(pendingIncome)} previsto</p>
          )}
        </Card>
        <Card>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Saídas</p>
          <p className="text-2xl font-bold text-rose-500">{formatCurrency(outcome)}</p>
          {pendingOutcome > 0 && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">+ {formatCurrency(pendingOutcome)} previsto</p>
          )}
        </Card>
        <Card>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Saldo</p>
          <p className={`text-2xl font-bold ${balance >= 0 ? 'text-slate-800 dark:text-slate-100' : 'text-rose-500'}`}>
            {formatCurrency(balance)}
          </p>
          {hasPending && (
            <p className={`text-xs mt-1 ${projectedBalance >= 0 ? 'text-slate-400 dark:text-slate-500' : 'text-rose-400'}`}>
              {formatCurrency(projectedBalance)} previsto
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
