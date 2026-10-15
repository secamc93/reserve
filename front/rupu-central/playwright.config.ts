import { defineConfig, devices } from "@playwright/test";

// Flujos punta a punta en e2e/<area>-<flujo>.spec.ts. Corren contra un front y un back ya levantados:
//   PLAYWRIGHT_BASE_URL  front (por defecto http://localhost:3000)
//   E2E_API_URL          back, con /api/v1 (lo usan los helpers de API de los specs)
//   E2E_EMAIL / E2E_PASSWORD  usuario de pruebas (nunca se escriben en el código)
export default defineConfig({
  testDir: "./e2e",
  reporter: process.env.CI ? [["junit", { outputFile: "reports/e2e-junit.xml" }], ["list"]] : "list",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
