import type { Transaction, Summary } from '../types/Transaction';
import type { RecurringTemplate } from '../types/Recurring';
import type { BackupFile } from '../types/Account';
import {
  DEMO_ACCOUNTS,
  DEMO_TRANSACTIONS,
  DEMO_RECURRING,
  DEMO_BACKUPS,
} from './demoData';

// ── In-memory store (mutations persist for the session, reset on reload) ──────

let accountList: string[] = [...DEMO_ACCOUNTS];

const store: Record<string, Transaction[]> = Object.fromEntries(
  DEMO_ACCOUNTS.map(a => [a, DEMO_TRANSACTIONS[a].map(t => ({ ...t }))]),
);

const recurringStore: Record<string, RecurringTemplate[]> = Object.fromEntries(
  DEMO_ACCOUNTS.map(a => [a, (DEMO_RECURRING[a] ?? []).map(r => ({ ...r }))]),
);

const backupStore: Record<string, BackupFile[]> = Object.fromEntries(
  DEMO_ACCOUNTS.map(a => [a, (DEMO_BACKUPS[a] ?? []).map(b => ({ ...b }))]),
);

// ── Summary helper ────────────────────────────────────────────────────────────

function computeSummary(txs: Transaction[]): Summary {
  const confirmed = txs.filter(t => t.status === 'confirmed');
  const pending   = txs.filter(t => t.status === 'pending');

  const sum = (arr: Transaction[], type: 'income' | 'outcome') =>
    arr.filter(t => t.type === type).reduce((s, t) => s + t.amount, 0);

  const income  = sum(confirmed, 'income');
  const outcome = sum(confirmed, 'outcome');
  const balance = income - outcome;

  const pendingIncome  = sum(pending, 'income');
  const pendingOutcome = sum(pending, 'outcome');
  const pendingBalance = pendingIncome - pendingOutcome;

  return {
    income,
    outcome,
    balance,
    count: confirmed.length,
    pendingIncome,
    pendingOutcome,
    pendingBalance,
    pendingCount: pending.length,
    projectedBalance: balance + pendingBalance,
  };
}

// ── Fake delay (makes demo feel realistic) ────────────────────────────────────

const delay = () => new Promise<void>(res => setTimeout(res, 60));

// ── Demo API (matches the shape of the real api object) ──────────────────────

