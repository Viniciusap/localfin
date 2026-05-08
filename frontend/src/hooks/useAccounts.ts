import { useState, useEffect, useMemo, useCallback } from 'react';
import { api } from '../lib/api';
import type { Transaction, Summary, TransactionStatus } from '../types/Transaction';

export function useAccounts(account: string, month: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTransactions = useCallback(async () => {
    if (!account) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.transactions.list(account, month);
      setTransactions(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [account, month]);

  useEffect(() => {
    void loadTransactions();
  }, [loadTransactions]);

  const confirmed = useMemo(
    () => transactions.filter(t => t.status === 'confirmed'),
    [transactions],
  );
  const pending = useMemo(
    () => transactions.filter(t => t.status === 'pending'),
    [transactions],
  );

  const summary = useMemo<Summary>(() => {
    const sum = (list: Transaction[], t: 'income' | 'outcome') =>
      list.filter(x => x.type === t).reduce((s, x) => s + x.amount, 0);

    const income = sum(confirmed, 'income');
    const outcome = sum(confirmed, 'outcome');
    const pendingIncome = sum(pending, 'income');
    const pendingOutcome = sum(pending, 'outcome');

    return {
      income, outcome,
      balance: income - outcome,
      count: confirmed.length,
      pendingIncome, pendingOutcome,
      pendingBalance: pendingIncome - pendingOutcome,
      pendingCount: pending.length,
      projectedBalance: income + pendingIncome - outcome - pendingOutcome,
    };
  }, [confirmed, pending]);

  async function add(tx: Omit<Transaction, 'id'>) {
    const created = await api.transactions.create(account, month, tx);
    setTransactions(prev => [...prev, created]);
  }

  async function update(id: string, data: Omit<Transaction, 'id'>) {
    const updated = await api.transactions.update(account, month, id, data);
    setTransactions(prev => prev.map(t => (t.id === id ? updated : t)));
  }

  async function remove(id: string) {
    await api.transactions.remove(account, month, id);
    setTransactions(prev => prev.filter(t => t.id !== id));
  }

  async function setStatus(id: string, status: TransactionStatus) {
    const updated = await api.transactions.setStatus(account, month, id, status);
    setTransactions(prev => prev.map(t => (t.id === id ? updated : t)));
  }

  async function transferTo(toMonth: string) {
    await api.transactions.transfer(account, month, toMonth);
    await loadTransactions();
  }

  return {
    transactions, confirmed, pending,
    loading, error, summary,
    add, update, remove, setStatus, transferTo,
    refresh: loadTransactions,
  };
}
