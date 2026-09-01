import { test, expect } from "@playwright/test";

test("admin login page is reachable and shows the form", async ({ page }) => {
  await page.goto("/admin/login");

  // Page renders
  await expect(page).toHaveTitle(/iniciar sesión/i);

  // Form elements are present
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByLabel(/correo/i)).toBeVisible();
  await expect(page.getByLabel(/contraseña/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /iniciar sesión/i })).toBeVisible();
});
