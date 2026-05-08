import { Page } from '@playwright/test';

export const TEST_ACCOUNT = 'playwright-test';

/** Navigate to app using the test account and current month. */
export async function gotoTestAccount(page: Page) {
  await page.goto('/');
  await page.evaluate((name) => {
    localStorage.setItem('contas:currentAccount', name);
    localStorage.removeItem('contas:currentMonth');
  }, TEST_ACCOUNT);
  await page.reload();
  await page.getByRole('button', { name: '+ Nova Transação' }).waitFor();
}

/** Open the add-transaction modal and fill in the fields. */
export async function openTransactionForm(
  page: Page,
  opts: {
    title: string;
    amount: string;
    type?: 'income' | 'outcome';
    status?: 'confirmed' | 'pending';
    category?: string;
  },
) {
  await page.getByRole('button', { name: '+ Nova Transação' }).click();
  await page.getByLabel('Descrição').fill(opts.title);
  await page.getByLabel('Valor (R$)').fill(opts.amount);
  if (opts.type === 'income') await page.getByRole('button', { name: '↑ Entrada' }).click();
  if (opts.type === 'outcome') await page.getByRole('button', { name: '↓ Saída' }).click();
  if (opts.status === 'pending') await page.getByRole('button', { name: '◷ Prevista' }).click();
  await page.getByLabel('Categoria').fill(opts.category ?? 'Outros');
  await page.getByRole('button', { name: 'Salvar' }).click();
  await page.getByText(opts.title).waitFor();
}

/** Find a transaction card by title. */
export function txItem(page: Page, title: string) {
  return page.getByTestId('tx-item').filter({ hasText: title });
}
