import { test, expect } from '@playwright/test';

test.describe('Contact form', () => {
  test('renders contact page', async ({ page }) => {
    await page.goto('/contacto');
    await expect(page.locator('section#contacto')).toBeVisible();
  });

  test('shows form fields', async ({ page }) => {
    await page.goto('/contacto');
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('textarea[name="message"]')).toBeVisible();
  });

  /**
   * Full submission test requires a running DB.
   * This test is authored but marked as skip in CI without DB.
   * Run manually with: npx playwright test e2e/contact-form.spec.ts --headed
   */
  test.skip('submits valid form and shows success', async ({ page }) => {
    await page.goto('/contacto');
    await page.fill('input[name="name"]', 'Test Usuario');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="phone"]', '+51 999 000 111');
    await page.fill('textarea[name="message"]', 'Mensaje de prueba para el formulario de contacto');
    await page.click('button[type="submit"]');
    // Success state — either button text changes or success message appears
    await expect(page.locator('p', { hasText: /enviado|sent/i }).or(page.locator('button[disabled]'))).toBeVisible({ timeout: 10000 });
  });
});
