import { expect, test } from "@playwright/test";

test.describe("Restaurant browsing", () => {
  test("lists 24 restaurants and supports load-more", async ({ page }) => {
    await page.goto("/restaurants");
    // The header tells us the total + how many are showing.
    await expect(page.getByRole("heading", { name: /discover restaurants/i })).toBeVisible();

    // Initially 24 cards are rendered (selector: any Link to /restaurants/<slug>).
    const cards = page.locator('a[href^="/restaurants/"]');
    await expect.poll(() => cards.count(), { timeout: 10_000 }).toBeGreaterThanOrEqual(24);

    // Scrolling once should auto-load the next page → 48 cards.
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect.poll(() => cards.count(), { timeout: 10_000 }).toBeGreaterThanOrEqual(48);
  });

  test("filter by cuisine narrows results", async ({ page }) => {
    await page.goto("/restaurants");
    // Wait for the initial load to settle (cards visible).
    await expect(page.locator('a[href^="/restaurants/"]').first()).toBeVisible({ timeout: 10_000 });

    await page.getByRole("button", { name: "Japanese", exact: true }).click();
    await expect(page).toHaveURL(/cuisine=Japanese/);

    // Wait for the network call to complete and the new card set to render.
    const cards = page.locator('a[href^="/restaurants/"]');
    await expect.poll(() => cards.count(), { timeout: 10_000, intervals: [500, 1000] }).toBeGreaterThan(0);
    const finalCount = await cards.count();
    expect(finalCount).toBeLessThan(50);
  });

  test("price filter shows real numbers (not ₹ symbols)", async ({ page }) => {
    await page.goto("/restaurants");
    await expect(page.getByRole("button", { name: /under ₹200/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /under ₹1500/i })).toBeVisible();
  });

  test("restaurant detail shows popular + full menu", async ({ page }) => {
    await page.goto("/restaurants");
    const firstCard = page.locator('a[href^="/restaurants/"]').first();
    await firstCard.click();
    await page.waitForURL(/\/restaurants\/[^/]+/);
    await expect(page.getByRole("heading", { name: /most ordered/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /full menu/i })).toBeVisible();
  });
});
