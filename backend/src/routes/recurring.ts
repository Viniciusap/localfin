import { Router } from 'express';
import { listRecurring, createRecurring, deleteRecurring, applyRecurring } from '../db/jsonStore';

const router = Router({ mergeParams: true });

type P = Record<string, string>;

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

// GET /api/accounts/:account/recurring
router.get('/', (req, res) => {
  const { account } = req.params as P;
  try {
    res.json(listRecurring(account));
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

// POST /api/accounts/:account/recurring
router.post('/', (req, res) => {
  const { account } = req.params as P;
  const { title, amount, type, category, dayOfMonth, defaultStatus } = req.body;

  if (!title || amount == null || !type || !category || dayOfMonth == null) {
    res.status(400).json({ error: 'Required fields: title, amount, type, category, dayOfMonth' });
    return;
  }
  const numAmount = Number(amount);
  if (!Number.isFinite(numAmount) || numAmount <= 0) {
    res.status(400).json({ error: 'amount must be a positive number' });
    return;
  }
  const day = Number(dayOfMonth);
  if (!Number.isInteger(day) || day < 1 || day > 28) {
    res.status(400).json({ error: 'dayOfMonth must be between 1 and 28' });
    return;
  }
  if (type !== 'income' && type !== 'outcome') {
    res.status(400).json({ error: 'type must be "income" or "outcome"' });
    return;
  }

  try {
    const template = createRecurring(account, {
      title, amount: numAmount, type, category, dayOfMonth: day,
      defaultStatus: defaultStatus === 'pending' ? 'pending' : 'confirmed',
    });
    res.status(201).json(template);
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

// POST /api/accounts/:account/recurring/:id/apply
router.post('/:id/apply', (req, res) => {
  const { account, id } = req.params as P;
  const { month } = req.body as { month?: string };

  if (!month || !MONTH_RE.test(month)) {
    res.status(400).json({ error: 'month is required (YYYY-MM)' });
    return;
  }

  try {
    const tx = applyRecurring(account, id, month);
    if (!tx) {
      res.status(409).json({ error: `Template already applied to ${month}` });
      return;
    }
    res.status(201).json(tx);
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

// DELETE /api/accounts/:account/recurring/:id
router.delete('/:id', (req, res) => {
  const { account, id } = req.params as P;
  try {
    deleteRecurring(account, id);
    res.status(204).send();
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

export default router;
