import { test, expect } from "@playwright/test";

test.describe("Client list", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/clients");
    // Show all rows to handle accumulated test data
    const rowsPerPage = page.getByRole("combobox", { name: "Rows per page" });
    await rowsPerPage.click();
    await page.getByRole("option", { name: "50" }).click();
  });

  test("displays seeded clients in table", async ({ page }) => {
    // Ensure at least one client row with email is visible
    await expect(page.getByText(/@.+\.com/).first()).toBeVisible();
  });

  test("shows client emails", async ({ page }) => {
    await expect(page.getByText(/@.+\.com/).first()).toBeVisible();
  });
});

test.describe("Client detail", () => {
  test("shows correct client data from database", async ({ page }) => {
    // Navigate to clients list and click first client
    await page.goto("/dashboard/clients");
    const rowsPerPage = page.getByRole("combobox", { name: "Rows per page" });
    await rowsPerPage.click();
    await page.getByRole("option", { name: "50" }).click();
    await page.locator('a[href^="/dashboard/clients/"]').first().click();
    await page.waitForURL(/\/dashboard\/clients\//);

    // Verify client info present
    await expect(page.getByText(/@/)).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("shows client's invoices", async ({ page }) => {
    await page.goto("/dashboard/clients");
    const rowsPerPage = page.getByRole("combobox", { name: "Rows per page" });
    await rowsPerPage.click();
    await page.getByRole("option", { name: "50" }).click();
    await page.locator('a[href^="/dashboard/clients/"]').first().click();
    await page.waitForURL(/\/dashboard\/clients\//);

    // Should show at least one invoice number
    await expect(page.getByText(/^\#\d+$/).first()).toBeVisible();
  });

  test("invoice link from client detail goes to invoice detail", async ({ page }) => {
    await page.goto("/dashboard/clients");
    const rowsPerPage = page.getByRole("combobox", { name: "Rows per page" });
    await rowsPerPage.click();
    await page.getByRole("option", { name: "50" }).click();
    await page.locator('a[href^="/dashboard/clients/"]').first().click();
    await page.waitForURL(/\/dashboard\/clients\//);

    // Click first invoice number
    await page.getByText(/^\#\d+$/).first().click();
    await page.waitForURL(/\/dashboard\/invoices\//);
    await expect(page.getByText(/^Invoice #\d+$/)).toBeVisible();
  });
});
