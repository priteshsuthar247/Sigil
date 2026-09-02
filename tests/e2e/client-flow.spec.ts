import { test, expect } from "@playwright/test";

test.describe("Client list", () => {
  test("page loads with new client button", async ({ page }) => {
    await page.goto("/dashboard/clients");
    await expect(
      page.getByRole("button", { name: "New Client" }),
    ).toBeVisible();
  });

  test("new client dialog opens", async ({ page }) => {
    await page.goto("/dashboard/clients");
    await page.getByRole("button", { name: "New Client" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading", { name: "New Client" })).toBeVisible();
  });

  test("dialog has name and email fields", async ({ page }) => {
    await page.goto("/dashboard/clients");
    await page.getByRole("button", { name: "New Client" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog.getByLabel("Name")).toBeVisible();
    await expect(dialog.getByLabel("Email")).toBeVisible();
    await expect(dialog.getByLabel("Phone")).toBeVisible();
    await expect(dialog.getByLabel("Address")).toBeVisible();
  });

  test("cancel closes dialog", async ({ page }) => {
    await page.goto("/dashboard/clients");
    await page.getByRole("button", { name: "New Client" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Cancel" }).click();
    await expect(dialog).toBeHidden();
  });
});
