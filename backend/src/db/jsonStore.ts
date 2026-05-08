import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { DB_DIR, BACKUP_DIR } from '../config';
import type { Transaction } from '../types/Transaction';
import type { BackupFile } from '../types/Account';
import type { RecurringTemplate } from '../types/Recurring';

const ACCOUNT_NAME_RE = /^[a-zA-Z0-9_-]{1,50}$/;

function isValidAccountName(name: string): boolean {
  return ACCOUNT_NAME_RE.test(name);
}

function accountPath(account: string): string {
  if (!isValidAccountName(account)) throw new Error(`Invalid account name: "${account}"`);
  return path.resolve(path.join(DB_DIR, `${account}.json`));
}

function recurringPath(account: string): string {
  if (!isValidAccountName(account)) throw new Error(`Invalid account name: "${account}"`);
  return path.resolve(path.join(DB_DIR, `${account}.recurring.json`));
}

// ── Bootstrap ────────────────────────────────────────────────────────────────

export function bootstrap(): void {
  fs.mkdirSync(path.resolve(DB_DIR), { recursive: true });
  fs.mkdirSync(path.resolve(BACKUP_DIR), { recursive: true });

  const legacyFile = path.resolve('data.json');
  const defaultAccount = path.resolve(path.join(DB_DIR, 'default.json'));
  const existing = listAccounts();

  if (existing.length === 0) {
    if (fs.existsSync(legacyFile)) {
      fs.copyFileSync(legacyFile, defaultAccount);
      fs.renameSync(legacyFile, legacyFile + '.migrated');
      console.log('Migrated data.json → DBs/default.json');
    } else {
      fs.writeFileSync(defaultAccount, '[]', 'utf-8');
      console.log('Created DBs/default.json');
    }
  }
}

// ── Contas ───────────────────────────────────────────────────────────────────

export function listAccounts(): string[] {
  const dir = path.resolve(DB_DIR);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter(f => f.endsWith('.json') && !f.startsWith('.'))
    .map(f => f.slice(0, -5))
    .filter(isValidAccountName)
    .sort();
}

export function createAccount(name: string): void {
  const p = accountPath(name);
  if (fs.existsSync(p)) throw new Error(`Account "${name}" already exists`);
  fs.writeFileSync(p, '[]', 'utf-8');
}

export function renameAccount(from: string, to: string): void {
  const fromPath = accountPath(from);
  const toPath = accountPath(to);
  if (!fs.existsSync(fromPath)) throw new Error(`Account "${from}" not found`);
  if (fs.existsSync(toPath)) throw new Error(`Account "${to}" already exists`);
  fs.renameSync(fromPath, toPath);
  const fromRecurring = recurringPath(from);
  if (fs.existsSync(fromRecurring)) fs.renameSync(fromRecurring, recurringPath(to));
}

export function deleteAccount(name: string): void {
  const p = accountPath(name);
  if (!fs.existsSync(p)) throw new Error(`Account "${name}" not found`);
  fs.unlinkSync(p);
  const rp = recurringPath(name);
  if (fs.existsSync(rp)) fs.unlinkSync(rp);
  for (const b of listBackups(name)) {
    const bp = path.resolve(path.join(BACKUP_DIR, b.filename));
    if (fs.existsSync(bp)) fs.unlinkSync(bp);
  }
}

// ── Transações ───────────────────────────────────────────────────────────────

function withStatus(tx: Transaction): Transaction {
  return tx.status ? tx : { ...tx, status: 'confirmed' };
}

export function readAll(account: string): Transaction[] {
  const p = accountPath(account);
  if (!fs.existsSync(p)) throw new Error(`Account "${account}" not found`);
  return (JSON.parse(fs.readFileSync(p, 'utf-8')) as Transaction[]).map(withStatus);
}

export function writeAll(account: string, data: Transaction[]): void {
  const p = accountPath(account);
  const tmp = p + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tmp, p);
}

// ── Backups ───────────────────────────────────────────────────────────────────

function makeTimestamp(): string {
  return new Date().toISOString().replace(/:/g, '-').slice(0, 19);
}

function parseTimestamp(raw: string): string {
  return raw.replace(/T(\d{2})-(\d{2})-(\d{2})$/, 'T$1:$2:$3');
}

