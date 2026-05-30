import { expect, test } from "@playwright/test";

test.describe("Public pages", () => {
  test("homepage loads with hero and brand", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Food Villa/i);
    await expect(page.getByRole("heading", { name: /taste the comfort/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /explore restaurants/i }).first()).toBeVisible();
  });

  test("about page shows the developer card", async ({ page }) => {
    await page.goto("/about");
    await expect(page.getByRole("heading", { name: /deepak kumar/i })).toBeVisible();
    // Email link uses aria-label "Email Deepak Kumar"; assert visible text
    await expect(page.getByText("deepakkr220399@gmail.com").first()).toBeVisible();
  });

  test("help chatbot greets and answers a question", async ({ page }) => {
    await page.goto("/help");
    await expect(page.getByRole("heading", { name: /food villa assistant/i })).toBeVisible();
    await page.getByLabel(/type your question/i).fill("how do I place an order");
    await page.getByRole("button", { name: /send/i }).click();
    // Bot's response includes "Sign in" on line 1 of the multi-line answer.
    await expect(page.getByText(/Sign in/i).last()).toBeVisible({ timeout: 5_000 });
  });

  test("legal pages render without 404", async ({ page }) => {
    for (const path of ["/privacy", "/terms", "/offers", "/careers", "/partner/restaurant", "/partner/delivery"]) {
      const resp = await page.goto(path);
      expect(resp?.status(), `${path} status`).toBeLessThan(400);
    }
  });
});
