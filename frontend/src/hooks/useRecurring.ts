import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import type { RecurringTemplate } from '../types/Recurring';
import type { Transaction } from '../types/Transaction';

export function useRecurring(account: string) {
  const [templates, setTemplates] = useState<RecurringTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!account) return;
    setLoading(true);
    setError(null);
    try {
      setTemplates(await api.recurring.list(account));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [account]);

  useEffect(() => { void refresh(); }, [refresh]);

  async function create(data: Omit<RecurringTemplate, 'id'>) {
    const created = await api.recurring.create(account, data);
    setTemplates(prev => [...prev, created]);
    return created;
  }

  async function apply(id: string, month: string): Promise<Transaction> {
    return api.recurring.apply(account, id, month);
  }

  async function remove(id: string) {
    await api.recurring.remove(account, id);
    setTemplates(prev => prev.filter(t => t.id !== id));
  }

  return { templates, loading, error, create, apply, remove, refresh };
}
