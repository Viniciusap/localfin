import { Router } from 'express';
import {
  listAccounts, createAccount, renameAccount, deleteAccount, readAll,
} from '../db/jsonStore';
import transactionsRouter from './transactions';
import backupsRouter from './backups';
import recurringRouter from './recurring';

const router = Router();

// ── Rotas diretas em /api/accounts — registradas ANTES do use('/:account') ──

// GET /api/accounts
router.get('/', (_req, res) => {
  try {
    res.json(listAccounts());
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

// POST /api/accounts
router.post('/', (req, res) => {
  try {
    const { name } = req.body as { name?: string };
    if (!name) { res.status(400).json({ error: 'name is required' }); return; }
    createAccount(name);
    res.status(201).json({ name });
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

// PATCH /api/accounts/:account
router.patch('/:account', (req, res) => {
  try {
    const { account } = req.params;
    const { newName } = req.body as { newName?: string };
    if (!newName) { res.status(400).json({ error: 'newName is required' }); return; }
    renameAccount(account, newName);
    res.json({ name: newName });
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

// DELETE /api/accounts/:account
router.delete('/:account', (req, res) => {
  try {
    deleteAccount(req.params.account);
    res.status(204).send();
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

// ── Sub-router escopado por :account — montado POR ÚLTIMO ────────────────────

const accountScoped = Router({ mergeParams: true });

// GET /api/accounts/:account/months
accountScoped.get('/months', (req, res) => {
  try {
    const { account } = req.params as Record<string, string>;
    const all = readAll(account);
    const months = [...new Set(all.map(tx => tx.date.slice(0, 7)))].sort();
    res.json(months);
  } catch (e) {
    res.status(404).json({ error: (e as Error).message });
  }
});

accountScoped.use('/months', transactionsRouter);
accountScoped.use('/backups', backupsRouter);
accountScoped.use('/recurring', recurringRouter);

router.use('/:account', accountScoped);

export default router;
