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
    await page.getByRole("button", { name: "Acme Corp" }).click();
    await page.waitForURL(/\/dashboard\/clients\//);
    await expect(page.getByText("billing@acme.com")).toBeVisible();
  });
});

test.describe("Client detail page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/clients");
    // Ensure all clients are visible
    const rowsPerPage = page.getByRole("combobox", { name: "Rows per page" });
    await rowsPerPage.click();
    await page.getByRole("option", { name: "50" }).click();
    await page.getByRole("button", { name: "Acme Corp" }).click();
    await page.waitForURL(/\/dashboard\/clients\//);
  });

  test("displays all client fields", async ({ page }) => {
    await expect(page.getByText("billing@acme.com")).toBeVisible();
    await expect(page.getByText("+1-555-0101")).toBeVisible();
    await expect(page.getByText("123 Business Ave")).toBeVisible();
  });

  test("Edit button opens dialog and saves changes", async ({ page }) => {
    await page.getByRole("button", { name: "Edit" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Clear name and type new one
    const nameInput = dialog.getByLabel("Name");
    await nameInput.clear();
    await nameInput.fill("Acme Corp Updated");
    await dialog.getByRole("button", { name: "Save changes" }).click();

    // Dialog should close and name should update
    await expect(dialog).toBeHidden({ timeout: 10000 });
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("Acme Corp Updated").first()).toBeVisible();

    // Restore original name
    await page.getByRole("button", { name: "Edit" }).click();
    const editDialog = page.getByRole("dialog");
    await expect(editDialog).toBeVisible();
    const editNameInput = editDialog.getByLabel("Name");
    await editNameInput.clear();
    await editNameInput.fill("Acme Corp");
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

  test("Delete confirmation does NOT actually delete (unimplemented)", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Delete" }).click();
    const confirmDialog = page.getByRole("alertdialog");
    await expect(confirmDialog).toBeVisible();

    // Click the Delete action button — it has no onClick handler, so nothing happens
    // The dialog stays open and the client is not deleted
    await confirmDialog.getByRole("button", { name: "Delete" }).click();
    // Dialog stays open because AlertDialogAction has no handler
    await expect(confirmDialog).toBeVisible();

    // Cancel to clean up
    await confirmDialog.getByRole("button", { name: "Cancel" }).click();
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
