import { useState, useMemo } from 'react';
import type { Transaction } from './types/Transaction';
import { useAccount } from './hooks/useAccount';
import { useMonthNav } from './hooks/useMonthNav';
import { useAccounts } from './hooks/useAccounts';
import { useDarkMode } from './hooks/useDarkMode';
import { useRecurring } from './hooks/useRecurring';
import { MonthHeader } from './components/MonthHeader';
import { SummaryCards } from './components/SummaryCards';
import { MonthCharts } from './components/MonthCharts';
import { TransferBalance } from './components/TransferBalance';
import { TransactionForm, DEFAULT_CATEGORIES } from './components/TransactionForm';
import { TransactionList } from './components/TransactionList';
import { MonthsOverview } from './components/MonthsOverview';
import { AccountsManager } from './components/AccountsManager';
import { RecurringPanel } from './components/RecurringPanel';
import { Button } from './components/ui/Button';

export default function App() {
  const { isDark, toggle: toggleDark } = useDarkMode();
  const { account, accounts, switchTo, create, rename, remove, refresh: refreshAccounts } = useAccount();
  const nav = useMonthNav();
  const {
    transactions, confirmed, pending,
    loading, error, summary,
    add, update: updateTx, remove: removeTx, setStatus, transferTo,
    refresh: refreshTransactions,
  } = useAccounts(account, nav.month);
  const { templates, create: createRecurring, apply: applyRecurring, remove: removeRecurring } = useRecurring(account);

  const [historyOpen, setHistoryOpen] = useState(false);
  const [managerOpen, setManagerOpen] = useState(false);
  const [recurringOpen, setRecurringOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const extraCategories = useMemo(
    () => [...new Set(transactions.map(t => t.category))],
    [transactions],
  );

  const allCategories = useMemo(
    () => [...new Set([...DEFAULT_CATEGORIES, ...extraCategories])].sort(),
    [extraCategories],
  );

  const appliedRecurringIds = useMemo(
    () => new Set(transactions.flatMap(t => t.recurringId ? [t.recurringId] : [])),
    [transactions],
  );

  if (!account) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <p className="text-slate-400 text-sm">Carregando contas…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <MonthHeader
          account={account}
          accounts={accounts}
          month={nav.month}
          isDark={isDark}
          onSwitchAccount={switchTo}
          onManageAccounts={() => setManagerOpen(true)}
          onPrev={nav.prev}
          onNext={nav.next}
          onOpenHistory={() => setHistoryOpen(true)}
          onToggleDark={toggleDark}
        />

        <SummaryCards summary={summary} />

        <div className="flex justify-end mb-6">
          <TransferBalance currentMonth={nav.month} balance={summary.balance} onTransfer={transferTo} />
        </div>

        <MonthCharts transactions={transactions} isDark={isDark} />

        <div className="flex items-center gap-3 mb-6">
          <TransactionForm
            month={nav.month}
            onAdd={add}
            onUpdate={updateTx}
            editTarget={editingTx}
            onEditClose={() => setEditingTx(null)}
            extraCategories={extraCategories}
          />
          <Button variant="ghost" onClick={() => setRecurringOpen(true)}>↻ Recorrentes</Button>
        </div>

        {error && (
          <p className="text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 rounded-xl px-4 py-3 mb-4">{error}</p>
        )}

        {loading ? (
          <p className="text-sm text-slate-400 py-8 text-center">Carregando…</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-slate-700 dark:bg-slate-300" />
                <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Confirmadas</h2>
                {confirmed.length > 0 && <span className="text-xs text-slate-400">({confirmed.length})</span>}
              </div>
              <TransactionList transactions={confirmed} onRemove={removeTx} onSetStatus={setStatus} onEdit={setEditingTx} variant="confirmed" />
            </section>

            <section>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 border border-dashed border-slate-400 dark:border-slate-500" />
                <h2 className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Previstas</h2>
                {pending.length > 0 && <span className="text-xs text-slate-300 dark:text-slate-600">({pending.length})</span>}
              </div>
              <TransactionList transactions={pending} onRemove={removeTx} onSetStatus={setStatus} onEdit={setEditingTx} variant="pending" />
            </section>
          </div>
        )}
      </div>

      {historyOpen && (
        <MonthsOverview
          account={account}
          currentMonth={nav.month}
          isDark={isDark}
          onJumpTo={nav.jumpTo}
          onClose={() => setHistoryOpen(false)}
        />
      )}

      {managerOpen && (
        <AccountsManager
          account={account}
          accounts={accounts}
          onSwitch={switchTo}
          onCreate={create}
          onRename={rename}
          onRemove={remove}
          onRestored={() => { void refreshTransactions(); void refreshAccounts(); }}
          onClose={() => setManagerOpen(false)}
        />
      )}

      {recurringOpen && (
        <RecurringPanel
          currentMonth={nav.month}
          templates={templates}
          appliedIds={appliedRecurringIds}
          suggestedCategories={allCategories}
          onCreate={createRecurring}
          onApply={applyRecurring}
          onRemove={removeRecurring}
          onApplied={() => void refreshTransactions()}
          onClose={() => setRecurringOpen(false)}
        />
      )}
    </div>
  );
}
