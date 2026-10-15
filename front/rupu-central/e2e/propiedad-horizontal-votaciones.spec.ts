import { expect, test } from "@playwright/test";
import { apiFindBusiness, login } from "./helpers";

// Super admin: módulo Propiedad Horizontal -> negocio "Tayazal de Suba" en el selector -> Votaciones.
// Protege la regresión en que el selector de negocios usaba un business_type_id fijo y la propiedad
// quedaba sin cargar ("No se pudo cargar la información de la propiedad").
const PROPERTY_NAME = process.env.E2E_PROPERTY_NAME ?? "Tayazal de Suba";
const LOAD_ERROR = "No se pudo cargar la información de la propiedad";

test("super admin entra a Votaciones de Tayazal de Suba sin error de carga", async ({ page, request }) => {
  // Precondición de datos por la API: si la propiedad no existe en la BD, el fallo lo dice claro.
  const business = await apiFindBusiness(request, PROPERTY_NAME);
  expect(business, `la BD de E2E_API_URL debe tener el negocio "${PROPERTY_NAME}"`).toBeDefined();

  await login(page);

  await expect(page).toHaveURL(/\/select-type/);
  await page.getByRole("button", { name: /Propiedad Horizontal/ }).click();
  await expect(page).toHaveURL(/\/properties$/);

  // El <select> del negocio no tiene label accesible: se ubica como el combobox que ofrece la propiedad.
  const businessSelect = page
    .getByRole("combobox")
    .filter({ has: page.getByRole("option", { name: PROPERTY_NAME, exact: true }) });
  // El selector de negocio carga su lista una sola vez al montar y a veces queda vacío bajo carga
  // (.claude/alerts/selector-de-negocio-no-reintenta.md): si no aparece, recargar una vez.
  if (!(await businessSelect.isEnabled({ timeout: 20_000 }).catch(() => false))) await page.reload();
  await expect(businessSelect).toBeEnabled({ timeout: 30_000 });
  await businessSelect.selectOption({ label: PROPERTY_NAME });

  // El cambio de negocio navega a /properties/<id> (Resumen) con recarga completa.
  const businessId = business!.id;
  await page.waitForURL(new RegExp(`/properties/${businessId}$`), { timeout: 30_000 });
  // La propiedad cargó: se ve su ficha con el nombre, y no el error de carga.
  const main = page.getByRole("main");
  await expect(main.getByRole("heading", { name: /Información General/ })).toBeVisible({ timeout: 30_000 });
  // (getByText también encontraría el <option> del selector, que no es visible: se acota a párrafos.)
  await expect(main.getByRole("paragraph").filter({ hasText: new RegExp(`^${PROPERTY_NAME}$`) })).toBeVisible();
  await expect(page.getByText(LOAD_ERROR)).toHaveCount(0);

  // El Resumen dispara varias server actions (estadísticas). Si se navega con alguna en vuelo, Next
  // cambia la URL pero a veces deja renderizada la página anterior: se espera a que terminen.
  await page.waitForLoadState("networkidle");

  // El sidebar colapsado solo muestra iconos; al pasar el mouse se expande y los enlaces toman nombre.
  const sidebar = page.getByRole("complementary");
  await sidebar.hover();
  const votingLink = sidebar.getByRole("link", { name: "Votaciones" });
  await expect(votingLink).toHaveAttribute("href", `/properties/${businessId}/voting-groups`);
  await votingLink.click();
  // En `next dev` la primera visita compila la ruta: margen amplio.
  await expect(page).toHaveURL(new RegExp(`/properties/${businessId}/voting-groups$`), { timeout: 30_000 });

  await expect(page.getByRole("heading", { name: "Grupos de votación" })).toBeVisible({ timeout: 30_000 });
  await expect(page.getByRole("button", { name: "+ Nuevo grupo" }).first()).toBeVisible();
  await expect(page.getByText(LOAD_ERROR)).toHaveCount(0);
  await expect(page.getByText("ID de propiedad inválido")).toHaveCount(0);
});
