import { test, expect } from "@playwright/test";

test.describe("Invoice dialog", () => {
  test("new invoice dialog opens from invoices page", async ({ page }) => {
    await page.goto("/dashboard/invoices");
    await page.getByRole("button", { name: "New Invoice" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading", { name: "New Invoice" })).toBeVisible();
  });

  test("client combobox is present in dialog", async ({ page }) => {
    await page.goto("/dashboard/invoices");
    await page.getByRole("button", { name: "New Invoice" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByPlaceholder("Select a client")).toBeVisible();
  });

  test("status select defaults to sent", async ({ page }) => {
    await page.goto("/dashboard/invoices");
    await page.getByRole("button", { name: "New Invoice" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("combobox", { name: "Status" })).toBeVisible();
  });

  test("items editor shows add item button", async ({ page }) => {
    await page.goto("/dashboard/invoices");
    await page.getByRole("button", { name: "New Invoice" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("button", { name: "Add item" })).toBeVisible();
  });
});

test.describe("Invoice items editor", () => {
  test("can add and remove items", async ({ page }) => {
    await page.goto("/dashboard/invoices");
    await page.getByRole("button", { name: "New Invoice" }).click();

    const dialog = page.getByRole("dialog");

    // Add an item
    await dialog.getByRole("button", { name: "Add item" }).click();
    const descriptions = dialog.getByPlaceholder("Description");
    await expect(descriptions).toHaveCount(2);

    // Remove first item
    await dialog.getByLabel("Remove item").first().click();
    await expect(descriptions).toHaveCount(1);
  });
});
