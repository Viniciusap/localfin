# localfin

> Local-first personal finance tracker. No database, no cloud, no signup. Your data is a JSON file on your own machine.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18-green.svg)
![React](https://img.shields.io/badge/react-18-61DAFB.svg)
![TypeScript](https://img.shields.io/badge/typescript-5-3178C6.svg)

---

## Why localfin?

Most finance apps store your data in their cloud, require an account, and lock you in. localfin takes the opposite approach:

- **Your data stays on your machine** — a plain JSON file you can read, edit, copy, or back up manually
- **Zero external dependencies** — no database engine to install, no API keys, no subscriptions
- **Clone, install, run** — up and running in under two minutes

---

## Features

| | |
|---|---|
| **Monthly view** | Each month is independent with `‹ ›` navigation |
| **Confirmed & Pending** | Two columns for realized vs. forecasted transactions |
| **Summary cards** | Income, Expenses, Balance — with pending subtotals |
| **Charts** | Donut (income vs. expense) + bar chart by category |
| **Balance transfer** | Carry confirmed balance forward manually — never automatic |
| **History drawer** | All months at a glance with sparkline balance |
| **Multi-account** | Separate accounts for personal, business, savings, etc. |
| **Backups** | Manual + automatic (triggered before every restore) |
| **Dark mode** | System preference detection + manual toggle |
| **Configurable locale** | Currency and date format via `.env` — works for any country |

---

## Quick Start

**Prerequisites:** [Node.js](https://nodejs.org/) 18+ and npm 9+

```bash
git clone https://github.com/Viniciusap/localfin.git
cd localfin
npm run setup   # installs all dependencies and creates .env files
npm run dev     # starts backend :3333 and frontend :5173 together
```

Open **http://localhost:5173**.

> `npm run setup` handles everything in one shot — root, backend and frontend deps + `.env` files from the examples.

### Updating an existing installation

```bash
git pull
npm run update  # clears node_modules and reinstalls everything
npm run dev
```

> `npm run update` works on Windows, macOS and Linux. Your `.env` files and data in `backend/DBs/` are never touched.

### Manual setup (step by step)

```bash
git clone https://github.com/Viniciusap/localfin.git
cd localfin

npm install                                          # root
cd backend  && cp .env.example .env && npm install && cd ..
cd frontend && cp .env.example .env && npm install && cd ..

npm run dev
```

---

## Configuration

Everything is controlled by `.env` files — no hardcoded values.

### `backend/.env`

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3333` | Express server port |
| `DB_DIR` | `DBs` | Directory where account `.json` files are stored |
| `BACKUP_DIR` | `<DB_DIR>/backups` | Backup directory — automatically relative to `DB_DIR` |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed CORS origin |

### `frontend/.env`

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | *(empty)* | Direct API URL. **Leave empty** to use the Vite proxy (recommended) |
| `VITE_API_PROXY_TARGET` | `http://localhost:3333` | Proxy target — change this if you changed `PORT` in the backend |
| `VITE_LOCALE` | `pt-BR` | BCP 47 locale tag for number and date formatting |
| `VITE_CURRENCY` | `BRL` | ISO 4217 currency code |

### Common customizations

**Change port:**
```bash
# backend/.env
PORT=4000

# frontend/.env
VITE_API_PROXY_TARGET=http://localhost:4000
```

**Use a different currency:**
```bash
# frontend/.env
VITE_LOCALE=en-US
VITE_CURRENCY=USD
```

**Move data to a custom folder:**
```bash
# backend/.env
DB_DIR=/path/to/my-finances
# BACKUP_DIR will automatically become /path/to/my-finances/backups
```

---

## How data is stored

Each account is a single `.json` file inside `backend/DBs/`:

```
backend/DBs/
├── personal.json       ← array of Transaction objects
├── business.json
└── backups/
    ├── personal__2026-05-01T10-00-00.json       ← manual backup
    └── personal__2026-05-07T14-30-00.auto.json  ← auto backup (pre-restore)
```

Writes use a **write-tmp + rename** strategy to prevent file corruption on crash:

```
personal.json.tmp  →  (atomic rename)  →  personal.json
```

The data format is intentionally simple — you can open any `.json` file in a text editor, fix a typo, or import it into a spreadsheet without any special tools.

---

## Project Structure

```
localfin/
├── backend/
│   ├── src/
│   │   ├── config/index.ts        # PORT, DB_DIR, BACKUP_DIR, CORS_ORIGIN
│   │   ├── db/jsonStore.ts        # atomic I/O + account and backup operations
│   │   ├── routes/
│   │   │   ├── accounts.ts        # account CRUD + month listing
│   │   │   ├── transactions.ts    # transaction CRUD + summary + balance transfer
│   │   │   └── backups.ts         # backup list / create / restore / delete
│   │   ├── types/
│   │   │   ├── Transaction.ts
│   │   │   └── Account.ts
│   │   └── server.ts
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── config/env.ts          # VITE_API_URL, VITE_LOCALE, VITE_CURRENCY
│   │   ├── hooks/
│   │   │   ├── useAccount.ts      # account list + CRUD + localStorage
│   │   │   ├── useAccounts.ts     # transactions for one account/month
│   │   │   ├── useMonthNav.ts     # month navigation + localStorage
│   │   │   ├── useBackups.ts      # backup operations
│   │   │   └── useDarkMode.ts     # dark mode + system preference
│   │   ├── lib/
│   │   │   ├── api.ts             # typed fetch wrapper for all endpoints
│   │   │   ├── format.ts          # formatCurrency / formatDate (uses VITE_LOCALE)
│   │   │   └── month.ts           # YYYY-MM helpers
│   │   ├── components/
│   │   │   ├── ui/                # Button, Card, Input
│   │   │   ├── MonthHeader.tsx
│   │   │   ├── SummaryCards.tsx
│   │   │   ├── MonthCharts.tsx
│   │   │   ├── TransferBalance.tsx
│   │   │   ├── TransactionForm.tsx
│   │   │   ├── TransactionList.tsx
│   │   │   ├── MonthsOverview.tsx
│   │   │   ├── AccountSelector.tsx
│   │   │   ├── AccountsManager.tsx
│   │   │   └── BackupsPanel.tsx
│   │   └── App.tsx
│   ├── vite.config.ts             # proxy reads VITE_API_PROXY_TARGET via loadEnv
│   ├── .env.example
│   └── package.json
│
├── scripts/setup.js               # copies .env.example → .env
├── package.json                   # root scripts + concurrently
├── LICENSE
└── README.md
```

---

## API Reference

Base path: `/api/accounts/:account/`

### Accounts

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/accounts` | List all accounts |
| `POST` | `/api/accounts` | Create — body: `{ name }` |
| `PATCH` | `/api/accounts/:account` | Rename — body: `{ newName }` |
| `DELETE` | `/api/accounts/:account` | Delete account and all its backups |

### Months

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/accounts/:account/months` | Months that have at least one transaction |

### Transactions

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/accounts/:account/months/:month/transactions` | List (`month` = `YYYY-MM`) |
| `POST` | `/api/accounts/:account/months/:month/transactions` | Create |
| `PATCH` | `/api/accounts/:account/months/:month/transactions/:id/status` | Set `confirmed` or `pending` |
| `DELETE` | `/api/accounts/:account/months/:month/transactions/:id` | Delete |
| `GET` | `/api/accounts/:account/months/:month/summary` | Financial summary |
| `POST` | `/api/accounts/:account/months/:month/transfer-balance` | Transfer confirmed balance — body: `{ toMonth }` |

### Backups

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/accounts/:account/backups` | List backups |
| `POST` | `/api/accounts/:account/backups` | Create manual backup |
| `POST` | `/api/accounts/:account/backups/:filename/restore` | Restore (auto-backup current state first) |
| `DELETE` | `/api/accounts/:account/backups/:filename` | Delete |

### `Transaction` schema

```typescript
interface Transaction {
  id: string;                        // auto-generated UUID
  title: string;
  amount: number;                    // always positive
  type: 'income' | 'outcome';
  status: 'confirmed' | 'pending';
  category: string;
  date: string;                      // YYYY-MM-DD
  transferredFrom?: string;          // source month YYYY-MM, only on balance transfers
}
```

### curl examples

```bash
# Create a transaction
curl -X POST http://localhost:3333/api/accounts/personal/months/2026-05/transactions \
  -H "Content-Type: application/json" \
  -d '{"title":"Salary","amount":5000,"type":"income","status":"confirmed","category":"Other","date":"2026-05-05"}'

# Get monthly summary
curl http://localhost:3333/api/accounts/personal/months/2026-05/summary

# Transfer balance to next month (idempotent — returns 409 if already done)
curl -X POST http://localhost:3333/api/accounts/personal/months/2026-05/transfer-balance \
  -H "Content-Type: application/json" \
  -d '{"toMonth":"2026-06"}'
```

---

## Remote Access

To use localfin from another device on your network or via a tunnel:

```bash
# Expose only the frontend — Vite automatically proxies /api to localhost:3333
ngrok http 5173
```

No need to expose the backend.

---

## Architecture

**JSON files over SQLite or a database**
The goal is zero external dependencies. JSON files are human-readable, trivially portable, and can be version-controlled. For personal monthly data the read-all-on-request approach is perfectly fast. The write-tmp + rename pattern ensures atomicity without transactions.

**Explicit balance transfers**
Personal finance requires deliberate intent. An automatic carry-forward would silently hide month-end discrepancies and make reconciliation much harder to reason about.

**Monorepo**
Frontend and backend share the `Transaction` type directly. Separate repos would require a shared package or constant manual sync — unnecessary overhead for a personal project.

**English error messages**
All backend error responses are in English so contributors and integrators of any language can work with the API without a translation barrier.

---

## Contributing

Contributions are welcome!

1. Fork the repo
2. Create a branch: `git checkout -b feature/my-feature`
3. Commit with a clear message: `git commit -m 'feat: add my feature'`
4. Push and open a Pull Request

### Good first issues

- [ ] Search and filter within a month
- [ ] CSV / Excel export
- [ ] Customizable categories
- [ ] Multi-month historical charts

---

## License

MIT © [Vinicius](https://github.com/Viniciusap)
