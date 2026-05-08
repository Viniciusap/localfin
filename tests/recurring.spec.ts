import { test, expect } from '@playwright/test';
import { gotoTestAccount, txItem } from './helpers';

test.describe('Recurring templates', () => {
  test.beforeEach(async ({ page }) => {
    await gotoTestAccount(page);
  });

  async function openRecurring(page: Parameters<typeof gotoTestAccount>[0]) {
    await page.getByRole('button', { name: /Recorrentes/ }).click();
    await expect(page.getByTestId('recurring-panel')).toBeVisible();
  }

  test('creates a recurring template', async ({ page }) => {
    await openRecurring(page);
    await page.getByRole('button', { name: '+ Nova recorrência' }).click();

    await page.getByLabel('Descrição').fill('test-recurring-template');
    await page.getByLabel('Valor (R$)').fill('800');
    await page.getByRole('button', { name: '↓ Saída' }).click();
    await page.getByLabel('Categoria').fill('Aluguel');
    await page.getByLabel('Dia do mês (1–28)').fill('5');
    await page.getByRole('button', { name: 'Criar' }).click();

    await expect(page.getByTestId('recurring-template').filter({ hasText: 'test-recurring-template' })).toBeVisible();
  });

  test('applies recurring template to current month', async ({ page }) => {
    await openRecurring(page);

    const template = page.getByTestId('recurring-template').filter({ hasText: 'test-recurring-template' });
    await template.getByRole('button', { name: /Aplicar em/ }).click();

    await page.getByRole('button', { name: 'Fechar' }).click();

    // Transaction should appear in the list with ↻ badge
    await expect(txItem(page, 'test-recurring-template')).toBeVisible();
    await expect(txItem(page, 'test-recurring-template').getByText('↻')).toBeVisible();
  });

  test('apply is idempotent — shows applied state after applying', async ({ page }) => {
    await openRecurring(page);

    const template = page.getByTestId('recurring-template').filter({ hasText: 'test-recurring-template' });
    await expect(template.getByRole('button', { name: '✓ Aplicado' })).toBeVisible();
  });

  test('deletes a recurring template', async ({ page }) => {
    await openRecurring(page);

    // Create a fresh template to delete
    await page.getByRole('button', { name: '+ Nova recorrência' }).click();
    await page.getByLabel('Descrição').fill('test-recurring-delete');
    await page.getByLabel('Valor (R$)').fill('50');
    await page.getByLabel('Categoria').fill('Outros');
    await page.getByLabel('Dia do mês (1–28)').fill('10');
    await page.getByRole('button', { name: 'Criar' }).click();

    const template = page.getByTestId('recurring-template').filter({ hasText: 'test-recurring-delete' });
    await expect(template).toBeVisible();
    await template.getByRole('button', { name: 'Excluir' }).click();
    await expect(template).not.toBeVisible();
  });
});
