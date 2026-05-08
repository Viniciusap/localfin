import { useState, useEffect, FormEvent } from 'react';
import type { Transaction, TransactionStatus } from '../types/Transaction';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface Props {
  month: string;
  onAdd: (tx: Omit<Transaction, 'id'>) => Promise<void>;
  onUpdate?: (id: string, data: Omit<Transaction, 'id'>) => Promise<void>;
  editTarget?: Transaction | null;
  onEditClose?: () => void;
  defaultStatus?: TransactionStatus;
}

const CATEGORIES = [
  'Alimentação', 'Transporte', 'Moradia', 'Saúde',
  'Lazer', 'Educação', 'Transferência', 'Outros',
];

export function TransactionForm({
  month, onAdd, onUpdate, editTarget, onEditClose, defaultStatus = 'confirmed',
}: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'outcome'>('outcome');
  const [status, setStatus] = useState<TransactionStatus>(defaultStatus);
  const [category, setCategory] = useState('Outros');
  const [date, setDate] = useState(`${month}-01`);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = editTarget != null;

  useEffect(() => {
    if (!editTarget) return;
    setTitle(editTarget.title);
    setAmount(String(editTarget.amount));
    setType(editTarget.type);
    setStatus(editTarget.status);
    setCategory(editTarget.category);
    setDate(editTarget.date);
    setError(null);
    setOpen(true);
  }, [editTarget]);

  function openModal() {
    setTitle(''); setAmount(''); setType('outcome');
    setStatus(defaultStatus); setCategory('Outros');
    setDate(`${month}-01`); setError(null);
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
    if (isEditing) onEditClose?.();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title || !amount || !date) return;
    setLoading(true); setError(null);
    const data: Omit<Transaction, 'id'> = {
      title,
      amount: Number(amount.replace(',', '.')),
      type,
      status,
      category,
      date,
    };
    try {
      if (isEditing) {
        await onUpdate!(editTarget.id, data);
      } else {
        await onAdd(data);
      }
      closeModal();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button onClick={openModal} className="mb-6">+ Nova Transação</Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 flex flex-col gap-4"
          >
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              {isEditing ? 'Editar Transação' : 'Nova Transação'}
            </h2>

            <Input label="Descrição" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Salário" required />
            <Input label="Valor (R$)" type="number" min="0.01" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0,00" required />

            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-1">Tipo</span>
              <div className="flex gap-2">
                {(['income', 'outcome'] as const).map(t => (
                  <button key={t} type="button" onClick={() => setType(t)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                      type === t
                        ? t === 'income'
                          ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 ring-2 ring-emerald-400'
                          : 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400 ring-2 ring-rose-400'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    {t === 'income' ? '↑ Entrada' : '↓ Saída'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-1">Situação</span>
              <div className="flex gap-2">
                {(['confirmed', 'pending'] as const).map(s => (
                  <button key={s} type="button" onClick={() => setStatus(s)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                      status === s
                        ? 'bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    {s === 'confirmed' ? '✓ Confirmada' : '◷ Prevista'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="category" className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Categoria</label>
              <select id="category" value={category} onChange={e => setCategory(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-500 transition"
              >
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            <Input label="Data" type="date" value={date} onChange={e => setDate(e.target.value)} required />

            {error && <p className="text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 rounded-lg px-3 py-2">{error}</p>}

            <div className="flex gap-2 justify-end pt-1">
              <Button type="button" variant="ghost" onClick={closeModal}>Cancelar</Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Salvando…' : isEditing ? 'Salvar alterações' : 'Salvar'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
