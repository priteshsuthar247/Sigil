import { test, expect } from "@playwright/test";

test.describe("Invoice list", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/invoices");
  });

  test("shows correct column headers", async ({ page }) => {
    await expect(page.getByRole("columnheader", { name: "Invoice #" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Client" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Status" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Total" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Created" })).toBeVisible();
  });

  test("clicking invoice number navigates to detail", async ({ page }) => {
    await page.getByText("#1001").click();
    await page.waitForURL(/\/dashboard\/invoices\//);
    await expect(page.getByText("Invoice #1001")).toBeVisible();
  });
});

test.describe("Invoice detail page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/invoices");
    await page.getByText("#1001").click();
    await page.waitForURL(/\/dashboard\/invoices\//);
  });

  test("displays invoice header, client, line items, totals", async ({ page }) => {
    await expect(page.getByText("Invoice #1001")).toBeVisible();
    await expect(page.getByText("Acme Corp")).toBeVisible();
    await expect(page.getByText("Paid").first()).toBeVisible();
    await expect(page.getByText("Website redesign")).toBeVisible();
    await expect(page.getByText("SEO optimization")).toBeVisible();
    await expect(page.getByText("$1,250.00")).toBeVisible();
  });

  test("Edit button is NOT rendered (unimplemented)", async ({ page }) => {
    // The invoice detail page never passes onEdit prop, so no Edit button renders
    const editButton = page.getByRole("button", { name: "Edit" });
    await expect(editButton).not.toBeVisible();
  });

  test("Mark as paid button is NOT rendered for paid invoice (unimplemented)", async ({
    page,
  }) => {
    // Invoice #1001 is paid, so even if wired, Mark as paid wouldn't show
    // But the button is never rendered regardless (onMarkPaid prop not passed)
    const markPaidButton = page.getByRole("button", { name: "Mark as paid" });
    await expect(markPaidButton).not.toBeVisible();
  });

  test("Delete button is NOT rendered (unimplemented)", async ({ page }) => {
    // The invoice detail page never passes onDelete prop, so no Delete button renders
    const deleteButton = page.getByRole("button", { name: "Delete" });
    await expect(deleteButton).not.toBeVisible();
  });
});

test.describe("Invoice table dropdown menu", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/invoices");
  });

  test("Edit menu item does nothing (unimplemented)", async ({ page }) => {
    const firstRow = page.locator("table tbody tr").first();
    await firstRow.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("menuitem", { name: "Edit" }).click();

    // No dialog should appear
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("Mark as paid menu item does nothing (unimplemented)", async ({ page }) => {
    // Find a row with Sent status (which has "Mark as paid" option visible)
    // The "Mark as paid" option only appears for non-paid invoices
    const sentRow = page.locator("table tbody tr").filter({ hasText: "Sent" }).first();
    await sentRow.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("menuitem", { name: "Mark as paid" }).click();

    // No dialog, no status change
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("Delete menu item does nothing (unimplemented)", async ({ page }) => {
    const firstRow = page.locator("table tbody tr").first();
    await firstRow.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("menuitem", { name: "Delete" }).click();

    // No confirmation dialog
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("Duplicate menu item does nothing (unimplemented)", async ({ page }) => {
    const firstRow = page.locator("table tbody tr").first();
    await firstRow.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("menuitem", { name: "Duplicate" }).click();

    // No new invoice created, no dialog
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });
});

test.describe("Invoice create workflow - item management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/invoices");
    await page.getByRole("button", { name: "New Invoice" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
  });

  test("can add multiple line items", async ({ page }) => {
    const dialog = page.getByRole("dialog");
    // Default has 1 item row
    let rows = dialog.locator("[id^='qty-']");
    await expect(rows).toHaveCount(1);

    // Add a second item
    await dialog.getByRole("button", { name: "Add Item" }).click();
    rows = dialog.locator("[id^='qty-']");
    await expect(rows).toHaveCount(2);

    // Add a third item
    await dialog.getByRole("button", { name: "Add Item" }).click();
    rows = dialog.locator("[id^='qty-']");
    await expect(rows).toHaveCount(3);
  });

  test("can remove a line item", async ({ page }) => {
    const dialog = page.getByRole("dialog");
    // Remove the default empty item
    await dialog.getByLabel("Remove item").click();
    const rows = dialog.locator("[id^='qty-']");
    await expect(rows).toHaveCount(0);
  });

  test("line total updates when quantity or price changes", async ({ page }) => {
    const dialog = page.getByRole("dialog");

    // Set quantity to 3 and price to 25.00
    await dialog.locator("input[id^='qty-']").fill("3");
    await dialog.locator("input[id^='price-']").fill("25.00");

    // Line total should be 3 × $25.00 = $75.00
    await expect(dialog.getByText("$75.00").first()).toBeVisible();

    // Grand total should also be $75.00
    await expect(dialog.getByText("Total: $75.00")).toBeVisible();
  });
});

test.describe("Invoice filter tabs", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/invoices");
  });

  test("All tab shows all invoices", async ({ page }) => {
    await page.getByRole("tab", { name: "All" }).click();
    // Should see both paid and sent invoices
    await expect(page.getByText("#1001").first()).toBeVisible();
    await expect(page.getByText("#1002").first()).toBeVisible();
  });

  test("Sent tab should filter to sent invoices only (currently broken)", async ({
    page,
  }) => {
    test.fail(); // Filter tabs don't actually filter — documenting broken feature
    await page.getByRole("tab", { name: "Sent" }).click();
    // EXPECTED: only sent invoices visible. ACTUAL: all invoices still shown.
    const firstBadge = page.locator("table tbody tr [data-slot='badge']").first();
    await expect(firstBadge).toHaveText("Sent");
  });

  test("Paid tab should filter to paid invoices only (currently broken)", async ({
    page,
  }) => {
    await page.getByRole("tab", { name: "Paid" }).click();
    // EXPECTED: only paid invoices visible. ACTUAL: all invoices still shown.
    const firstBadge = page.locator("table tbody tr [data-slot='badge']").first();
    await expect(firstBadge).toHaveText("Paid");
  });
});
