import { test, expect } from "@playwright/test";

test.describe("Create client workflow", () => {
  test("creates a new client and it appears in the list", async ({ page }) => {
    const uniqueId = Date.now();
    const email = `test-${uniqueId}@corp.com`;

    // 1. Navigate to clients list
    await page.goto("/dashboard/clients");

    // 2. Open new client dialog
    await page.getByRole("button", { name: "New Client" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // 3. Fill in the form
    await dialog.getByLabel("Name").fill("Test Corp");
    await dialog.getByLabel("Email").fill(email);
    await dialog.getByLabel("Phone").fill("+1-555-9999");
    await dialog.getByLabel("Address").fill("100 Test Ave, Testville");

    // 4. Submit the form
    await dialog.getByRole("button", { name: "Create" }).click();

    // 5. Dialog should close
    await expect(dialog).toBeHidden({ timeout: 10000 });

    // 6. Navigate back to clients list to see the new client (revalidated)
    await page.goto("/dashboard/clients");

    // Show all rows to avoid pagination issues — set rows per page to 50
    const rowsPerPageCombo = page.getByRole("combobox", { name: "Rows per page" });
    await rowsPerPageCombo.click();
    await page.getByRole("option", { name: "50" }).click();

    await expect(page.getByText(email).first()).toBeVisible();
  });

  test("validates required fields", async ({ page }) => {
    await page.goto("/dashboard/clients");
    await page.getByRole("button", { name: "New Client" }).click();

    const dialog = page.getByRole("dialog");

    // Try to submit empty form
    await dialog.getByRole("button", { name: "Create" }).click();

    // Should show validation errors
    await expect(dialog.getByText("Name is required")).toBeVisible();
    await expect(dialog.getByText("Invalid email address")).toBeVisible();
  });
});

test.describe("Create invoice workflow", () => {
  test("creates a new invoice and it appears in the list", async ({ page }) => {
    // 1. Navigate to invoices list
    await page.goto("/dashboard/invoices");

    // 2. Open new invoice dialog
    await page.getByRole("button", { name: "New Invoice" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // 3. Select a client from the combobox
    await dialog.getByPlaceholder("Select a client").click();
    await page.getByRole("option").first().click();

    // 4. Fill in item details
    await dialog.getByPlaceholder("Description").fill("E2E Test Service");

    // Set quantity to 2 (input has id starting with "qty-")
    await dialog.locator("input[id^='qty-']").fill("2");

    // Set price to 50.00 (stored as 5000 cents, input has id starting with "price-")
    await dialog.locator("input[id^='price-']").fill("50.00");

    // 5. Submit the form
    await dialog.getByRole("button", { name: "Create" }).click();

    // 6. Dialog should close
    await expect(dialog).toBeHidden({ timeout: 10000 });

    // 7. Navigate back to invoices list to see the new invoice
    await page.goto("/dashboard/invoices");

    // The new invoice should appear — check for the total amount ($100.00)
    await expect(page.getByText("$100.00").first()).toBeVisible();
  });

  test("validates client selection is required", async ({ page }) => {
    await page.goto("/dashboard/invoices");
    await page.getByRole("button", { name: "New Invoice" }).click();

    const dialog = page.getByRole("dialog");

    // Try to submit without selecting a client
    await dialog.getByRole("button", { name: "Create" }).click();

    // Should show error
    await expect(dialog.getByText("Please select a client")).toBeVisible();
  });

  test("validates at least one item is required", async ({ page }) => {
    await page.goto("/dashboard/invoices");
    await page.getByRole("button", { name: "New Invoice" }).click();

    const dialog = page.getByRole("dialog");

    // Select a client
    await dialog.getByPlaceholder("Select a client").click();
    await page.getByRole("option").first().click();

    // Remove the default empty item
    await dialog.getByLabel("Remove item").click();

    // Try to submit
    await dialog.getByRole("button", { name: "Create" }).click();

    // Should show error
    await expect(dialog.getByText("At least one item")).toBeVisible();
  });
});
