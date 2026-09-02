import { test, expect } from "@playwright/test";

test.describe("Client list", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/clients");
  });

  test("displays seeded clients in table", async ({ page }) => {
    // Use .first() because client names may appear in multiple places
    await expect(page.getByText("Acme Corp").first()).toBeVisible();
    await expect(page.getByText("Globex Corporation").first()).toBeVisible();
    await expect(page.getByText("Initech").first()).toBeVisible();
    await expect(page.getByText("Umbrella Inc").first()).toBeVisible();
    await expect(page.getByText("Stark Industries").first()).toBeVisible();
    await expect(page.getByText("Wayne Enterprises").first()).toBeVisible();
  });

  test("shows client emails", async ({ page }) => {
    await expect(page.getByText("billing@acme.com").first()).toBeVisible();
    await expect(page.getByText("accounts@globex.com").first()).toBeVisible();
  });
});

test.describe("Client detail", () => {
  test("shows correct client data from database", async ({ page }) => {
    // Navigate to clients list and click Acme Corp
    await page.goto("/dashboard/clients");
    await page.getByText("Acme Corp").first().click();
    await page.waitForURL(/\/dashboard\/clients\//);

    // Verify client info
    await expect(page.getByText("billing@acme.com")).toBeVisible();
    await expect(page.getByText("+1-555-0101")).toBeVisible();
    await expect(page.getByText("123 Business Ave")).toBeVisible();
  });

  test("shows client's invoices", async ({ page }) => {
    // Acme Corp has invoices #1001 and #1007
    await page.goto("/dashboard/clients");
    await page.getByText("Acme Corp").first().click();
    await page.waitForURL(/\/dashboard\/clients\//);

    // Should show their invoices
    await expect(page.getByText("#1001")).toBeVisible();
    await expect(page.getByText("#1007")).toBeVisible();
  });

  test("invoice link from client detail goes to invoice detail", async ({ page }) => {
    await page.goto("/dashboard/clients");
    await page.getByText("Acme Corp").first().click();
    await page.waitForURL(/\/dashboard\/clients\//);

    // Click on invoice #1001
    await page.getByText("#1001").click();
    await page.waitForURL(/\/dashboard\/invoices\//);
    await expect(page.getByText("Invoice #1001")).toBeVisible();
  });
});