export function listBackups(account: string): BackupFile[] {
  if (!isValidAccountName(account)) throw new Error(`Invalid account name: "${account}"`);
  const dir = path.resolve(BACKUP_DIR);
  if (!fs.existsSync(dir)) return [];

  const prefix = `${account}__`;
  return fs
    .readdirSync(dir)
    .filter(f => f.startsWith(prefix) && f.endsWith('.json'))
    .map(f => {
      const stat = fs.statSync(path.join(dir, f));
      const isAuto = f.includes('.auto.');
      const inner = f
        .slice(prefix.length)
        .replace('.auto.json', '')
        .replace('.json', '');
      return {
        filename: f,
        createdAt: parseTimestamp(inner),
        sizeBytes: stat.size,
        auto: isAuto,
      };
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function createBackup(account: string, auto = false): BackupFile {
  const src = accountPath(account);
  if (!fs.existsSync(src)) throw new Error(`Account "${account}" not found`);

  const ts = makeTimestamp();
  const suffix = auto ? '.auto.json' : '.json';
  const filename = `${account}__${ts}${suffix}`;
  const dest = path.resolve(path.join(BACKUP_DIR, filename));

  fs.copyFileSync(src, dest);
  const stat = fs.statSync(dest);
  return { filename, createdAt: parseTimestamp(ts), sizeBytes: stat.size, auto };
}

export function deleteBackup(account: string, filename: string): void {
  if (!isValidAccountName(account)) throw new Error(`Invalid account name`);
  const basename = path.basename(filename);
  if (!basename.startsWith(`${account}__`) || !basename.endsWith('.json')) {
    throw new Error('Backup does not belong to this account');
  }
  const p = path.resolve(path.join(BACKUP_DIR, basename));
  if (!fs.existsSync(p)) throw new Error('Backup not found');
  fs.unlinkSync(p);
}

export function restoreBackup(account: string, filename: string): void {
  if (!isValidAccountName(account)) throw new Error(`Invalid account name`);
  const basename = path.basename(filename);
  if (!basename.startsWith(`${account}__`) || !basename.endsWith('.json')) {
    throw new Error('Backup does not belong to this account');
  }
  const backupSrc = path.resolve(path.join(BACKUP_DIR, basename));
  if (!fs.existsSync(backupSrc)) throw new Error('Backup not found');

  createBackup(account, true);
  fs.copyFileSync(backupSrc, accountPath(account));
}

// ── Recorrências ──────────────────────────────────────────────────────────────

function readRecurring(account: string): RecurringTemplate[] {
  const p = recurringPath(account);
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, 'utf-8')) as RecurringTemplate[];
}

function writeRecurring(account: string, data: RecurringTemplate[]): void {
  const p = recurringPath(account);
  const tmp = p + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tmp, p);
}

export function listRecurring(account: string): RecurringTemplate[] {
  if (!isValidAccountName(account)) throw new Error(`Invalid account name: "${account}"`);
  return readRecurring(account);
}

export function createRecurring(account: string, data: Omit<RecurringTemplate, 'id'>): RecurringTemplate {
  if (!isValidAccountName(account)) throw new Error(`Invalid account name: "${account}"`);
  const template: RecurringTemplate = { id: randomUUID(), ...data };
  writeRecurring(account, [...readRecurring(account), template]);
  return template;
}

export function deleteRecurring(account: string, id: string): void {
  if (!isValidAccountName(account)) throw new Error(`Invalid account name: "${account}"`);
  const all = readRecurring(account);
  const filtered = all.filter(t => t.id !== id);
  if (filtered.length === all.length) throw new Error('Recurring template not found');
  writeRecurring(account, filtered);
}

export function applyRecurring(account: string, templateId: string, month: string): Transaction | null {
  const templates = readRecurring(account);
  const template = templates.find(t => t.id === templateId);
  if (!template) throw new Error('Recurring template not found');

  const all = readAll(account);
  if (all.some(tx => tx.recurringId === templateId && tx.date.startsWith(month))) {
    return null; // already applied — idempotent
  }

  const day = String(Math.min(template.dayOfMonth, 28)).padStart(2, '0');
  const tx: Transaction = {
    id: randomUUID(),
    title: template.title,
    amount: template.amount,
    type: template.type,
    status: template.defaultStatus,
    category: template.category,
    date: `${month}-${day}`,
    recurringId: template.id,
  };

  writeAll(account, [...all, tx]);
  return tx;
}
