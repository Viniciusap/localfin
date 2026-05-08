import { useState } from 'react';
import { nextMonth, formatMonthLabel } from '../lib/month';
import { formatCurrency } from '../lib/format';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface Props {
  currentMonth: string;
  balance: number;
  onTransfer: (toMonth: string) => Promise<void>;
}

export function TransferBalance({ currentMonth, balance, onTransfer }: Props) {
  const [open, setOpen] = useState(false);
  const [toMonth, setToMonth] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openModal() {
    setToMonth(nextMonth(currentMonth));
    setError(null);
    setOpen(true);
  }

  async function handleConfirm() {
    if (!toMonth) return;
    setLoading(true); setError(null);
    try {
      await onTransfer(toMonth);
      setOpen(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button variant="ghost" onClick={openModal} disabled={balance <= 0} title={balance <= 0 ? 'Saldo zero ou negativo' : undefined}>
        Transferir saldo →
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-1">Transferir saldo</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
              Transferir <span className="font-semibold text-slate-700 dark:text-slate-200">{formatCurrency(balance)}</span> como entrada em:
            </p>
            <div className="mb-2">
              <Input label="Mês destino" type="month" value={toMonth} onChange={e => setToMonth(e.target.value)} />
            </div>
            {toMonth && <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">→ {formatMonthLabel(toMonth)}</p>}
            {error && <p className="text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 rounded-lg px-3 py-2 mb-4">{error}</p>}
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={handleConfirm} disabled={loading || !toMonth}>{loading ? 'Transferindo…' : 'Confirmar'}</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
