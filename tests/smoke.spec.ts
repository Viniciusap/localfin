import { test, expect } from '@playwright/test';
import { gotoTestAccount } from './helpers';

test.describe('Smoke', () => {
  test.beforeEach(async ({ page }) => {
    await gotoTestAccount(page);
  });

  test('app loads and shows main UI elements', async ({ page }) => {
    await expect(page.getByRole('button', { name: '+ Nova Transação' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Recorrentes/ })).toBeVisible();
    await expect(page.getByText('Entradas')).toBeVisible();
    await expect(page.getByText('Saídas')).toBeVisible();
    // Use first() since 'Saldo' appears in summary card and TransferBalance button
    await expect(page.getByText('Saldo').first()).toBeVisible();
    await expect(page.getByText('Confirmadas')).toBeVisible();
    await expect(page.getByText('Previstas')).toBeVisible();
  });

  test('opens and cancels add-transaction modal', async ({ page }) => {
    await page.getByRole('button', { name: '+ Nova Transação' }).click();
    await expect(page.getByRole('heading', { name: 'Nova Transação' })).toBeVisible();
    await expect(page.getByLabel('Descrição')).toBeVisible();
    await expect(page.getByLabel('Valor (R$)')).toBeVisible();
    await expect(page.getByLabel('Categoria')).toBeVisible();

    await page.getByRole('button', { name: 'Cancelar' }).click();
    await expect(page.getByRole('heading', { name: 'Nova Transação' })).not.toBeVisible();
  });

  test('opens and closes recurring panel', async ({ page }) => {
    await page.getByRole('button', { name: /Recorrentes/ }).click();
    await expect(page.getByTestId('recurring-panel')).toBeVisible();

    await page.getByRole('button', { name: 'Fechar' }).click();
    await expect(page.getByTestId('recurring-panel')).not.toBeVisible();
  });
});
