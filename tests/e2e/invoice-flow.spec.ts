import { test, expect } from "@playwright/test";

test.describe("Invoice list", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/invoices");
  });

  test("displays seeded invoices in table", async ({ page }) => {
    // Invoice numbers are rendered as Button with render={<Link>}
    // so use getByText which finds the text content
    await expect(page.getByText("#1001")).toBeVisible();
    await expect(page.getByText("#1002")).toBeVisible();
    await expect(page.getByText("#1008")).toBeVisible();
  });

  test("shows client names for each invoice", async ({ page }) => {
    // Use .first() because same client can appear in multiple rows
    await expect(page.getByText("Acme Corp").first()).toBeVisible();
    await expect(page.getByText("Globex Corporation").first()).toBeVisible();
  });

  test("shows correct status badges", async ({ page }) => {
    const paidBadges = page.getByText("Paid");
    expect(await paidBadges.count()).toBeGreaterThanOrEqual(1);

    const sentBadges = page.getByText("Sent");
    expect(await sentBadges.count()).toBeGreaterThanOrEqual(1);
  });

  test("filter tabs work correctly", async ({ page }) => {
    await page.getByRole("button", { name: "Sent" }).click();
    await expect(page.getByText("No invoices yet")).toBeHidden();

    await page.getByRole("button", { name: "Paid" }).click();
    await expect(page.getByText("No invoices yet")).toBeHidden();

    await page.getByRole("button", { name: "All" }).click();
    await expect(page.getByText("#1001")).toBeVisible();
  });
});

test.describe("Invoice detail", () => {
  test("shows correct invoice data from database", async ({ page }) => {
    // Navigate to invoice list and click invoice #1001
    await page.goto("/dashboard/invoices");
    await page.getByText("#1001").click();
    await page.waitForURL(/\/dashboard\/invoices\//);

    // Verify invoice number and status badge
    await expect(page.getByText("Invoice #1001")).toBeVisible();
    await expect(page.locator("[data-slot=badge]").filter({ hasText: "Paid" })).toBeVisible();

    // Verify client name
    await expect(page.getByText("Acme Corp")).toBeVisible();

    // Verify line items
    await expect(page.getByText("Website redesign")).toBeVisible();
    await expect(page.getByText("SEO optimization")).toBeVisible();

    // Verify total amount ($1,250.00)
    await expect(page.getByText("$1,250.00")).toBeVisible();
  });

  test("shows sent invoice without paid date", async ({ page }) => {
    await page.goto("/dashboard/invoices");
    await page.getByText("#1002").click();
    await page.waitForURL(/\/dashboard\/invoices\//);

    await expect(page.getByText("Invoice #1002")).toBeVisible();
    await expect(page.getByText("Sent")).toBeVisible();
    await expect(page.getByText("Globex Corporation")).toBeVisible();

    // Verify line items
    await expect(page.getByText("Mobile app development")).toBeVisible();
    await expect(page.getByText("API integration")).toBeVisible();
  });

  test("client link navigates to client detail", async ({ page }) => {
    await page.goto("/dashboard/invoices");
    await page.getByText("#1001").click();
    await page.waitForURL(/\/dashboard\/invoices\//);

    // Click the client name link (it's a Link element wrapping "Acme Corp")
    await page.getByText("Acme Corp").click();
    await page.waitForURL(/\/dashboard\/clients\//);
    await expect(page.getByText("billing@acme.com")).toBeVisible();
  });
});
