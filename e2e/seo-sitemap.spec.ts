import { test, expect } from '@playwright/test';

test.describe('sitemap.xml', () => {
  test('returns valid XML containing key routes', async ({ request }) => {
    const response = await request.get('/sitemap.xml');
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain('<urlset');
    expect(body).toContain('<loc>');
    // Must contain home and proyectos in ES
    expect(body).toContain('/proyectos');
    expect(body).toContain('/en');
  });

  test('content-type is application/xml or text/xml', async ({ request }) => {
    const response = await request.get('/sitemap.xml');
    const ct = response.headers()['content-type'] ?? '';
    expect(ct).toMatch(/xml/);
  });
});
