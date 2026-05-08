import { useState, FormEvent } from 'react';
import type { RecurringTemplate } from '../types/Recurring';
import type { Transaction } from '../types/Transaction';
import { formatCurrency } from '../lib/format';
import { CATEGORY_ICONS } from '../lib/categories';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Combobox } from './ui/Combobox';

interface Props {
  currentMonth: string;
  templates: RecurringTemplate[];
  appliedIds: Set<string>;
  suggestedCategories: string[];
  onCreate: (data: Omit<RecurringTemplate, 'id'>) => Promise<RecurringTemplate>;
  onApply: (id: string, month: string) => Promise<Transaction>;
  onRemove: (id: string) => Promise<void>;
  onApplied: () => void;
  onClose: () => void;
}

const TYPE_LABEL: Record<string, string> = { income: '↑ Entrada', outcome: '↓ Saída' };

export function RecurringPanel({
  currentMonth, templates, appliedIds, suggestedCategories,
  onCreate, onApply, onRemove, onApplied, onClose,
}: Props) {
  const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'outcome'>('outcome');
  const [category, setCategory] = useState('');
  const [dayOfMonth, setDayOfMonth] = useState('1');
  const [defaultStatus, setDefaultStatus] = useState<'confirmed' | 'pending'>('pending');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [applyError, setApplyError] = useState<string | null>(null);

  function resetForm() {
    setTitle(''); setAmount(''); setType('outcome');
    setCategory(''); setDayOfMonth('1');
    setDefaultStatus('pending'); setFormError(null);
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setSaving(true); setFormError(null);
    try {
      await onCreate({
        title,
        amount: Number(amount.replace(',', '.')),
        type,
        category,
        dayOfMonth: Number(dayOfMonth),
        defaultStatus,
      });
      resetForm();
      setFormOpen(false);
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleApply(id: string) {
    setApplyingId(id); setApplyError(null);
    try {
      await onApply(id, currentMonth);
      onApplied();
    } catch (err) {
      setApplyError((err as Error).message);
    } finally {
      setApplyingId(null);
    }
  }

  async function handleApplyAll() {
    setApplyError(null);
    const pending = templates.filter(t => !appliedIds.has(t.id));
    for (const t of pending) {
      try { await onApply(t.id, currentMonth); } catch { /* skip already-applied */ }
    }
    onApplied();
  }

  const [year, mon] = currentMonth.split('-');
  const monthLabel = `${mon}/${year}`;

  return (
    <div className="fixed inset-0 z-40 flex">
      <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div data-testid="recurring-panel" className="w-full max-w-sm bg-white dark:bg-slate-900 shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Recorrências</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Aplicar em {monthLabel}</p>
          </div>
          <button onClick={onClose} aria-label="Fechar" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-2xl leading-none px-1">×</button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">

          {/* Apply all */}
          {templates.length > 0 && templates.some(t => !appliedIds.has(t.id)) && (
            <Button variant="ghost" onClick={handleApplyAll} className="w-full text-sm">
              ↻ Aplicar todos ao mês de {monthLabel}
            </Button>
          )}

          {applyError && (
            <p className="text-xs text-rose-500 bg-rose-50 dark:bg-rose-900/20 rounded-lg px-3 py-2">{applyError}</p>
          )}

          {/* Template list */}
          {templates.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-8">
              Nenhuma recorrência configurada.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {templates.map(t => {
                const applied = appliedIds.has(t.id);
                return (
                  <div key={t.id} data-testid="recurring-template" className={`rounded-2xl border px-4 py-3 flex flex-col gap-2 transition-opacity ${applied ? 'opacity-50' : ''} ${
                    t.type === 'income'
                      ? 'bg-emerald-50/60 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/30'
                      : 'bg-rose-50/60 dark:bg-rose-900/10 border-rose-100 dark:border-rose-800/30'
                  }`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{t.title}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                          {t.category} · dia {t.dayOfMonth} · {t.defaultStatus === 'pending' ? 'Prevista' : 'Confirmada'}
                        </p>
                      </div>
                      <span className={`text-sm font-semibold flex-shrink-0 ${
                        t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {t.type === 'income' ? '+' : '−'} {formatCurrency(t.amount)}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApply(t.id)}
                        disabled={applied || applyingId === t.id}
                        className={`flex-1 text-xs py-1.5 rounded-lg font-medium transition-colors ${
                          applied
                            ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-default'
                            : 'bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-700 dark:hover:bg-white'
                        }`}
                      >
                        {applied ? '✓ Aplicado' : applyingId === t.id ? '…' : `Aplicar em ${monthLabel}`}
                      </button>
                      <button
                        onClick={() => onRemove(t.id)}
                        className="text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 transition-colors text-lg leading-none px-2"
                        aria-label="Excluir"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* New recurring form */}
          {formOpen ? (
            <form onSubmit={handleCreate} className="flex flex-col gap-3 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 mt-2">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Nova recorrência</h3>

              <Input label="Descrição" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Aluguel" required />
              <Input label="Valor (R$)" type="number" min="0.01" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0,00" required />

              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-1">Tipo</span>
                <div className="flex gap-2">
                  {(['income', 'outcome'] as const).map(t => (
                    <button key={t} type="button" onClick={() => setType(t)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-medium transition-all ${
                        type === t
                          ? t === 'income'
                            ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 ring-2 ring-emerald-400'
                            : 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400 ring-2 ring-rose-400'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {TYPE_LABEL[t]}
                    </button>
                  ))}
                </div>
              </div>

              <Combobox label="Categoria" value={category} onChange={setCategory} options={suggestedCategories} icons={CATEGORY_ICONS} placeholder="Selecione ou digite..." />

              <Input label="Dia do mês (1–28)" type="number" min="1" max="28" value={dayOfMonth} onChange={e => setDayOfMonth(e.target.value)} required />

              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-1">Situação ao aplicar</span>
                <div className="flex gap-2">
                  {(['pending', 'confirmed'] as const).map(s => (
                    <button key={s} type="button" onClick={() => setDefaultStatus(s)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-medium transition-all ${
                        defaultStatus === s
                          ? 'bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {s === 'confirmed' ? '✓ Confirmada' : '◷ Prevista'}
                    </button>
                  ))}
                </div>
              </div>

              {formError && <p className="text-xs text-rose-500 bg-rose-50 dark:bg-rose-900/20 rounded-lg px-3 py-2">{formError}</p>}

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="ghost" onClick={() => { resetForm(); setFormOpen(false); }}>Cancelar</Button>
                <Button type="submit" disabled={saving}>{saving ? 'Salvando…' : 'Criar'}</Button>
              </div>
            </form>
          ) : (
            <Button variant="ghost" onClick={() => setFormOpen(true)} className="w-full mt-2">
              + Nova recorrência
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
