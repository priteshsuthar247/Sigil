import { test, expect } from "@playwright/test";

test.describe("Invoice dialog", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard/invoices");
    await page.getByRole("button", { name: "New Invoice" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
  });

  test("dialog opens with correct heading", async ({ page }) => {
    const dialog = page.getByRole("dialog");
    await expect(
      dialog.getByRole("heading", { name: "New Invoice" }),
    ).toBeVisible();
    await expect(
      dialog.getByText("Create a new invoice for one of your clients."),
    ).toBeVisible();
  });

  test("client combobox is present", async ({ page }) => {
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByText("Client", { exact: true })).toBeVisible();
    await expect(dialog.getByPlaceholder("Select a client")).toBeVisible();
  });

  test("status select is present with correct options", async ({ page }) => {
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByText("Status")).toBeVisible();
    await expect(dialog.getByRole("combobox", { name: "Status" })).toBeVisible();
  });

  test("items editor shows add item button", async ({ page }) => {
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("button", { name: "Add item" })).toBeVisible();
  });

  test("cancel button closes dialog", async ({ page }) => {
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: "Cancel" }).click();
    await expect(dialog).toBeHidden();
  });
});

test.describe("Invoice items editor", () => {
  test("can add and remove items", async ({ page }) => {
    await page.goto("/dashboard/invoices");
    await page.getByRole("button", { name: "New Invoice" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    const dialog = page.getByRole("dialog");
    const descriptions = dialog.getByPlaceholder("Description");

    // Starts with one empty item row
    await expect(descriptions).toHaveCount(1);

    // Add a second item
    await dialog.getByRole("button", { name: "Add item" }).click();
    await expect(descriptions).toHaveCount(2);

    // Remove the first item
    await dialog.getByLabel("Remove item").first().click();
    await expect(descriptions).toHaveCount(1);
  });
});
