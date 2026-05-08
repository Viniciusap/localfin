interface Props {
  account: string;
  accounts: string[];
  onSwitch: (name: string) => void;
  onManage: () => void;
}

export function AccountSelector({ account, accounts, onSwitch, onManage }: Props) {
  return (
    <div className="relative group">
      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm font-medium text-slate-700 dark:text-slate-200">
        <span className="w-2 h-2 rounded-full bg-emerald-400" />
        {account || '…'}
        <span className="text-slate-400 dark:text-slate-500 text-xs">▾</span>
      </button>

      <div className="absolute left-0 top-full mt-1 w-52 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 py-1 z-40 hidden group-focus-within:block">
        {accounts.map(a => (
          <button key={a} onClick={() => onSwitch(a)}
            className={`w-full text-left px-4 py-2 text-sm transition-colors ${
              a === account
                ? 'text-slate-800 dark:text-slate-100 font-semibold bg-slate-50 dark:bg-slate-700'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            {a === account && <span className="mr-1.5 text-emerald-500">✓</span>}
            {a}
          </button>
        ))}
        <hr className="my-1 border-slate-100 dark:border-slate-700" />
        <button onClick={onManage}
          className="w-full text-left px-4 py-2 text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          ⚙ Gerenciar contas
        </button>
      </div>
    </div>
  );
}
