import { Router } from 'express';
import { randomUUID } from 'crypto';
import { readAll, writeAll } from '../db/jsonStore';
import type { Transaction, TransactionStatus } from '../types/Transaction';

const router = Router({ mergeParams: true });

type P = Record<string, string>;

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

function isValidMonth(m: string): boolean {
  return MONTH_RE.test(m);
}

// GET /api/accounts/:account/months/:month/transactions
router.get('/:month/transactions', (req, res) => {
  const { account, month } = req.params as P;
  if (!isValidMonth(month)) { res.status(400).json({ error: 'Invalid month format (expected YYYY-MM)' }); return; }
  try {
    res.json(readAll(account).filter(tx => tx.date.startsWith(month)));
  } catch (e) {
    res.status(404).json({ error: (e as Error).message });
  }
});

// POST /api/accounts/:account/months/:month/transactions
router.post('/:month/transactions', (req, res) => {
  const { account, month } = req.params as P;
  if (!isValidMonth(month)) { res.status(400).json({ error: 'Invalid month format (expected YYYY-MM)' }); return; }

  const { title, amount, type, status, category, date, transferredFrom } =
    req.body as Omit<Transaction, 'id'>;

  if (!title || amount == null || !type || !category || !date) {
    res.status(400).json({ error: 'Required fields: title, amount, type, category, date' });
    return;
  }
  const numAmount = Number(amount);
  if (!Number.isFinite(numAmount) || numAmount <= 0) {
    res.status(400).json({ error: 'amount must be a positive number' });
    return;
  }
  if (!date.startsWith(month)) {
    res.status(400).json({ error: 'Transaction date does not belong to the given month' });
    return;
  }

  const tx: Transaction = {
    id: randomUUID(),
    title,
    amount: numAmount,
    type,
    status: status === 'pending' ? 'pending' : 'confirmed',
    category,
    date,
    ...(transferredFrom ? { transferredFrom } : {}),
  };

  try {
    writeAll(account, [...readAll(account), tx]);
    res.status(201).json(tx);
  } catch (e) {
    res.status(404).json({ error: (e as Error).message });
  }
});

// PATCH /api/accounts/:account/months/:month/transactions/:id
router.patch('/:month/transactions/:id', (req, res) => {
  const { account, month, id } = req.params as P;
  if (!isValidMonth(month)) { res.status(400).json({ error: 'Invalid month format (expected YYYY-MM)' }); return; }

  const { title, amount, type, status, category, date } =
    req.body as Partial<Omit<Transaction, 'id' | 'transferredFrom'>>;

  if (amount !== undefined) {
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) {
      res.status(400).json({ error: 'amount must be a positive number' });
      return;
    }
  }
  if (date !== undefined && !date.startsWith(month)) {
    res.status(400).json({ error: 'Transaction date does not belong to the given month' });
    return;
  }

  try {
    const all = readAll(account);
    const idx = all.findIndex(tx => tx.id === id);
    if (idx === -1) { res.status(404).json({ error: 'Transaction not found' }); return; }

    const updated: Transaction = {
      ...all[idx],
      ...(title !== undefined && { title }),
      ...(amount !== undefined && { amount: Number(amount) }),
      ...(type !== undefined && { type }),
      ...(status !== undefined && { status }),
      ...(category !== undefined && { category }),
      ...(date !== undefined && { date }),
    };

    const next = [...all];
    next[idx] = updated;
    writeAll(account, next);
    res.json(updated);
  } catch (e) {
    res.status(404).json({ error: (e as Error).message });
  }
});

// PATCH /api/accounts/:account/months/:month/transactions/:id/status
router.patch('/:month/transactions/:id/status', (req, res) => {
  const { account, id } = req.params as P;
  const { status } = req.body as { status: TransactionStatus };

  if (status !== 'pending' && status !== 'confirmed') {
    res.status(400).json({ error: 'Invalid status — must be "confirmed" or "pending"' });
    return;
  }

  try {
    const all = readAll(account);
    const idx = all.findIndex(tx => tx.id === id);
    if (idx === -1) { res.status(404).json({ error: 'Transaction not found' }); return; }

    const next = [...all];
    next[idx] = { ...all[idx], status };
    writeAll(account, next);
    res.json(next[idx]);
  } catch (e) {
    res.status(404).json({ error: (e as Error).message });
  }
});

