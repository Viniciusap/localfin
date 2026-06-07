import type { Transaction } from '../types/Transaction';
import type { RecurringTemplate } from '../types/Recurring';
import type { BackupFile } from '../types/Account';

// ── Recurring templates ───────────────────────────────────────────────────────

export const DEMO_RECURRING: Record<string, RecurringTemplate[]> = {
  Pessoal: [
    { id: 'r-001', title: 'Aluguel',  amount: 1500, type: 'outcome', category: 'Casa',           dayOfMonth: 10, defaultStatus: 'confirmed' },
    { id: 'r-002', title: 'Internet', amount: 120,  type: 'outcome', category: 'Tecnologia',     dayOfMonth: 22, defaultStatus: 'confirmed' },
    { id: 'r-003', title: 'Netflix',  amount: 55,   type: 'outcome', category: 'Entretenimento', dayOfMonth: 25, defaultStatus: 'confirmed' },
    { id: 'r-004', title: 'Spotify',  amount: 22,   type: 'outcome', category: 'Entretenimento', dayOfMonth: 25, defaultStatus: 'confirmed' },
    { id: 'r-005', title: 'Academia', amount: 110,  type: 'outcome', category: 'Saúde',          dayOfMonth: 28, defaultStatus: 'confirmed' },
    { id: 'r-006', title: 'Salário',  amount: 5200, type: 'income',  category: 'Trabalho',       dayOfMonth: 5,  defaultStatus: 'confirmed' },
  ],
  Poupança: [
    { id: 'r-007', title: 'Depósito mensal', amount: 500, type: 'income', category: 'Finanças', dayOfMonth: 5, defaultStatus: 'confirmed' },
  ],
};

// ── Backups ───────────────────────────────────────────────────────────────────

