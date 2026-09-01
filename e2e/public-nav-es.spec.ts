import { test, expect } from '@playwright/test';

const ROUTES = [
  { path: '/servicios',   h1: /ciclo solar/i },
  { path: '/proyectos',   h1: /operan hoy/i },
  { path: '/calculadora', h1: /ahorrarías/i },
  { path: '/impacto',     h1: /kWh/i },
  { path: '/contacto',    h1: /instalación/i },
];

test.describe('Public navigation — ES', () => {
  test('home renders hero H1', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.locator('h1').first()).toContainText(/Energía del sol/i);
  });

  for (const route of ROUTES) {
    test(`${route.path} renders H1`, async ({ page }) => {
      await page.goto(route.path);
      const h1 = page.locator('h1').first();
      await expect(h1).toBeVisible();
      await expect(h1).toContainText(route.h1);
    });
  }

  test('nav links navigate correctly', async ({ page }) => {
    await page.goto('/');
    // Click Servicios link
    await page.locator('.nav-link', { hasText: 'Servicios' }).click();
    await expect(page).toHaveURL('/servicios');
    // Click Proyectos link
    await page.locator('.nav-link', { hasText: 'Proyectos' }).click();
    await expect(page).toHaveURL('/proyectos');
  });
});
