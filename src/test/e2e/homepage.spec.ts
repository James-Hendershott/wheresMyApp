// WHY: Basic E2E test to verify homepage loads and is interactive
// WHAT: Smoke test for CI/CD - verifies app starts and basic navigation works
// HOW: Uses Playwright to load homepage and check for key elements

import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("should load and display app title", async ({ page }) => {
    await page.goto("/");

    // Check for the app title
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Where's My"
    );
  });

  test("should have clickable feature cards", async ({ page }) => {
    await page.goto("/");

    // Check that feature cards exist
    const qrCard = page.getByText("QR Scanning");
    const rackCard = page.getByText("Visual Rack Map");
    const itemCard = page.getByText("Item Tracking");

    await expect(qrCard).toBeVisible();
    await expect(rackCard).toBeVisible();
    await expect(itemCard).toBeVisible();
  });

  test("should navigate to containers page", async ({ page }) => {
    await page.goto("/");

    // Click on Item Tracking card
    await page.getByText("Item Tracking").click();

    // Should navigate to containers page
    await expect(page).toHaveURL("/containers");
  });

  test("should have working navbar", async ({ page }) => {
    await page.goto("/");

    // Check navbar exists
    const navbar = page.getByRole("navigation");
    await expect(navbar).toBeVisible();

    // Check navbar brand link
    await expect(page.getByText("Where's My...?").first()).toBeVisible();
  });
});
