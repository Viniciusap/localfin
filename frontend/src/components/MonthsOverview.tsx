import { useEffect, useState } from 'react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { api } from '../lib/api';
import { formatMonthLabel, formatMonthShort } from '../lib/month';
import { formatCurrency } from '../lib/format';
import type { Summary } from '../types/Transaction';

interface Props {
  account: string;
  currentMonth: string;
  isDark: boolean;
  onJumpTo: (month: string) => void;
  onClose: () => void;
}

interface MonthRow { month: string; summary: Summary; }

export function MonthsOverview({ account, currentMonth, isDark, onJumpTo, onClose }: Props) {
  const [rows, setRows] = useState<MonthRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const months = await api.months.list(account);
        const settled = await Promise.all(
          months.map(async m => ({ month: m, summary: await api.transactions.summary(account, m) })),
        );
        setRows(settled);
      } finally { setLoading(false); }
    }
    void load();
  }, [account]);

  const sparkData = rows.map(r => ({ month: formatMonthShort(r.month), balance: r.summary.balance }));
  const tooltipStyle = isDark
    ? { backgroundColor: '#1e293b', border: '1px solid #334155', color: '#f1f5f9', fontSize: 12 }
    : { fontSize: 12 };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <aside className="w-full max-w-sm bg-white dark:bg-slate-800 shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Histórico</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors text-2xl leading-none">×</button>
        </div>

        {sparkData.length > 1 && (
          <div className="px-5 pt-4 pb-3 border-b border-slate-50 dark:border-slate-700">
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-2">Saldo mensal</p>
            <ResponsiveContainer width="100%" height={56}>
              <LineChart data={sparkData}>
                <Line type="monotone" dataKey="balance" stroke={isDark ? '#94a3b8' : '#1e293b'} strokeWidth={2} dot={false} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} labelFormatter={l => String(l)} contentStyle={tooltipStyle} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
          {loading && <p className="text-sm text-slate-400 text-center py-8">Carregando…</p>}
          {!loading && rows.length === 0 && <p className="text-sm text-slate-400 text-center py-8">Nenhum mês com dados.</p>}
          {rows.map(({ month, summary }) => (
            <button key={month} onClick={() => { onJumpTo(month); onClose(); }}
              className={`w-full text-left p-3 rounded-xl transition-colors ${
                month === currentMonth
                  ? 'bg-slate-100 dark:bg-slate-700 ring-2 ring-slate-300 dark:ring-slate-500'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
              }`}
            >
              <div className="flex justify-between items-center mb-0.5">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{formatMonthLabel(month)}</span>
                <span className={`text-sm font-bold ${summary.balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {formatCurrency(summary.balance)}
                </span>
              </div>
              <div className="flex gap-3">
                <span className="text-xs text-emerald-500">+{formatCurrency(summary.income)}</span>
                <span className="text-xs text-rose-500">−{formatCurrency(summary.outcome)}</span>
                <span className="text-xs text-slate-400 dark:text-slate-500">{summary.count} {summary.count === 1 ? 'transação' : 'transações'}</span>
              </div>
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}
