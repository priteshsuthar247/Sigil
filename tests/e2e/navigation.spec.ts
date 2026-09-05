import { test, expect } from "@playwright/test";

test.describe("Dashboard @smoke", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
  });

  test("displays stat cards", async ({ page }) => {
    await expect(page.getByText("Total Clients")).toBeVisible();
    await expect(page.getByText("Total Invoices")).toBeVisible();
    await expect(page.getByText("Revenue")).toBeVisible();
  });

  test("shows recent invoices from database", async ({ page }) => {
    await expect(page.getByText("Recent Invoices")).toBeVisible();
    await expect(page.locator("text=/^#\\d{4}$/").first()).toBeVisible();
    await expect(page.locator("text=/[A-Z][a-z]+ [A-Z][a-z]+/").first()).toBeVisible();
  });
});

test.describe("Navigation", () => {
  test("sidebar links navigate correctly", async ({ page }) => {
    await page.goto("/dashboard");

    await page.getByRole("link", { name: "Invoices" }).click();
    await page.waitForURL("/dashboard/invoices");
    await expect(page).toHaveURL("/dashboard/invoices");

    await page.getByRole("link", { name: "Clients" }).click();
    await page.waitForURL("/dashboard/clients");
    await expect(page).toHaveURL("/dashboard/clients");

    await page.getByRole("link", { name: "Dashboard" }).click();
    await page.waitForURL("/dashboard");
    await expect(page).toHaveURL("/dashboard");
  });
});
