import { expect, test } from "@playwright/test";
import { EMAIL, login, requireCredentials, submitLogin } from "./helpers";

// Login por la UI contra el back de E2E_API_URL / el front de PLAYWRIGHT_BASE_URL.
//   E2E_EMAIL=... E2E_PASSWORD=... E2E_API_URL=http://localhost:3060/api/v1 \
//   PLAYWRIGHT_BASE_URL=http://localhost:3010 pnpm test:e2e e2e/auth-login.spec.ts

test("login con usuario válido llega al selector de módulo o al home", async ({ page }) => {
  await login(page);

  // Super admin -> /select-type; usuario con negocios de un solo tipo -> home del tipo (/properties).
  await expect(page).toHaveURL(/\/(select-type|properties|home)(\/|$|\?)/);
  if (new URL(page.url()).pathname === "/select-type") {
    await expect(page.getByRole("heading", { name: "Selecciona un Modulo" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Propiedad Horizontal/ })).toBeVisible();
  }
});

test("login con clave errónea muestra el error y se queda en /login", async ({ page }) => {
  requireCredentials();
  await submitLogin(page, EMAIL, `clave-erronea-${Date.now()}`);

  // El mensaje de error no tiene role="alert": se busca por su texto (viene del back).
  await expect(page.getByText(/credenciales inv[aá]lidas/i)).toBeVisible({ timeout: 15_000 });
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole("button", { name: "Iniciar Sesión" })).toBeVisible();
});
