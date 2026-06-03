import { Router } from 'express';
import { listBackups, createBackup, deleteBackup, restoreBackup, getBackupFilePath } from '../db/jsonStore';

const router = Router({ mergeParams: true });

type P = Record<string, string>;

// GET /api/accounts/:account/backups
router.get('/', (req, res) => {
  const { account } = req.params as P;
  try {
    res.json(listBackups(account));
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

// POST /api/accounts/:account/backups
router.post('/', (req, res) => {
  const { account } = req.params as P;
  try {
    res.status(201).json(createBackup(account));
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

// GET /api/accounts/:account/backups/:filename/download
router.get('/:filename/download', (req, res) => {
  const { account, filename } = req.params as P;
  try {
    const filePath = getBackupFilePath(account, filename);
    res.download(filePath, filename);
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

// POST /api/accounts/:account/backups/:filename/restore
router.post('/:filename/restore', (req, res) => {
  const { account, filename } = req.params as P;
  try {
    restoreBackup(account, filename);
    res.json({ message: 'Restaurado com sucesso' });
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

// DELETE /api/accounts/:account/backups/:filename
router.delete('/:filename', (req, res) => {
  const { account, filename } = req.params as P;
  try {
    deleteBackup(account, filename);
    res.status(204).send();
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
});

export default router;
