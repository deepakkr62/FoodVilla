import { expect, test } from "@playwright/test";

/**
 * Golden path: signup → browse → add to cart → checkout → place COD order
 * → land on order page with status "placed".
 */
test("customer can place a COD order end-to-end", async ({ page }) => {
  // Unique email so the test is repeatable.
  const email = `e2e-${Date.now()}@demo.local`;

  // 1. Sign up as a customer
  await page.goto("/signup");
  await page.getByLabel(/full name/i).fill("E2E Customer");
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill("supersecret");
  await page.getByRole("button", { name: /create account/i }).click();
  // After signup we land on home as a customer.
  await page.waitForURL("**/", { timeout: 15_000 });

  // 2. Open the restaurants list and pick a place that has a low minimum order.
  await page.goto("/restaurants");
  // Pre-existing seed includes "South Stories" with a low ₹120 min order.
  // Filter to Budget tier so we have minimal cost.
  await page.getByRole("button", { name: /under ₹200/i }).click();
  await page.waitForLoadState("networkidle");

  const firstCard = page.locator('a[href^="/restaurants/"]').first();
  await firstCard.click();
  await page.waitForURL(/\/restaurants\/[^/]+/);

  // Wait for the menu to render (the Full menu heading shows once dishes load).
  await expect(page.getByRole("heading", { name: /full menu/i })).toBeVisible({ timeout: 15_000 });

  // 3. Add several items to clear the min-order threshold.
  // Each click turns its button into a quantity stepper, so the locator returns
  // the next available Add button as we keep selecting `.first()`.
  const addButtons = page.getByRole("button", { name: /to cart/i });
  await expect.poll(() => addButtons.count(), { timeout: 10_000 }).toBeGreaterThan(0);
  const initialCount = await addButtons.count();
  for (let i = 0; i < Math.min(4, initialCount); i += 1) {
    await addButtons.first().click();
    await page.waitForTimeout(250);
  }

  // 4. Go to /cart
  await page.goto("/cart");
  await expect(page.getByRole("heading", { name: /your cart/i })).toBeVisible();

  // 5. Proceed to checkout
  await page.getByRole("link", { name: /proceed to checkout/i }).click();
  await page.waitForURL("**/checkout");

  // 6. Add a delivery address
  await page.getByRole("button", { name: /^add$/i }).first().click();
  await page.getByLabel(/address line 1/i).fill("12 E2E Test Road");
  await page.getByLabel(/^city$/i).fill("Pune");
  await page.getByLabel(/postal code/i).fill("411001");
  await page.getByRole("button", { name: /add address/i }).click();

  // 7. Choose cash on delivery + place order
  await page.getByLabel(/cash on delivery/i).check();
  await page.getByRole("button", { name: /place order/i }).click();

  // 8. Land on the order page with a status tracker
  await page.waitForURL(/\/orders\/[a-f0-9]+/, { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: /order confirmed/i })).toBeVisible();
  // "Order placed" appears both in the status pill and the tracker — first() is enough.
  await expect(page.getByText(/^order placed$/i).first()).toBeVisible();
});
