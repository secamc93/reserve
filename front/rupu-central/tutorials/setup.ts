import { chromium, type FullConfig } from "@playwright/test";
import { mkdirSync } from "node:fs";

// Inicia sesión una vez (sin grabar) y guarda la sesión para que los videos empiecen ya adentro.
export default async function setup(config: FullConfig) {
  const baseURL = config.projects[0].use.baseURL as string;
  const email = process.env.E2E_EMAIL;
  const password = process.env.E2E_PASSWORD;
  if (!email || !password) throw new Error("Faltan E2E_EMAIL y E2E_PASSWORD (usuario de pruebas local)");
  mkdirSync("tutorials/.output", { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ baseURL });
  await page.goto("/login");
  await page.getByLabel("Correo Electrónico").fill(email);
  await page.getByLabel("Contraseña", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Iniciar Sesión" }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 30_000 });
  // Deja abierta la propiedad de demostración (datos ficticios) para que los videos entren directo.
  await page.goto("/properties");
  const demo = process.env.DEMO_PROPERTY ?? "Conjunto Los Almendros";
  await page.getByRole("button", { name: new RegExp(`^${demo}`) }).click();
  await page.waitForURL(/\/properties\/\d+$/, { timeout: 30_000 });
  await page.context().storageState({ path: "tutorials/.output/state.json" });
  await browser.close();
}
