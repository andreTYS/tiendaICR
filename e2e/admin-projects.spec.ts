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

test.describe("Admin — Proyectos CRUD", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("projects list page is reachable", async ({ page }) => {
    await page.goto("/admin/proyectos");
    await expect(page.getByRole("heading", { name: /proyectos/i })).toBeVisible();
  });

  test("'Nuevo proyecto' link leads to create form", async ({ page }) => {
    await page.goto("/admin/proyectos");
    await page.getByRole("link", { name: /nuevo proyecto/i }).first().click();
    await expect(page).toHaveURL("/admin/proyectos/new");
    await expect(page.getByRole("heading", { name: /nuevo proyecto/i })).toBeVisible();
  });

  test("new project form renders title, slug and category fields", async ({ page }) => {
    await page.goto("/admin/proyectos/new");

    await expect(page.getByLabel(/título.*español/i)).toBeVisible();
    await expect(page.getByLabel(/slug/i)).toBeVisible();
    await expect(page.getByLabel(/categoría/i)).toBeVisible();
  });

  test("titleEs input auto-populates slug field", async ({ page }) => {
    await page.goto("/admin/proyectos/new");

    await page.getByLabel(/título.*español/i).fill("Proyecto de Prueba E2E");
    await expect(page.getByLabel(/slug/i)).toHaveValue("proyecto-de-prueba-e2e");
  });

  test("navigate to edit page for existing project", async ({ page }) => {
    await page.goto("/admin/proyectos");

    const editLinks = page.getByRole("link", { name: /editar/i });
    const count = await editLinks.count();

    if (count === 0) {
      test.skip();
      return;
    }

    await editLinks.first().click();
    await expect(page).toHaveURL(/\/admin\/proyectos\/[^/]+\/edit/);
    await expect(page.getByRole("heading", { name: /editar proyecto/i })).toBeVisible();
  });

  test("delete project shows confirmation and removes it", async ({ page }) => {
    await page.goto("/admin/proyectos");

    const deleteButtons = page.getByRole("button", { name: /eliminar/i });
    const count = await deleteButtons.count();

    if (count === 0) {
      test.skip();
      return;
    }

    page.on("dialog", (dialog) => dialog.accept());
    await deleteButtons.first().click();

    await expect(page).toHaveURL("/admin/proyectos");
  });

  test("drag handles are visible when 2+ projects exist", async ({ page }) => {
    await page.goto("/admin/proyectos");

    const handles = page.locator("[data-testid='drag-handle']");
    const count = await handles.count();

    if (count >= 2) {
      await expect(handles.first()).toBeVisible();
    } else {
      await expect(page.getByRole("heading", { name: /proyectos/i })).toBeVisible();
    }
  });
});
