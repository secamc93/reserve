import { expect, test, type APIRequestContext, type Page } from "@playwright/test";
import { API, apiBusinessToken, apiFindBusiness, login } from "./helpers";

// Paginación compartida de tablas sobre Unidades de "Tayazal de Suba": por defecto 10 filas, cambio a 20,
// página 2, texto "Mostrando", estado en la URL (?page=&page_size=) y normalización de ?page_size=500 a 200.
// Crea por la API las unidades que necesita (sufijo de corrida) y las borra al final.
const PROPERTY_NAME = process.env.E2E_PROPERTY_NAME ?? "Tayazal de Suba";
// Sufijo corto: número y bloque de la unidad admiten 10 caracteres.
const RUN = Date.now().toString(36).slice(-5).toUpperCase();
const CREATED = 30;

let businessId = 0;
let token = "";
const createdIds: number[] = [];

async function api(request: APIRequestContext, method: "GET" | "POST" | "DELETE", path: string, data?: unknown) {
  const res = await request.fetch(`${API}${path}`, { method, data, headers: { Authorization: `Bearer ${token}` } });
  const body = await res.json().catch(() => ({}));
  expect(res.ok(), `${method} ${path} -> ${res.status()} ${JSON.stringify(body)}`).toBeTruthy();
  return body.data;
}

async function totalUnits(request: APIRequestContext): Promise<number> {
  const data = await api(request, "GET", `/horizontal-properties/property-units?business_id=${businessId}&page=1&page_size=1`);
  return data.total as number;
}

/** Filas de la tabla de unidades. */
/** Login y elegir la propiedad en el selector (sin propiedad elegida no hay menú ni módulos). */
async function loginAndChooseProperty(page: Page) {
  await login(page);
  await page.goto("/properties");
  await page.getByRole("button", { name: new RegExp(`${PROPERTY_NAME}.*Abrir propiedad`) }).click();
  await page.waitForURL(new RegExp(`/properties/${businessId}`), { timeout: 30_000 });
}

function rows(page: Page) {
  // Una fila por unidad: cada una tiene su lápiz "Editar <unidad>".
  return page.getByRole("table", { name: "Unidades" }).getByRole("button", { name: /^Editar / });
}

test.describe("paginación de tablas (unidades)", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(async ({ request }) => {
    const business = await apiFindBusiness(request, PROPERTY_NAME);
    expect(business, `la BD de E2E_API_URL debe tener el negocio "${PROPERTY_NAME}"`).toBeDefined();
    businessId = business!.id;
    token = await apiBusinessToken(request);

    for (let i = 1; i <= CREATED; i++) {
      const unit = await api(request, "POST", `/horizontal-properties/property-units?business_id=${businessId}`, {
        business_id: businessId,
        number: `P${RUN}-${String(i).padStart(2, "0")}`,
        block: `P${RUN}`,
        unit_type: "apartment",
      });
      createdIds.push(unit.id);
    }
  });

  test.afterAll(async ({ request }) => {
    for (const id of createdIds) {
      await api(request, "DELETE", `/horizontal-properties/property-units/${id}?business_id=${businessId}`);
    }
  });

  test("10 filas por defecto, cambio a 20, página 2 y estado en la URL", async ({ page, request }) => {
    const total = await totalUnits(request);
    expect(total).toBeGreaterThanOrEqual(CREATED);

    await loginAndChooseProperty(page);
    await page.goto(`/properties/${businessId}/units`);

    const nav = page.getByRole("navigation", { name: "Paginación" });
    await expect(nav).toBeVisible({ timeout: 30_000 });
    await expect(rows(page)).toHaveCount(10);
    await expect(nav.getByLabel("Filas por página")).toHaveValue("10");
    await expect(nav.getByText(`Mostrando 1–10 de ${total}`)).toBeVisible();
    await expect(nav.getByRole("button", { name: "Página 1" })).toHaveAttribute("aria-current", "page");

    // Cambiar a 20 filas: vuelve a la página 1 y queda en la URL.
    await nav.getByLabel("Filas por página").selectOption("20");
    await expect(page).toHaveURL(/[?&]page_size=20(&|$)/);
    await expect(page).toHaveURL(/[?&]page=1(&|$)/);
    await expect(rows(page)).toHaveCount(20);
    await expect(nav.getByText(`Mostrando 1–20 de ${total}`)).toBeVisible();

    // Ir a la página 2.
    await nav.getByRole("button", { name: "Página 2" }).click();
    await expect(page).toHaveURL(/[?&]page=2(&|$)/);
    await expect(page).toHaveURL(/[?&]page_size=20(&|$)/);
    const to = Math.min(40, total);
    await expect(nav.getByText(`Mostrando 21–${to} de ${total}`)).toBeVisible();
    await expect(rows(page)).toHaveCount(to - 20);
    await expect(nav.getByRole("button", { name: "Página 2" })).toHaveAttribute("aria-current", "page");

    // La URL manda: recargar conserva la página y el tamaño.
    await page.reload();
    await expect(nav.getByText(`Mostrando 21–${to} de ${total}`)).toBeVisible({ timeout: 30_000 });
    await expect(nav.getByLabel("Filas por página")).toHaveValue("20");

    // Ir a página inválida no navega.
    await nav.getByLabel("Ir a la página").fill("999");
    await nav.getByRole("button", { name: "Ir", exact: true }).click();
    await expect(nav.getByRole("alert")).toBeVisible();
    await expect(page).toHaveURL(/[?&]page=2(&|$)/);
  });

  test("?page_size=500 en la URL se normaliza a 200", async ({ page, request }) => {
    const total = await totalUnits(request);

    await loginAndChooseProperty(page);
    await page.goto(`/properties/${businessId}/units?page_size=500`);

    const nav = page.getByRole("navigation", { name: "Paginación" });
    await expect(nav).toBeVisible({ timeout: 30_000 });
    await expect(page).toHaveURL(/[?&]page_size=200(&|$)/);
    await expect(nav.getByLabel("Filas por página")).toHaveValue("200");
    const to = Math.min(200, total);
    await expect(nav.getByText(`Mostrando 1–${to} de ${total}`)).toBeVisible();
    await expect(rows(page)).toHaveCount(to);
  });
});
