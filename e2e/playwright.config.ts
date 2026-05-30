import { defineConfig, devices } from "@playwright/test";

const FRONTEND_URL = process.env.E2E_FRONTEND_URL ?? "http://localhost:3000";

/**
 * E2E configuration for Food Villa.
 * Run locally:  npm run e2e
 * Run in CI:    npm run e2e -- --reporter=github
 */
export default defineConfig({
  testDir: ".",
  fullyParallel: false, // We share a seeded DB; sequential keeps tests deterministic.
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? "github" : "list",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: FRONTEND_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  // When E2E_SKIP_SERVERS=1, assume servers are already running (faster dev loop).
  // Otherwise start both servers using the in-memory MongoDB so the test data is
  // fresh and seeded on every run.
  webServer: process.env.E2E_SKIP_SERVERS
    ? undefined
    : [
        {
          command: "npm run start -w backend",
          cwd: "../",
          port: 5000,
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
          env: {
            USE_MEMORY_DB: "1",
            FRONTEND_URL,
            JWT_ACCESS_SECRET: "e2e-access-secret-32-chars-please-rotate-me",
            JWT_REFRESH_SECRET: "e2e-refresh-secret-32-chars-please-rotate-me",
          },
        },
        {
          command: "npm run start -w frontend",
          cwd: "../",
          port: 3000,
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
          env: {
            NEXT_PUBLIC_API_URL: "http://localhost:5000",
            NEXT_PUBLIC_SOCKET_URL: "http://localhost:5000",
          },
        },
      ],
});
