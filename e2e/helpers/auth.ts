import { expect, type Page } from "@playwright/test";

/** Seeded SUPER_ADMIN — see scripts/seed.ts */
export const E2E_USER = {
  email: "aneena.antony@ibtechintl.com",
  password: "Aneenaantony@123",
};

export async function loginAsAdmin(page: Page) {
  await page.goto("/login");
  await page.locator('input[name="email"]').fill(E2E_USER.email);
  await page.locator('input[name="password"]').fill(E2E_USER.password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/($|\?)/, { timeout: 30_000 });
  await expect(page.getByRole("heading", { name: /RFID Linen Management Overview/i })).toBeVisible({
    timeout: 30_000,
  });
}
