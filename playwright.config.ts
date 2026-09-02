import { defineConfig, devices } from "@playwright/test";

/**
 * E2E: requiere Supabase configurado en `.env.local` y `npm run db:seed` corrido.
 * Levanta el dev server automáticamente.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: process.env.NEXT_PUBLIC_APP_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: process.env.NEXT_PUBLIC_APP_BASE_URL ?? "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
