import { test, expect } from '@playwright/test';

const EN_ROUTES = [
  { path: '/en/servicios',   h1: /solar lifecycle/i },
  { path: '/en/proyectos',   h1: /every day/i },
  { path: '/en/calculadora', h1: /would you save/i },
  { path: '/en/impacto',     h1: /kWh/i },
  { path: '/en/contacto',    h1: /installation/i },
];

test.describe('Public navigation — EN', () => {
  test('EN home renders hero H1 in English', async ({ page }) => {
    await page.goto('/en');
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
    await expect(h1).toContainText(/Energy from the sun/i);
  });

  for (const route of EN_ROUTES) {
    test(`${route.path} renders H1`, async ({ page }) => {
      await page.goto(route.path);
      const h1 = page.locator('h1').first();
      await expect(h1).toBeVisible();
      await expect(h1).toContainText(route.h1);
    });
  }

  test('lang toggle ES→EN navigates to /en', async ({ page }) => {
    await page.goto('/');
    // Click EN toggle
    await page.locator('.lang-toggle button', { hasText: 'EN' }).click();
    await expect(page).toHaveURL('/en');
  });
});
