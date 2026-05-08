import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import type { BackupFile } from '../types/Account';

export function useBackups(account: string) {
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!account) return;
    setLoading(true);
    setError(null);
    try {
      setBackups(await api.backups.list(account));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [account]);

  useEffect(() => { void refresh(); }, [refresh]);

  async function create() {
    const b = await api.backups.create(account);
    setBackups(prev => [b, ...prev]);
  }

  async function restore(filename: string) {
    await api.backups.restore(account, filename);
    await refresh(); // lista atualiza (novo backup auto aparece)
  }

  async function remove(filename: string) {
    await api.backups.remove(account, filename);
    setBackups(prev => prev.filter(b => b.filename !== filename));
  }

  return { backups, loading, error, create, restore, remove, refresh };
}
