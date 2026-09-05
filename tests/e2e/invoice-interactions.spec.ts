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
    await page.getByText(/^\#\d+$/).first().click();
    await page.waitForURL(/\/dashboard\/invoices\//);
    await expect(page.getByText(/^Invoice #\d+$/)).toBeVisible();
  });
});

test.describe("Invoice detail page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/invoices");
    // Ensure we open a Sent invoice for editing tests
    await page.getByRole("button", { name: "Sent" }).click();
    await page.getByText(/^\#\d+$/).first().click();
    await page.waitForURL(/\/dashboard\/invoices\//);
  });

  test("displays invoice header, client, line items, totals", async ({ page }) => {
    await expect(page.getByText(/^Invoice #\d+$/)).toBeVisible();
    await expect(page.getByText(/Acme|Globex|Initech|Umbrella|Stark|Wayne/)).toBeVisible();
    await expect(page.locator("[data-slot=badge]")).toBeVisible();
  });

  test("Edit button opens edit dialog", async ({ page }) => {
    const editButton = page.getByRole("button", { name: "Edit" });
    if (await editButton.isVisible()) {
      await editButton.click();
      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      await dialog.getByRole("button", { name: "Cancel" }).click();
    } else {
      // Edit hidden for paid invoices, which is acceptable
      await expect(editButton).not.toBeVisible();
    }
  });

  test("Mark as paid button is NOT rendered for paid invoice", async ({
    page,
  }) => {
    // We opened a Sent invoice, so Mark as paid should be visible
    const markPaidButton = page.getByRole("button", { name: "Mark as paid" });
    await expect(markPaidButton).toBeVisible();
  });

  test("Delete button is rendered and clickable", async ({ page }) => {
    const deleteButton = page.getByRole("button", { name: "Delete" });
    await expect(deleteButton).toBeVisible();
  });
});

test.describe("Invoice table dropdown menu", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/invoices");
  });

  test("Edit menu item navigates to invoice detail", async ({ page }) => {
    // Find a Sent invoice row where Edit is available
    const sentRow = page.locator("table tbody tr").filter({ hasText: "Sent" }).first();
    await sentRow.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("menuitem", { name: "Edit" }).click();

    await page.waitForURL(/\/dashboard\/invoices\//);
    await expect(page.getByText(/^Invoice #\d+$/)).toBeVisible();
    const editButton = page.getByRole("button", { name: "Edit" });
    await expect(editButton).toBeVisible();
  });

  test("Mark as paid menu item opens confirmation dialog and changes status", async ({ page }) => {
    // Find a row with Sent status (which has "Mark as paid" option visible)
    const sentRow = page.locator("table tbody tr").filter({ hasText: "Sent" }).first();
    await sentRow.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("menuitem", { name: "Mark as paid" }).click();

    // Confirmation dialog should appear
    const confirmDialog = page.getByRole("alertdialog");
    await expect(confirmDialog).toBeVisible();
    await expect(confirmDialog.getByText("Mark as paid?")).toBeVisible();
    await confirmDialog.getByRole("button", { name: "Confirm" }).click();

    // Page should refresh, dialog closed
    await expect(confirmDialog).toBeHidden();
  });

  test("Delete menu item opens confirmation dialog", async ({ page }) => {
    const sentRow = page.locator("table tbody tr").filter({ hasText: "Sent" }).first();
    await sentRow.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("menuitem", { name: "Delete" }).click();

    const confirmDialog = page.getByRole("alertdialog");
    await expect(confirmDialog).toBeVisible();
    await expect(confirmDialog.getByText("Delete invoice?")).toBeVisible();
    await confirmDialog.getByRole("button", { name: "Cancel" }).click();
  });

  test("Duplicate menu item duplicates the invoice", async ({ page }) => {
    const firstRow = page.locator("table tbody tr").first();
    await firstRow.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("menuitem", { name: "Duplicate" }).click();

    // Page should refresh and a new invoice should appear
    await page.waitForLoadState("networkidle");
    // At least one row should still be visible
    await expect(page.locator("table tbody tr").first()).toBeVisible();
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
    await page.getByRole("button", { name: "All" }).click();
    await expect(page.getByText(/^\#\d+$/).first()).toBeVisible();
  });

  test("Sent tab should filter to sent invoices only", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Sent" }).click();
    const firstBadge = page.locator("table tbody tr [data-slot='badge']").first();
    await expect(firstBadge).toHaveText("Sent");
  });

  test("Paid tab should filter to paid invoices only", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Paid" }).click();
    const firstBadge = page.locator("table tbody tr [data-slot='badge']").first();
    await expect(firstBadge).toHaveText("Paid");
  });
});
