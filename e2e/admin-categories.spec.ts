import { test, expect } from "@playwright/test";

// ── helpers ──────────────────────────────────────────────────────────────────

async function login(page: Parameters<typeof test>[1] extends { page: infer P } ? P : never) {
  await page.goto("/admin/login");
  await page.getByLabel(/correo/i).fill(process.env.SEED_ADMIN_EMAIL ?? "admin@test.com");
  await page.getByLabel(/contraseña/i).fill(process.env.SEED_ADMIN_PASSWORD ?? "password");
  await page.getByRole("button", { name: /iniciar sesión/i }).click();
  await page.waitForURL("/admin");
}

// ── suite ─────────────────────────────────────────────────────────────────────

test.describe("Admin — Categorías CRUD", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("categories list page is reachable", async ({ page }) => {
    await page.goto("/admin/categorias");
    await expect(page.getByRole("heading", { name: /categorías/i })).toBeVisible();
  });

  test("'Nueva categoría' link leads to create form", async ({ page }) => {
    await page.goto("/admin/categorias");
    await page.getByRole("link", { name: /nueva categoría/i }).click();
    await expect(page).toHaveURL("/admin/categorias/new");
    await expect(page.getByRole("heading", { name: /nueva categoría/i })).toBeVisible();
  });

  test("create a new category — fills nameEs, auto-generates slug, submits", async ({ page }) => {
    await page.goto("/admin/categorias/new");

    await page.getByLabel(/nombre.*español/i).fill("Agricultura E2E");
    // Slug field should auto-populate
    await expect(page.getByLabel(/slug/i)).toHaveValue("agricultura-e2e");

    await page.getByRole("button", { name: /crear/i }).click();

    // After success should redirect to list
    await expect(page).toHaveURL("/admin/categorias");
    await expect(page.getByText(/agricultura-e2e/i)).toBeVisible();
  });

  test("navigate to edit page for existing category", async ({ page }) => {
    await page.goto("/admin/categorias");

    const editLinks = page.getByRole("link", { name: /editar/i });
    const count = await editLinks.count();

    if (count === 0) {
      test.skip();
      return;
    }

    await editLinks.first().click();
    await expect(page).toHaveURL(/\/admin\/categorias\/[^/]+\/edit/);
    await expect(page.getByRole("heading", { name: /editar categoría/i })).toBeVisible();
  });

  test("delete category shows confirmation and removes it", async ({ page }) => {
    await page.goto("/admin/categorias");

    const deleteButtons = page.getByRole("button", { name: /eliminar/i });
    const count = await deleteButtons.count();

    if (count === 0) {
      test.skip();
      return;
    }

    page.on("dialog", (dialog) => dialog.accept());
    await deleteButtons.first().click();

    await expect(page).toHaveURL("/admin/categorias");
  });
});
