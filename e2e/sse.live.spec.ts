import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./helpers/auth";

test.describe("SSE live tracking", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("shows connecting then live when stream opens", async ({ page }) => {
    // Hold the SSE open without failing so we can observe connecting → live
    await page.route("**/api/rfid/stream", async (route) => {
      await new Promise((r) => setTimeout(r, 400));
      await route.continue();
    });

    await page.goto("/rfid/live");
    const status = page.getByTestId("sse-status");
    await expect(status).toBeVisible();

    // Either still connecting briefly or already live after continue
    await expect(status).toHaveAttribute("data-sse-state", /connecting|live/);

    await expect(status).toHaveAttribute("data-sse-state", "live", { timeout: 20_000 });
    await expect(status).toContainText(/Live — streaming RFID reads/i);
    await expect(page.getByTestId("live-feed-table")).toBeVisible();
  });

  test("shows error state when SSE stream fails", async ({ page }) => {
    await page.route("**/api/rfid/stream", async (route) => {
      await route.abort("failed");
    });

    await page.goto("/rfid/live");
    const status = page.getByTestId("sse-status");

    await expect(status).toHaveAttribute("data-sse-state", "error", { timeout: 15_000 });
    await expect(status).toContainText(/Connection lost/i);
    await expect(page.getByTestId("sse-retry")).toBeVisible();
  });

  test("retry recovers after stream is restored", async ({ page }) => {
    let fail = true;
    await page.route("**/api/rfid/stream", async (route) => {
      if (fail) {
        await route.abort("failed");
        return;
      }
      await route.continue();
    });

    await page.goto("/rfid/live");
    await expect(page.getByTestId("sse-status")).toHaveAttribute("data-sse-state", "error", {
      timeout: 15_000,
    });

    fail = false;
    await page.getByTestId("sse-retry").click();
    await expect(page.getByTestId("sse-status")).toHaveAttribute("data-sse-state", "live", {
      timeout: 20_000,
    });
  });
});
