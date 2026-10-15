import { expect, type APIRequestContext, type Page } from "@playwright/test";

// Credenciales y URL del back SOLO por variables de entorno; nunca se escriben en el código.
export const EMAIL = process.env.E2E_EMAIL ?? "";
export const PASSWORD = process.env.E2E_PASSWORD ?? "";
export const API = process.env.E2E_API_URL ?? "http://localhost:3050/api/v1";

export function requireCredentials() {
  if (!EMAIL || !PASSWORD) {
    throw new Error("Faltan E2E_EMAIL y E2E_PASSWORD (usuario de pruebas local)");
  }
}

/** Llena el formulario de /login y lo envía. No espera la navegación. */
export async function submitLogin(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Correo Electrónico").fill(email);
  await page.getByLabel("Contraseña", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Iniciar Sesión" }).click();
}

/** Login por la UI con el usuario de pruebas; espera a salir de /login. */
export async function login(page: Page) {
  requireCredentials();
  await submitLogin(page, EMAIL, PASSWORD);
  await page.waitForURL((url) => !url.pathname.startsWith("/login"), { timeout: 30_000 });
}

/** Token de negocio del usuario de pruebas obtenido directamente del back (login + business-token). */
export async function apiBusinessToken(request: APIRequestContext, businessId = 0): Promise<string> {
  requireCredentials();
  const login = await request.post(`${API}/auth/login`, { data: { email: EMAIL, password: PASSWORD } });
  expect(login.ok(), "login del usuario de pruebas en la API (E2E_API_URL)").toBeTruthy();
  const sessionToken: string = (await login.json()).data.token;

  const res = await request.post(`${API}/auth/business-token`, {
    headers: { Authorization: `Bearer ${sessionToken}` },
    data: { business_id: businessId },
  });
  expect(res.ok(), "token de negocio en la API").toBeTruthy();
  return (await res.json()).data.token;
}

/** Busca un negocio por nombre exacto en la API (precondición de datos de los specs). */
export async function apiFindBusiness(request: APIRequestContext, name: string): Promise<{ id: number; name: string } | undefined> {
  const token = await apiBusinessToken(request);
  const res = await request.get(`${API}/businesses`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { page: 1, per_page: 100 },
  });
  expect(res.ok(), "listar negocios en la API").toBeTruthy();
  const businesses: { id: number; name: string }[] = (await res.json()).data ?? [];
  return businesses.find((b) => b.name === name);
}
