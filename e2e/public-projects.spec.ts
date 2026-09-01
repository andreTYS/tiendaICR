import { test, expect } from "@playwright/test";

test.describe("Public — Proyectos listing (ES)", () => {
  test("projects page renders heading", async ({ page }) => {
    await page.goto("/proyectos");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("category filter chips are visible when categories exist", async ({ page }) => {
    await page.goto("/proyectos");

    const filters = page.locator(".proyectos-filters");
    await expect(filters).toBeVisible();
  });

  test("clicking a category filter updates URL with ?cat param", async ({ page }) => {
    await page.goto("/proyectos");

    const filterButtons = page.locator(".proyectos-filters button, .proyectos-filters [role='button']");
    const count = await filterButtons.count();

    if (count === 0) {
      test.skip();
      return;
    }

    // Click the second filter (index 1) — index 0 is "Todos / All"
    const target = count > 1 ? filterButtons.nth(1) : filterButtons.first();
    const label = await target.textContent();
    await target.click();

    if (count > 1) {
      await expect(page).toHaveURL(/\?cat=/);
    }

    // Page should still show the heading
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    console.log(`Filter clicked: "${label}"`);
  });

  test("project card links to detail page", async ({ page }) => {
    await page.goto("/proyectos");

    const cards = page.locator(".proyectos-grid a");
    const count = await cards.count();

    if (count === 0) {
      test.skip();
      return;
    }

    const href = await cards.first().getAttribute("href");
    await cards.first().click();

    await expect(page).toHaveURL(/\/proyectos\/.+/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    console.log(`Detail page navigated to: ${href}`);
  });

  test("unknown slug returns 404", async ({ page }) => {
    const response = await page.goto("/proyectos/este-proyecto-no-existe-xyz-123");
    expect(response?.status()).toBe(404);
  });
});
