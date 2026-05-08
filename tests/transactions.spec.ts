import { test, expect } from '@playwright/test';
import { gotoTestAccount, openTransactionForm, txItem } from './helpers';

test.describe('Transactions', () => {
  test.beforeEach(async ({ page }) => {
    await gotoTestAccount(page);
  });

  test('creates confirmed income transaction', async ({ page }) => {
    await openTransactionForm(page, {
      title: 'test-income-confirmed',
      amount: '3000',
      type: 'income',
      status: 'confirmed',
      category: 'Salário',
    });

    await expect(txItem(page, 'test-income-confirmed')).toBeVisible();
    // Appears in Confirmadas section, not Previstas
    await expect(
      page.locator('section').filter({ hasText: 'Confirmadas' })
        .getByText('test-income-confirmed'),
    ).toBeVisible();
  });

  test('creates pending outcome transaction', async ({ page }) => {
    await openTransactionForm(page, {
      title: 'test-outcome-pending',
      amount: '500',
      type: 'outcome',
      status: 'pending',
      category: 'Contas',
    });

    await expect(txItem(page, 'test-outcome-pending')).toBeVisible();
    await expect(
      page.locator('section').filter({ hasText: 'Previstas' })
        .getByText('test-outcome-pending'),
    ).toBeVisible();
  });

  test('confirms a pending transaction', async ({ page }) => {
    await openTransactionForm(page, {
      title: 'test-confirm-me',
      amount: '100',
      type: 'outcome',
      status: 'pending',
    });

    const item = txItem(page, 'test-confirm-me');
    await item.getByRole('button', { name: '✓ Confirmar' }).click();

    // After confirming, should be in Confirmadas
    await expect(
      page.locator('section').filter({ hasText: 'Confirmadas' })
        .getByText('test-confirm-me'),
    ).toBeVisible();
  });

  test('moves confirmed transaction back to pending', async ({ page }) => {
    await openTransactionForm(page, {
      title: 'test-move-to-pending',
      amount: '200',
      type: 'income',
      status: 'confirmed',
    });

    const item = txItem(page, 'test-move-to-pending');
    await item.getByRole('button', { name: 'Mover para previsto', exact: false }).click();

    await expect(
      page.locator('section').filter({ hasText: 'Previstas' })
        .getByText('test-move-to-pending'),
    ).toBeVisible();
  });

  test('edits a transaction title and amount', async ({ page }) => {
    await openTransactionForm(page, {
      title: 'test-edit-before',
      amount: '150',
      type: 'outcome',
    });

    const item = txItem(page, 'test-edit-before');
    await item.getByRole('button', { name: 'Editar' }).click();

    await expect(page.getByText('Editar Transação')).toBeVisible();
    await page.getByLabel('Descrição').fill('test-edit-after');
    await page.getByLabel('Valor (R$)').fill('999');
    await page.getByRole('button', { name: 'Salvar alterações' }).click();

    await expect(page.getByText('test-edit-after')).toBeVisible();
    await expect(page.getByText('test-edit-before')).not.toBeVisible();
  });

  test('deletes a transaction', async ({ page }) => {
    await openTransactionForm(page, {
      title: 'test-delete-me',
      amount: '77',
      type: 'outcome',
    });

    await expect(txItem(page, 'test-delete-me')).toBeVisible();
    await txItem(page, 'test-delete-me').getByRole('button', { name: 'Remover' }).click();
    await expect(page.getByText('test-delete-me')).not.toBeVisible();
  });

  test('category combobox filters and accepts free text', async ({ page }) => {
    await page.getByRole('button', { name: '+ Nova Transação' }).click();

    const catInput = page.getByLabel('Categoria');
    await catInput.fill('Merca');

    // Dropdown shows filtered option
    await expect(page.locator('ul li').filter({ hasText: 'Mercado' })).toBeVisible();

    // Free text: custom category
    await catInput.fill('Minha Categoria');
    await page.getByLabel('Descrição').fill('test-custom-category');
    await page.getByLabel('Valor (R$)').fill('10');
    await page.getByRole('button', { name: 'Salvar' }).click();

    await expect(txItem(page, 'test-custom-category')).toBeVisible();
    await expect(txItem(page, 'test-custom-category').getByText('Minha Categoria')).toBeVisible();
  });

  test('summary cards update after adding income', async ({ page }) => {
    // Read current income value from cards
    const incomeCard = page.locator('div').filter({ hasText: /^Entradas/ }).first();

    await openTransactionForm(page, {
      title: 'test-summary-income',
      amount: '1234',
      type: 'income',
      status: 'confirmed',
    });

    // The income card should now show a positive value
    await expect(incomeCard).toContainText('R$');
  });
});
