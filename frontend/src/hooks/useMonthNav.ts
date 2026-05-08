import { useState } from 'react';
import { currentMonth, prevMonth, nextMonth } from '../lib/month';

const STORAGE_KEY = 'contas:currentMonth';

function getInitialMonth(): string {
  return localStorage.getItem(STORAGE_KEY) ?? currentMonth();
}

export function useMonthNav() {
  const [month, setMonth] = useState<string>(getInitialMonth);

  function navigate(target: string) {
    setMonth(target);
    localStorage.setItem(STORAGE_KEY, target);
  }

  return {
    month,
    prev: () => navigate(prevMonth(month)),
    next: () => navigate(nextMonth(month)),
    jumpTo: (m: string) => navigate(m),
    today: () => navigate(currentMonth()),
  };
}