export const demoApi = {
  accounts: {
    list: async () => {
      await delay();
      return [...accountList];
    },
    create: async (name: string) => {
      await delay();
      if (accountList.includes(name)) throw new Error('Conta já existe');
      accountList.push(name);
      store[name]         = [];
      recurringStore[name] = [];
      backupStore[name]   = [];
      return { name };
    },
    rename: async (account: string, newName: string) => {
      await delay();
      if (!accountList.includes(account)) throw new Error('Conta não encontrada');
      if (accountList.includes(newName)) throw new Error('Nome já está em uso');
      accountList = accountList.map(a => (a === account ? newName : a));
      store[newName]         = store[account] ?? [];
      recurringStore[newName] = recurringStore[account] ?? [];
      backupStore[newName]   = backupStore[account] ?? [];
      delete store[account];
      delete recurringStore[account];
      delete backupStore[account];
      return { name: newName };
    },
    remove: async (account: string) => {
      await delay();
      accountList = accountList.filter(a => a !== account);
      delete store[account];
      delete recurringStore[account];
      delete backupStore[account];
    },
  },

  months: {
    list: async (account: string) => {
      await delay();
      const txs = store[account] ?? [];
      const months = [...new Set(txs.map(t => t.date.slice(0, 7)))].sort();
      return months;
    },
  },

  transactions: {
    list: async (account: string, month: string) => {
      await delay();
      return (store[account] ?? []).filter(t => t.date.startsWith(month));
    },

    create: async (account: string, _month: string, data: Omit<Transaction, 'id'>) => {
      await delay();
      const newTx: Transaction = { id: `demo-${Date.now()}`, ...data };
      store[account] = [...(store[account] ?? []), newTx];
      return newTx;
    },

    update: async (account: string, _month: string, id: string, data: Omit<Transaction, 'id'>) => {
      await delay();
      const updated: Transaction = { id, ...data };
      store[account] = (store[account] ?? []).map(t => (t.id === id ? updated : t));
      return updated;
    },

    setStatus: async (account: string, _month: string, id: string, status: 'confirmed' | 'pending') => {
      await delay();
      let found: Transaction | undefined;
      store[account] = (store[account] ?? []).map(t => {
        if (t.id !== id) return t;
        found = { ...t, status };
        return found;
      });
      if (!found) throw new Error('Transação não encontrada');
      return found;
    },

    remove: async (account: string, _month: string, id: string) => {
      await delay();
      store[account] = (store[account] ?? []).filter(t => t.id !== id);
    },

    summary: async (account: string, month: string) => {
      await delay();
      const txs = (store[account] ?? []).filter(t => t.date.startsWith(month));
      return computeSummary(txs);
    },

    transfer: async (account: string, month: string, toMonth: string) => {
      await delay();
      const already = (store[account] ?? []).some(t => t.transferredFrom === month);
      if (already) throw new Error('Saldo já transferido');

      const txs       = (store[account] ?? []).filter(t => t.date.startsWith(month));
      const { balance } = computeSummary(txs);

      const newTx: Transaction = {
        id: `transfer-${Date.now()}`,
        title: `Saldo ${month}`,
        amount: Math.abs(balance),
        type: balance >= 0 ? 'income' : 'outcome',
        status: 'confirmed',
        category: 'Finanças',
        date: `${toMonth}-01`,
        transferredFrom: month,
      };
      store[account] = [...(store[account] ?? []), newTx];
      return newTx;
    },
  },

  recurring: {
    list: async (account: string) => {
      await delay();
      return [...(recurringStore[account] ?? [])];
    },

    create: async (account: string, data: Omit<RecurringTemplate, 'id'>) => {
      await delay();
      const newTemplate: RecurringTemplate = { id: `r-demo-${Date.now()}`, ...data };
      recurringStore[account] = [...(recurringStore[account] ?? []), newTemplate];
      return newTemplate;
    },

    apply: async (account: string, id: string, month: string) => {
      await delay();
      const template = (recurringStore[account] ?? []).find(r => r.id === id);
      if (!template) throw new Error('Template não encontrado');

      const already = (store[account] ?? []).some(
        t => t.recurringId === id && t.date.startsWith(month),
      );
      if (already) throw new Error('Já aplicado neste mês');

      const day   = String(template.dayOfMonth).padStart(2, '0');
      const newTx: Transaction = {
        id: `r-applied-${id}-${month}-${Date.now()}`,
        title: template.title,
        amount: template.amount,
        type: template.type,
        status: template.defaultStatus,
        category: template.category,
        date: `${month}-${day}`,
        recurringId: id,
      };
      store[account] = [...(store[account] ?? []), newTx];
      return newTx;
    },

    remove: async (account: string, id: string) => {
      await delay();
      recurringStore[account] = (recurringStore[account] ?? []).filter(r => r.id !== id);
    },
  },

  backups: {
    list: async (account: string) => {
      await delay();
      return [...(backupStore[account] ?? [])];
    },

    create: async (account: string) => {
      await delay();
      const now = new Date();
      const ts  = now.toISOString().replace(/:/g, '-').replace(/\.\d{3}Z$/, '');
      const b: BackupFile = {
        filename: `${account}__${ts}.json`,
        createdAt: now.toISOString(),
        sizeBytes: JSON.stringify(store[account] ?? []).length,
        auto: false,
      };
      backupStore[account] = [b, ...(backupStore[account] ?? [])];
      return b;
    },

    restore: async (account: string, filename: string) => {
      await delay();
      const exists = (backupStore[account] ?? []).some(b => b.filename === filename);
      if (!exists) throw new Error('Backup não encontrado');
      // In demo mode restore is a no-op (no real file to restore from)
      return { message: 'Restaurado com sucesso' };
    },

    remove: async (account: string, filename: string) => {
      await delay();
      backupStore[account] = (backupStore[account] ?? []).filter(b => b.filename !== filename);
    },
  },
};
