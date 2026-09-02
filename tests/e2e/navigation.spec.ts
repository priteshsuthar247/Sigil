import { test, expect } from "@playwright/test";

test.describe("Navigation @smoke", () => {
  test("dashboard page loads with stat cards", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText("Total Clients")).toBeVisible();
    await expect(page.getByText("Total Invoices")).toBeVisible();
    await expect(page.getByText("Revenue")).toBeVisible();
  });

  test("navigate to invoices list via sidebar", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("link", { name: "Invoices" }).click();
    await page.waitForURL("/dashboard/invoices");
    await expect(page).toHaveURL("/dashboard/invoices");
  });

  test("navigate to clients list via sidebar", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("link", { name: "Clients" }).click();
    await page.waitForURL("/dashboard/clients");
    await expect(page).toHaveURL("/dashboard/clients");
  });

  test("navigate back to dashboard from invoices", async ({ page }) => {
    await page.goto("/dashboard/invoices");
    await page.getByRole("link", { name: "Dashboard" }).click();
    await page.waitForURL("/dashboard");
    await expect(page).toHaveURL("/dashboard");
  });
});

test.describe("Invoices list", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/invoices");
  });

  test("shows filter tabs", async ({ page }) => {
    const tablist = page.getByRole("tablist");
    await expect(tablist.getByRole("tab", { name: "All" })).toBeVisible();
    await expect(tablist.getByRole("tab", { name: "Sent" })).toBeVisible();
    await expect(tablist.getByRole("tab", { name: "Paid" })).toBeVisible();
  });

  test("new invoice button is visible", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: "New Invoice" }),
    ).toBeVisible();
  });
});

test.describe("Clients list", () => {
  test("shows new client button", async ({ page }) => {
    await page.goto("/dashboard/clients");
    await expect(
      page.getByRole("button", { name: "New Client" }),
    ).toBeVisible();
  });
});
