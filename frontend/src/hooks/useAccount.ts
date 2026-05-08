import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

const STORAGE_KEY = 'contas:currentAccount';

function getInitialAccount(): string {
  return localStorage.getItem(STORAGE_KEY) ?? '';
}

export function useAccount() {
  const [account, setAccountState] = useState<string>(getInitialAccount);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const list = await api.accounts.list();
      setAccounts(list);
      setAccountState(prev => {
        const current = prev || localStorage.getItem(STORAGE_KEY) || '';
        const valid = list.includes(current) ? current : (list[0] ?? '');
        localStorage.setItem(STORAGE_KEY, valid);
        return valid;
      });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  function switchTo(name: string) {
    setAccountState(name);
    localStorage.setItem(STORAGE_KEY, name);
  }

  async function create(name: string) {
    await api.accounts.create(name);
    await refresh();
  }

  async function rename(from: string, newName: string) {
    await api.accounts.rename(from, newName);
    if (account === from) switchTo(newName);
    await refresh();
  }

  async function remove(name: string) {
    await api.accounts.remove(name);
    await refresh();
  }

  return { account, accounts, loading, error, switchTo, create, rename, remove, refresh };
}
