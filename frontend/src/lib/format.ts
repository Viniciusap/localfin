import { LOCALE, CURRENCY } from '../config/env';

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: CURRENCY,
  }).format(value);
}

export function formatDate(isoDate: string): string {
  return new Intl.DateTimeFormat(LOCALE).format(new Date(isoDate + 'T00:00:00'));
}
