import type { Transaction, TransactionStatus } from '../types/Transaction';
import { formatCurrency, formatDate } from '../lib/format';

interface Props {
  transactions: Transaction[];
  onRemove: (id: string) => Promise<void>;
  onSetStatus?: (id: string, status: TransactionStatus) => Promise<void>;
  onEdit?: (tx: Transaction) => void;
  variant?: 'confirmed' | 'pending';
}

export function TransactionList({ transactions, onRemove, onSetStatus, onEdit, variant = 'confirmed' }: Props) {
  const isPending = variant === 'pending';

  if (transactions.length === 0) {
    return (
      <div className={`text-center py-10 text-sm ${isPending ? 'text-slate-300 dark:text-slate-600' : 'text-slate-400 dark:text-slate-500'}`}>
        {isPending ? 'Nenhum lançamento previsto.' : 'Nenhuma transação confirmada.'}
      </div>
    );
  }

  const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="flex flex-col gap-2">
      {sorted.map(tx => (
        <div
          key={tx.id}
          className={`flex items-center justify-between px-4 py-3 rounded-2xl border transition-colors ${
            isPending
              ? 'bg-white dark:bg-slate-800/50 border-dashed border-slate-200 dark:border-slate-600 opacity-75'
              : tx.type === 'income'
                ? 'bg-emerald-50/60 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/30'
                : 'bg-rose-50/60 dark:bg-rose-900/10 border-rose-100 dark:border-rose-800/30'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-1 h-9 rounded-full flex-shrink-0 ${
              isPending ? 'bg-slate-300 dark:bg-slate-600'
                : tx.type === 'income' ? 'bg-emerald-400' : 'bg-rose-400'
            }`} />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{tx.title}</p>
                {tx.transferredFrom && (
                  <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full whitespace-nowrap">
                    transferido
                  </span>
                )}
                {tx.recurringId && (
                  <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full whitespace-nowrap">
                    ↻
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                {tx.category} · {formatDate(tx.date)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
            <span className={`text-sm font-semibold ${
              isPending ? 'text-slate-500 dark:text-slate-400'
                : tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}>
              {tx.type === 'income' ? '+' : '−'} {formatCurrency(tx.amount)}
            </span>

            {isPending && onSetStatus && (
              <button
                onClick={() => onSetStatus(tx.id, 'confirmed')}
                className="text-xs px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors whitespace-nowrap"
              >
                ✓ Confirmar
              </button>
            )}

            {!isPending && onSetStatus && (
              <button
                onClick={() => onSetStatus(tx.id, 'pending')}
                className="text-xs px-2 py-1 rounded-lg text-slate-300 dark:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                title="Mover para previsto"
              >
                ◷
              </button>
            )}

            {onEdit && !tx.transferredFrom && (
              <button
                onClick={() => onEdit(tx)}
                className="text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 transition-colors text-base leading-none px-1"
                aria-label="Editar"
                title="Editar"
              >
                ✎
              </button>
            )}

            <button
              onClick={() => onRemove(tx.id)}
              className="text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 transition-colors text-lg leading-none px-1"
              aria-label="Remover"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
