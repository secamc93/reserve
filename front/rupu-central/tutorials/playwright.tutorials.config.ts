import { defineConfig } from "@playwright/test";

// Graba los videos tutoriales del panel (no son pruebas: no corren con pnpm test:e2e).
//   pnpm tutorials   → tutorials/.output/<escena>/video.webm → scripts/build-tutorials.sh → public/tutoriales
// Necesita el front y el back locales levantados y la propiedad de demostración (datos ficticios).
export default defineConfig({
  testDir: ".",
  testMatch: /.*\.tutorial\.ts/,
  outputDir: "./.output",
  globalSetup: "./setup.ts",
  workers: 1,
  timeout: 180_000,
  reporter: "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3005",
    storageState: "tutorials/.output/state.json",
    viewport: { width: 1280, height: 720 },
    video: { mode: "on", size: { width: 1280, height: 720 } },
    launchOptions: { slowMo: 120 },
    locale: "es-CO",
    timezoneId: "America/Bogota",
  },
});
