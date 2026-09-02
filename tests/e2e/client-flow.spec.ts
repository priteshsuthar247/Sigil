import { test, expect } from "@playwright/test";

test.describe("Client flow", () => {
  test("client list page loads", async ({ page }) => {
    await page.goto("/dashboard/clients");
    await expect(
      page.getByRole("button", { name: "New Client" }),
    ).toBeVisible();
  });

  test("new client dialog opens", async ({ page }) => {
    await page.goto("/dashboard/clients");
    await page.getByRole("button", { name: "New Client" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
  });

  test("client detail page has edit and new invoice buttons", async ({ page }) => {
    await page.goto("/dashboard/clients");

    // Find the first client link in the table
    const firstClientLink = page.locator("table tbody tr a, table tbody a").first();
    await firstClientLink.waitFor({ state: "visible", timeout: 5000 });
    await firstClientLink.click();

    // On the detail page, check for Edit button and New Invoice button
    await expect(
      page.getByRole("button", { name: "Edit" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "New Invoice" }),
    ).toBeVisible();
  });
});
