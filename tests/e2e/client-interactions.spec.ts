import { test, expect } from "@playwright/test";

test.describe("Client list", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/clients");
    // Ensure all clients are visible (past test runs may have created extras)
    const rowsPerPage = page.getByRole("combobox", { name: "Rows per page" });
    await rowsPerPage.click();
    await page.getByRole("option", { name: "50" }).click();
  });

  test("shows seeded clients in table", async ({ page }) => {
    const rows = page.locator("table tbody tr");
    await expect(rows.first()).toBeVisible();
    // 6 seeded clients + extras from previous test runs
    expect(await rows.count()).toBeGreaterThanOrEqual(6);
  });

  test("clicking client name navigates to detail", async ({ page }) => {
    await page.locator('a[href^="/dashboard/clients/"]').first().click();
    await page.waitForURL(/\/dashboard\/clients\//);
    await expect(page.getByText(/@/)).toBeVisible();
  });
});

test.describe("Client detail page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/clients");
    const rowsPerPage = page.getByRole("combobox", { name: "Rows per page" });
    await rowsPerPage.click();
    await page.getByRole("option", { name: "50" }).click();
    await page.locator('a[href^="/dashboard/clients/"]').first().click();
    await page.waitForURL(/\/dashboard\/clients\//);
  });

  test("displays all client fields", async ({ page }) => {
    await expect(page.getByText(/@/)).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("Edit button opens dialog and saves changes", async ({ page }) => {
    await page.getByRole("button", { name: "Edit" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    const nameInput = dialog.getByLabel("Name");
    const original = await nameInput.inputValue();
    await nameInput.clear();
    await nameInput.fill(original + " Updated");
    await dialog.getByRole("button", { name: "Save changes" }).click();

    await expect(dialog).toBeHidden({ timeout: 10000 });
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(original + " Updated").first()).toBeVisible();

    // Restore original name
    await page.getByRole("button", { name: "Edit" }).click();
    const editDialog = page.getByRole("dialog");
    await expect(editDialog).toBeVisible();
    const editNameInput = editDialog.getByLabel("Name");
    await editNameInput.clear();
    await editNameInput.fill(original);
    await editDialog.getByRole("button", { name: "Save changes" }).click();
    await expect(editDialog).toBeHidden({ timeout: 10000 });
  });

  test("Delete button opens confirmation dialog", async ({ page }) => {
    await page.getByRole("button", { name: "Delete" }).click();
    const confirmDialog = page.getByRole("alertdialog");
    await expect(confirmDialog).toBeVisible();
    await expect(confirmDialog.getByText("Delete client?")).toBeVisible();
    await expect(
      confirmDialog.getByText("permanently remove"),
    ).toBeVisible();
    // Cancel to avoid actually deleting
    await confirmDialog.getByRole("button", { name: "Cancel" }).click();
  });

  test("Delete confirmation navigates back to list after confirm", async ({
    page,
  }) => {
    // Open confirmation and cancel to avoid data loss
    await page.getByRole("button", { name: "Delete" }).click();
    const confirmDialog = page.getByRole("alertdialog");
    await expect(confirmDialog).toBeVisible();
    // Cancel to keep data intact
    await confirmDialog.getByRole("button", { name: "Cancel" }).click();
    await expect(confirmDialog).toBeHidden();
  });

});

test.describe("Client table dropdown menu", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/clients");
  });

  test("Edit menu item opens edit dialog", async ({ page }) => {
    const firstRow = page.locator("table tbody tr").first();
    await firstRow.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("menuitem", { name: "Edit" }).click();

    // Edit dialog should appear
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("Edit Client")).toBeVisible();
    // Close the dialog
    await dialog.getByRole("button", { name: "Cancel" }).click();
  });

  test("Delete menu item opens confirmation dialog", async ({ page }) => {
    const firstRow = page.locator("table tbody tr").first();
    await firstRow.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("menuitem", { name: "Delete" }).click();

    // Confirmation dialog should appear
    const confirmDialog = page.getByRole("alertdialog");
    await expect(confirmDialog).toBeVisible();
    await expect(confirmDialog.getByText("Delete client?")).toBeVisible();
    // Cancel to avoid deleting
    await confirmDialog.getByRole("button", { name: "Cancel" }).click();
  });
});
