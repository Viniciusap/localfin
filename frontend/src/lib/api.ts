import { API_URL } from '../config/env';
import type { Transaction, Summary, TransactionStatus } from '../types/Transaction';
import type { BackupFile } from '../types/Account';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

const acc = (account: string) => `/api/accounts/${account}`;
const mo  = (account: string, month: string) => `${acc(account)}/months/${month}`;

export const api = {
  accounts: {
    list: ()                           => request<string[]>('/api/accounts'),
    create: (name: string)             => request<{ name: string }>('/api/accounts', { method: 'POST', body: JSON.stringify({ name }) }),
    rename: (account: string, newName: string) => request<{ name: string }>(`/api/accounts/${account}`, { method: 'PATCH', body: JSON.stringify({ newName }) }),
    remove: (account: string)          => request<void>(`/api/accounts/${account}`, { method: 'DELETE' }),
  },

  months: {
    list: (account: string) => request<string[]>(`${acc(account)}/months`),
  },

  transactions: {
    list:   (account: string, month: string) =>
      request<Transaction[]>(`${mo(account, month)}/transactions`),

    create: (account: string, month: string, tx: Omit<Transaction, 'id'>) =>
      request<Transaction>(`${mo(account, month)}/transactions`, { method: 'POST', body: JSON.stringify(tx) }),

    update: (account: string, month: string, id: string, data: Omit<Transaction, 'id'>) =>
      request<Transaction>(`${mo(account, month)}/transactions/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

    setStatus: (account: string, month: string, id: string, status: TransactionStatus) =>
      request<Transaction>(`${mo(account, month)}/transactions/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

    remove: (account: string, month: string, id: string) =>
      request<void>(`${mo(account, month)}/transactions/${id}`, { method: 'DELETE' }),

    summary: (account: string, month: string) =>
      request<Summary>(`${mo(account, month)}/summary`),

    transfer: (account: string, month: string, toMonth: string) =>
      request<Transaction>(`${mo(account, month)}/transfer-balance`, { method: 'POST', body: JSON.stringify({ toMonth }) }),
  },

  backups: {
    list:    (account: string)                       => request<BackupFile[]>(`${acc(account)}/backups`),
    create:  (account: string)                       => request<BackupFile>(`${acc(account)}/backups`, { method: 'POST' }),
    restore: (account: string, filename: string)     => request<{ message: string }>(`${acc(account)}/backups/${filename}/restore`, { method: 'POST' }),
    remove:  (account: string, filename: string)     => request<void>(`${acc(account)}/backups/${filename}`, { method: 'DELETE' }),
  },
};
