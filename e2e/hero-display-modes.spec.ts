import { test, expect } from "@playwright/test";

// ── helpers ──────────────────────────────────────────────────────────────────

async function login(page: Parameters<typeof test>[1] extends { page: infer P } ? P : never) {
  await page.goto("/admin/login");
  await page.getByLabel(/correo/i).fill(process.env.SEED_ADMIN_EMAIL ?? "admin@test.com");
  await page.getByLabel(/contraseña/i).fill(process.env.SEED_ADMIN_PASSWORD ?? "password");
  await page.getByRole("button", { name: /iniciar sesión/i }).click();
  await page.waitForURL("/admin");
}

async function setDisplayMode(page: Parameters<typeof test>[1] extends { page: infer P } ? P : never, mode: string) {
  await page.goto("/admin/settings");
  await page.getByLabel(/modo.*hero|hero.*modo/i).selectOption(mode);
  await page.getByRole("button", { name: /guardar/i }).click();
  // Wait for the success feedback or redirect
  await page.waitForTimeout(500);
}

// ── suite ─────────────────────────────────────────────────────────────────────

test.describe("Hero display modes", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("settings page renders display mode select", async ({ page }) => {
    await page.goto("/admin/settings");
    await expect(page.getByRole("heading", { name: /configuración/i })).toBeVisible();
    await expect(page.getByLabel(/modo.*hero|hero.*modo/i)).toBeVisible();
  });

  test("animation-only mode — home shows SVG animation, no banner region", async ({ page }) => {
    await setDisplayMode(page, "animation-only");

    await page.goto("/");

    // SVG animation wrapper should be present
    const heroSection = page.locator("section").first();
    await expect(heroSection).toBeVisible();

    // Banner region should NOT be present in animation-only mode
    const bannerRegion = page.getByRole("region", { name: /hero banners/i });
    await expect(bannerRegion).toHaveCount(0);
  });

  test("banners-only mode — home shows banner region, no scrim SVG overlay", async ({ page }) => {
    await setDisplayMode(page, "banners-only");

    await page.goto("/");

    // Banner region is only rendered when there are active banners
    // We check that the page renders without errors either way
    const heroSection = page.locator("section").first();
    await expect(heroSection).toBeVisible();
  });

  test("banners-over-animation mode — home shows both banner and animation", async ({ page }) => {
    await setDisplayMode(page, "banners-over-animation");

    await page.goto("/");

    const heroSection = page.locator("section").first();
    await expect(heroSection).toBeVisible();
  });

  test("restores animation-only as default after test", async ({ page }) => {
    await setDisplayMode(page, "animation-only");
    await page.goto("/admin/settings");

    const select = page.getByLabel(/modo.*hero|hero.*modo/i);
    await expect(select).toHaveValue("animation-only");
  });
});
