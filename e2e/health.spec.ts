import { test, expect } from '@playwright/test';

test.describe('/api/health', () => {
  test('returns JSON with status field', async ({ request }) => {
    const response = await request.get('/api/health');
    // 200 (ok) or 503 (degraded) — both are valid responses
    expect([200, 503]).toContain(response.status());
    const body = await response.json();
    expect(body).toHaveProperty('status');
    expect(body).toHaveProperty('db');
    expect(body).toHaveProperty('storage');
    expect(body).toHaveProperty('timestamp');
  });
});
