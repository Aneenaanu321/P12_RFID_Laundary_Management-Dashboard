import { test, expect } from "@playwright/test";
import { loginAsAdmin, E2E_USER } from "./helpers/auth";

test.describe("Auth flows", () => {
  test("rejects invalid password", async ({ page }) => {
    await page.goto("/login");
    await page.locator('input[name="email"]').fill(E2E_USER.email);
    await page.locator('input[name="password"]').fill("wrong-password");
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page.getByText(/invalid email or password/i)).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test("signup page is reachable", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByRole("heading", { name: /create account|sign up/i })).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test("forgot-password page is reachable", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(page.getByRole("heading", { name: /forgot|reset/i })).toBeVisible();
  });
});

test.describe("Core navigation smoke", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("opens key modules without error", async ({ page }) => {
    const paths = [
      "/operations",
      "/inventory",
      "/loss/missing",
      "/rfid/readers",
      "/settlement",
      "/alerts",
      "/admin/settings",
    ];
    for (const path of paths) {
      await page.goto(path);
      await expect(page.locator("main")).toBeVisible();
      await expect(page.locator("text=Application error")).toHaveCount(0);
    }
  });

  test("theme toggle switches html class", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByRole("button", { name: /theme|dark|light/i }).first();
    await expect(toggle).toBeVisible();
    const before = await page.locator("html").getAttribute("class");
    await toggle.click();
    const after = await page.locator("html").getAttribute("class");
    expect(before === after).toBeFalsy();
    expect(after || "").toMatch(/dark|light/);
  });
});