export const DEMO_BACKUPS: Record<string, BackupFile[]> = {
  Pessoal: [
    { filename: 'Pessoal__2026-05-01T10-00-00.auto.json', createdAt: '2026-05-01T10:00:00.000Z', sizeBytes: 12480, auto: true  },
    { filename: 'Pessoal__2026-06-01T08-30-00.json',      createdAt: '2026-06-01T08:30:00.000Z', sizeBytes: 14920, auto: false },
  ],
  Poupança: [
    { filename: 'Poupanca__2026-06-01T08-30-00.json', createdAt: '2026-06-01T08:30:00.000Z', sizeBytes: 3240, auto: false },
  ],
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function tx(
  id: string,
  title: string,
  amount: number,
  type: 'income' | 'outcome',
  status: 'confirmed' | 'pending',
  category: string,
  date: string,
  extra?: Partial<Transaction>,
): Transaction {
  return { id, title, amount, type, status, category, date, ...extra };
}

// ── Transactions ──────────────────────────────────────────────────────────────

const pessoal: Transaction[] = [

  // ── Janeiro 2026 ─────────────────────────────────────────────────────────
  tx('p-001', 'Salário',     5200, 'income',  'confirmed', 'Trabalho',       '2026-01-05'),
  tx('p-002', 'Aluguel',     1500, 'outcome', 'confirmed', 'Casa',           '2026-01-10', { recurringId: 'r-001' }),
  tx('p-003', 'Mercado',      620, 'outcome', 'confirmed', 'Alimentação',    '2026-01-14'),
  tx('p-004', 'Combustível',  280, 'outcome', 'confirmed', 'Transporte',     '2026-01-18'),
  tx('p-005', 'Restaurante',  340, 'outcome', 'confirmed', 'Alimentação',    '2026-01-20'),
  tx('p-006', 'Internet',     120, 'outcome', 'confirmed', 'Tecnologia',     '2026-01-22', { recurringId: 'r-002' }),
  tx('p-007', 'Netflix',       55, 'outcome', 'confirmed', 'Entretenimento', '2026-01-25', { recurringId: 'r-003' }),
  tx('p-008', 'Spotify',       22, 'outcome', 'confirmed', 'Entretenimento', '2026-01-25', { recurringId: 'r-004' }),
  tx('p-009', 'Academia',     110, 'outcome', 'confirmed', 'Saúde',          '2026-01-28', { recurringId: 'r-005' }),
  tx('p-010', 'Farmácia',      89, 'outcome', 'confirmed', 'Saúde',          '2026-01-29'),

  // ── Fevereiro 2026 ────────────────────────────────────────────────────────
  tx('p-011', 'Salário',     5200, 'income',  'confirmed', 'Trabalho',       '2026-02-05'),
  tx('p-012', 'Freelance',    800, 'income',  'confirmed', 'Trabalho',       '2026-02-15'),
  tx('p-013', 'Aluguel',     1500, 'outcome', 'confirmed', 'Casa',           '2026-02-10', { recurringId: 'r-001' }),
  tx('p-014', 'Mercado',      540, 'outcome', 'confirmed', 'Alimentação',    '2026-02-12'),
  tx('p-015', 'Combustível',  260, 'outcome', 'confirmed', 'Transporte',     '2026-02-15'),
  tx('p-016', 'Jantar especial', 420, 'outcome', 'confirmed', 'Restaurante', '2026-02-14'),
  tx('p-017', 'Internet',     120, 'outcome', 'confirmed', 'Tecnologia',     '2026-02-22', { recurringId: 'r-002' }),
  tx('p-018', 'Netflix',       55, 'outcome', 'confirmed', 'Entretenimento', '2026-02-25', { recurringId: 'r-003' }),
  tx('p-019', 'Spotify',       22, 'outcome', 'confirmed', 'Entretenimento', '2026-02-25', { recurringId: 'r-004' }),
  tx('p-020', 'Academia',     110, 'outcome', 'confirmed', 'Saúde',          '2026-02-28', { recurringId: 'r-005' }),
  tx('p-021', 'Vestuário',    230, 'outcome', 'confirmed', 'Vestuário',      '2026-02-20'),

  // ── Março 2026 ────────────────────────────────────────────────────────────
  tx('p-022', 'Salário',     5200, 'income',  'confirmed', 'Trabalho',       '2026-03-05'),
  tx('p-023', 'Aluguel',     1500, 'outcome', 'confirmed', 'Casa',           '2026-03-10', { recurringId: 'r-001' }),
  tx('p-024', 'IPVA',         680, 'outcome', 'confirmed', 'Finanças',       '2026-03-15'),
  tx('p-025', 'Mercado',      590, 'outcome', 'confirmed', 'Alimentação',    '2026-03-14'),
  tx('p-026', 'Combustível',  290, 'outcome', 'confirmed', 'Transporte',     '2026-03-18'),
  tx('p-027', 'Restaurante',  280, 'outcome', 'confirmed', 'Alimentação',    '2026-03-22'),
  tx('p-028', 'Internet',     120, 'outcome', 'confirmed', 'Tecnologia',     '2026-03-22', { recurringId: 'r-002' }),
  tx('p-029', 'Netflix',       55, 'outcome', 'confirmed', 'Entretenimento', '2026-03-25', { recurringId: 'r-003' }),
  tx('p-030', 'Spotify',       22, 'outcome', 'confirmed', 'Entretenimento', '2026-03-25', { recurringId: 'r-004' }),
  tx('p-031', 'Academia',     110, 'outcome', 'confirmed', 'Saúde',          '2026-03-28', { recurringId: 'r-005' }),
  tx('p-032', 'Curso online', 299, 'outcome', 'confirmed', 'Educação',       '2026-03-20'),
  tx('p-033', 'Farmácia',     120, 'outcome', 'confirmed', 'Saúde',          '2026-03-29'),

  // ── Abril 2026 ────────────────────────────────────────────────────────────
  tx('p-034', 'Salário',     5200, 'income',  'confirmed', 'Trabalho',       '2026-04-05'),
  tx('p-035', 'Freelance',   1200, 'income',  'confirmed', 'Trabalho',       '2026-04-20'),
  tx('p-036', 'Aluguel',     1500, 'outcome', 'confirmed', 'Casa',           '2026-04-10', { recurringId: 'r-001' }),
  tx('p-037', 'Mercado',      660, 'outcome', 'confirmed', 'Alimentação',    '2026-04-14'),
  tx('p-038', 'Viagem Tiradentes', 850, 'outcome', 'confirmed', 'Viagem',    '2026-04-21'),
  tx('p-039', 'Combustível',  310, 'outcome', 'confirmed', 'Transporte',     '2026-04-18'),
  tx('p-040', 'Restaurante',  380, 'outcome', 'confirmed', 'Alimentação',    '2026-04-22'),
  tx('p-041', 'Internet',     120, 'outcome', 'confirmed', 'Tecnologia',     '2026-04-22', { recurringId: 'r-002' }),
  tx('p-042', 'Netflix',       55, 'outcome', 'confirmed', 'Entretenimento', '2026-04-25', { recurringId: 'r-003' }),
  tx('p-043', 'Spotify',       22, 'outcome', 'confirmed', 'Entretenimento', '2026-04-25', { recurringId: 'r-004' }),
  tx('p-044', 'Academia',     110, 'outcome', 'confirmed', 'Saúde',          '2026-04-28', { recurringId: 'r-005' }),

  // ── Maio 2026 ─────────────────────────────────────────────────────────────
  tx('p-045', 'Salário',     5200, 'income',  'confirmed', 'Trabalho',       '2026-05-05'),
  tx('p-046', 'Aluguel',     1500, 'outcome', 'confirmed', 'Casa',           '2026-05-10', { recurringId: 'r-001' }),
  tx('p-047', 'Mercado',      580, 'outcome', 'confirmed', 'Alimentação',    '2026-05-14'),
  tx('p-048', 'Notebook',    3200, 'outcome', 'confirmed', 'Tecnologia',     '2026-05-15'),
  tx('p-049', 'Combustível',  275, 'outcome', 'confirmed', 'Transporte',     '2026-05-18'),
  tx('p-050', 'Restaurante',  310, 'outcome', 'confirmed', 'Alimentação',    '2026-05-20'),
  tx('p-051', 'Internet',     120, 'outcome', 'confirmed', 'Tecnologia',     '2026-05-22', { recurringId: 'r-002' }),
  tx('p-052', 'Netflix',       55, 'outcome', 'confirmed', 'Entretenimento', '2026-05-25', { recurringId: 'r-003' }),
  tx('p-053', 'Spotify',       22, 'outcome', 'confirmed', 'Entretenimento', '2026-05-25', { recurringId: 'r-004' }),
  tx('p-054', 'Academia',     110, 'outcome', 'confirmed', 'Saúde',          '2026-05-28', { recurringId: 'r-005' }),
  tx('p-055', 'Dentista',     380, 'outcome', 'confirmed', 'Saúde',          '2026-05-27'),

  // ── Junho 2026 (mês atual — confirmadas + previstas) ──────────────────────
  tx('p-056', 'Salário',     5200, 'income',  'confirmed', 'Trabalho',       '2026-06-05'),
  tx('p-057', 'Aluguel',     1500, 'outcome', 'confirmed', 'Casa',           '2026-06-10', { recurringId: 'r-001' }),
  tx('p-058', 'Mercado',      490, 'outcome', 'confirmed', 'Alimentação',    '2026-06-12'),
  tx('p-059', 'Combustível',  265, 'outcome', 'confirmed', 'Transporte',     '2026-06-14'),
  tx('p-060', 'Internet',     120, 'outcome', 'confirmed', 'Tecnologia',     '2026-06-22', { recurringId: 'r-002' }),
  tx('p-061', 'Netflix',       55, 'outcome', 'pending',   'Entretenimento', '2026-06-25', { recurringId: 'r-003' }),
  tx('p-062', 'Spotify',       22, 'outcome', 'pending',   'Entretenimento', '2026-06-25', { recurringId: 'r-004' }),
  tx('p-063', 'Academia',     110, 'outcome', 'pending',   'Saúde',          '2026-06-28', { recurringId: 'r-005' }),
  tx('p-064', 'Dia dos Namorados', 280, 'outcome', 'pending', 'Lazer',       '2026-06-12'),
  tx('p-065', 'Freelance',    600, 'income',  'pending',   'Trabalho',       '2026-06-20'),
];

const poupanca: Transaction[] = [
  tx('s-001', 'Depósito',          500, 'income', 'confirmed', 'Finanças',      '2026-01-05', { recurringId: 'r-007' }),
  tx('s-002', 'Rendimento CDB',     42, 'income', 'confirmed', 'Investimentos', '2026-01-31'),
  tx('s-003', 'Depósito',          700, 'income', 'confirmed', 'Finanças',      '2026-02-05', { recurringId: 'r-007' }),
  tx('s-004', 'Rendimento CDB',     51, 'income', 'confirmed', 'Investimentos', '2026-02-28'),
  tx('s-005', 'Depósito',          500, 'income', 'confirmed', 'Finanças',      '2026-03-05', { recurringId: 'r-007' }),
  tx('s-006', 'Rendimento CDB',     48, 'income', 'confirmed', 'Investimentos', '2026-03-31'),
  tx('s-007', 'Depósito',          800, 'income', 'confirmed', 'Finanças',      '2026-04-05', { recurringId: 'r-007' }),
  tx('s-008', 'Rendimento CDB',     63, 'income', 'confirmed', 'Investimentos', '2026-04-30'),
  tx('s-009', 'Depósito',          500, 'income', 'confirmed', 'Finanças',      '2026-05-05', { recurringId: 'r-007' }),
  tx('s-010', 'Rendimento CDB',     55, 'income', 'confirmed', 'Investimentos', '2026-05-31'),
  tx('s-011', 'Depósito',          500, 'income', 'confirmed', 'Finanças',      '2026-06-05', { recurringId: 'r-007' }),
  tx('s-012', 'Rendimento CDB',     58, 'income', 'pending',   'Investimentos', '2026-06-30'),
];

export const DEMO_ACCOUNTS = ['Pessoal', 'Poupança'] as const;

export const DEMO_TRANSACTIONS: Record<string, Transaction[]> = {
  Pessoal:  pessoal,
  Poupança: poupanca,
};
