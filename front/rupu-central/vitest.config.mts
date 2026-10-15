import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

// Alias equivalentes a "paths" de tsconfig.json: si se agrega uno allá, agregarlo aquí.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@modules": path.resolve(import.meta.dirname, "./src/services"),
      "@shared": path.resolve(import.meta.dirname, "./src/shared"),
      "@config": path.resolve(import.meta.dirname, "./src/config"),
      "@app": path.resolve(import.meta.dirname, "./src/app"),
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    testTimeout: 15_000,
    // Los flujos punta a punta son de Playwright (e2e/), no de vitest.
    exclude: ["node_modules/**", "e2e/**", ".next/**"],
    reporters: process.env.CI ? ["default", "junit"] : ["default"],
    outputFile: { junit: "./reports/junit.xml" },
  },
});
