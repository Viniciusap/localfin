import { formatMonthLabel } from '../lib/month';
import { Button } from './ui/Button';
import { AccountSelector } from './AccountSelector';

interface Props {
  account: string;
  accounts: string[];
  month: string;
  isDark: boolean;
  onSwitchAccount: (name: string) => void;
  onManageAccounts: () => void;
  onPrev: () => void;
  onNext: () => void;
  onOpenHistory: () => void;
  onToggleDark: () => void;
}

export function MonthHeader({
  account, accounts, month, isDark,
  onSwitchAccount, onManageAccounts,
  onPrev, onNext, onOpenHistory, onToggleDark,
}: Props) {
  return (
    <header className="flex items-center justify-between mb-8 gap-2 flex-wrap">
      <AccountSelector
        account={account}
        accounts={accounts}
        onSwitch={onSwitchAccount}
        onManage={onManageAccounts}
      />

      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={onPrev} aria-label="Mês anterior" className="text-xl px-3">
          ‹
        </Button>
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 dark:text-slate-100 w-52 text-center">
          {formatMonthLabel(month)}
        </h1>
        <Button variant="ghost" onClick={onNext} aria-label="Próximo mês" className="text-xl px-3">
          ›
        </Button>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" onClick={onToggleDark} aria-label="Alternar tema" className="px-3 text-base">
          {isDark ? '☀' : '☾'}
        </Button>
        <Button variant="ghost" onClick={onOpenHistory} className="hidden sm:inline-flex">
          ≡ Histórico
        </Button>
        <Button variant="ghost" onClick={onOpenHistory} className="sm:hidden px-3">
          ≡
        </Button>
      </div>
    </header>
  );
}