// DELETE /api/accounts/:account/months/:month/transactions/:id
router.delete('/:month/transactions/:id', (req, res) => {
  const { account, id } = req.params as P;
  try {
    const all = readAll(account);
    const filtered = all.filter(tx => tx.id !== id);
    if (filtered.length === all.length) { res.status(404).json({ error: 'Transaction not found' }); return; }
    writeAll(account, filtered);
    res.status(204).send();
  } catch (e) {
    res.status(404).json({ error: (e as Error).message });
  }
});

// GET /api/accounts/:account/months/:month/summary
router.get('/:month/summary', (req, res) => {
  const { account, month } = req.params as P;
  if (!isValidMonth(month)) { res.status(400).json({ error: 'Invalid month format (expected YYYY-MM)' }); return; }
  try {
    const txs = readAll(account).filter(tx => tx.date.startsWith(month));
    const sum = (s: TransactionStatus, t: 'income' | 'outcome') =>
      txs.filter(tx => tx.status === s && tx.type === t).reduce((a, tx) => a + tx.amount, 0);

    const income = sum('confirmed', 'income');
    const outcome = sum('confirmed', 'outcome');
    const pendingIncome = sum('pending', 'income');
    const pendingOutcome = sum('pending', 'outcome');

    res.json({
      income, outcome,
      balance: income - outcome,
      count: txs.filter(tx => tx.status === 'confirmed').length,
      pendingIncome, pendingOutcome,
      pendingBalance: pendingIncome - pendingOutcome,
      pendingCount: txs.filter(tx => tx.status === 'pending').length,
      projectedBalance: income + pendingIncome - outcome - pendingOutcome,
    });
  } catch (e) {
    res.status(404).json({ error: (e as Error).message });
  }
});

// POST /api/accounts/:account/months/:month/transfer-balance
router.post('/:month/transfer-balance', (req, res) => {
  const { account, month } = req.params as P;
  const { toMonth } = req.body as { toMonth: string };

  if (!isValidMonth(month)) { res.status(400).json({ error: 'Invalid month format (expected YYYY-MM)' }); return; }
  if (!toMonth) { res.status(400).json({ error: 'toMonth is required' }); return; }
  if (!isValidMonth(toMonth)) { res.status(400).json({ error: 'Invalid toMonth format (expected YYYY-MM)' }); return; }

  try {
    const all = readAll(account);

    if (all.some(tx => tx.transferredFrom === month && tx.date.startsWith(toMonth))) {
      res.status(409).json({ error: `Balance from ${month} has already been transferred to ${toMonth}` });
      return;
    }

    const confirmed = all.filter(tx => tx.date.startsWith(month) && tx.status === 'confirmed');
    const income = confirmed.filter(tx => tx.type === 'income').reduce((s, tx) => s + tx.amount, 0);
    const outcome = confirmed.filter(tx => tx.type === 'outcome').reduce((s, tx) => s + tx.amount, 0);
    const balance = income - outcome;

    if (balance <= 0) {
      res.status(400).json({ error: 'Confirmed balance is zero or negative — transfer not allowed' });
      return;
    }

    const [year, mon] = month.split('-');
    const tx: Transaction = {
      id: randomUUID(),
      title: `Saldo transferido de ${mon}/${year}`,
      amount: balance,
      type: 'income',
      status: 'confirmed',
      category: 'Transferência',
      date: `${toMonth}-01`,
      transferredFrom: month,
    };

    writeAll(account, [...all, tx]);
    res.status(201).json(tx);
  } catch (e) {
    res.status(404).json({ error: (e as Error).message });
  }
});

export default router;
