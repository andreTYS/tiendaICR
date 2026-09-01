import { test, expect } from '@playwright/test';

test.describe('robots.txt', () => {
  test('returns 200 with Disallow /admin/', async ({ request }) => {
    const response = await request.get('/robots.txt');
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain('Disallow: /admin/');
  });

  test('contains sitemap reference', async ({ request }) => {
    const response = await request.get('/robots.txt');
    const body = await response.text();
    expect(body).toContain('sitemap.xml');
  });
});
