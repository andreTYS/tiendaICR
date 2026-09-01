import { test, expect } from '@playwright/test';

test.describe('Locale negotiation', () => {
  test('Accept-Language: en redirects / to /en when no cookie', async ({ browser }) => {
    // Fresh context — no cookies, English browser
    const ctx = await browser.newContext({
      extraHTTPHeaders: { 'Accept-Language': 'en-US,en;q=0.9' },
    });
    const page = await ctx.newPage();

    await page.goto('/');

    // Should land on /en
    await expect(page).toHaveURL('/en');

    // Cookie should be set
    const cookies = await ctx.cookies();
    const langCookie = cookies.find((c) => c.name === 'icr-lang');
    expect(langCookie?.value).toBe('en');

    await ctx.close();
  });

  test('Accept-Language: es stays on / (no redirect)', async ({ browser }) => {
    const ctx = await browser.newContext({
      extraHTTPHeaders: { 'Accept-Language': 'es-PE,es;q=0.9' },
    });
    const page = await ctx.newPage();

    await page.goto('/');

    // Should stay on /
    await expect(page).toHaveURL('/');

    await ctx.close();
  });

  test('icr-lang=es cookie prevents EN redirect', async ({ browser }) => {
    const ctx = await browser.newContext({
      extraHTTPHeaders: { 'Accept-Language': 'en-US,en;q=0.9' },
    });
    // Set the preference cookie manually
    await ctx.addCookies([
      { name: 'icr-lang', value: 'es', domain: 'localhost', path: '/' },
    ]);
    const page = await ctx.newPage();

    await page.goto('/');

    // Cookie says ES → stay on /
    await expect(page).toHaveURL('/');

    await ctx.close();
  });
});
