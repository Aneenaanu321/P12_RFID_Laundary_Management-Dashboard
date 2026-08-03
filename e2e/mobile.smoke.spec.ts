import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./helpers/auth";

test.use({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
});

test.describe("Mobile layout", () => {
  test("dashboard is usable on phone viewport", async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page.getByTestId("kpi-totalItems")).toBeVisible();
    await expect(page.getByRole("button", { name: /open navigation menu/i })).toBeVisible();
    await page.getByRole("button", { name: /open navigation menu/i }).click();
    await expect(page.getByRole("link", { name: /dashboard/i }).first()).toBeVisible();
  });
});
