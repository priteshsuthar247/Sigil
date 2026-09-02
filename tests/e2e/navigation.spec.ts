import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("dashboard page loads with stat cards", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText("Total Clients")).toBeVisible();
    await expect(page.getByText("Total Invoices")).toBeVisible();
    await expect(page.getByText("Revenue")).toBeVisible();
  });

  test("navigate to invoices list", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("link", { name: "Invoices" }).click();
    await expect(page).toHaveURL("/dashboard/invoices");
  });

  test("navigate to clients list", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("link", { name: "Clients" }).click();
    await expect(page).toHaveURL("/dashboard/clients");
  });

  test("navigate back to dashboard from invoices", async ({ page }) => {
    await page.goto("/dashboard/invoices");
    await page.getByRole("link", { name: "Dashboard" }).click();
    await expect(page).toHaveURL("/dashboard");
  });
});

test.describe("Invoices list", () => {
  test("shows invoice table with filter tabs", async ({ page }) => {
    await page.goto("/dashboard/invoices");
    await expect(page.getByRole("tab", { name: "All" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Sent" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Paid" })).toBeVisible();
  });

  test("new invoice button is visible", async ({ page }) => {
    await page.goto("/dashboard/invoices");
    await expect(
      page.getByRole("button", { name: "New Invoice" }),
    ).toBeVisible();
  });
});

test.describe("Clients list", () => {
  test("shows client table", async ({ page }) => {
    await page.goto("/dashboard/clients");
    await expect(
      page.getByRole("button", { name: "New Client" }),
    ).toBeVisible();
  });
});
