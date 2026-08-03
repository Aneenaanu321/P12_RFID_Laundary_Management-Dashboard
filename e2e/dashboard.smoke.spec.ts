import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./helpers/auth";

test.describe("Dashboard smoke", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("renders KPI cards and charts with seeded data", async ({ page }) => {
    await expect(page.getByTestId("kpi-totalItems")).toBeVisible();
    await expect(page.getByTestId("kpi-inLaundry")).toBeVisible();
    await expect(page.getByTestId("kpi-ready")).toBeVisible();
    await expect(page.getByTestId("kpi-missing")).toBeVisible();

    // Seeded inventory is large — value should be a non-zero formatted number
    const totalCard = page.getByTestId("kpi-totalItems");
    await expect(totalCard).toContainText(/[1-9]/);
    await expect(totalCard).toHaveAttribute("data-kpi-label", "Total RFID Items");

    await expect(
      page.getByRole("img", { name: /inventory trend/i })
    ).toBeVisible();
    await expect(
      page.getByRole("img", { name: /missing items trend/i })
    ).toBeVisible();

    // Recharts mounts SVG paths inside the labeled chart frames
    await expect(page.locator('[role="img"][aria-label*="Inventory"] svg').first()).toBeVisible();
    await expect(page.locator('[role="img"][aria-label*="Missing"] svg').first()).toBeVisible();
  });

  test("shows customer overview table when seeded", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /Customer \/ Organization Overview/i })
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /Hospital A/i }).first()).toBeVisible();
  });
});
