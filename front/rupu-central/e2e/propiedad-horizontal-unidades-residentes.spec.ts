import { expect, test, type Page } from "@playwright/test";
import { apiFindBusiness, login } from "./helpers";

// Rediseño de Unidades (U1–U3) y Residentes (R1–R4) sobre "Tayazal de Suba". Solo lectura:
// no crea ni modifica datos (los modales se abren y se cancelan).
const PROPERTY_NAME = process.env.E2E_PROPERTY_NAME ?? "Tayazal de Suba";
// Si se define, guarda capturas de cada pantalla en esa carpeta (revisión visual local).
const SHOTS = process.env.E2E_SCREENSHOTS_DIR;

/** Login, elige la propiedad en el selector (sin propiedad elegida no hay menú) y abre `path`. */
async function openProperty(page: Page, businessId: number, path: string) {
  await login(page);
  await page.goto("/properties");
  await page.getByRole("button", { name: new RegExp(`${PROPERTY_NAME}.*Abrir propiedad`) }).click();
  await page.waitForURL(new RegExp(`/properties/${businessId}`), { timeout: 30_000 });
  await page.goto(`/properties/${businessId}/${path}`);
}

async function shot(page: Page, name: string) {
  if (SHOTS) await page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: true });
}

test("Unidades: lista con chips por bloque, vista por bloque y formularios", async ({ page, request }) => {
  const business = await apiFindBusiness(request, PROPERTY_NAME);
  expect(business, `la BD debe tener el negocio "${PROPERTY_NAME}"`).toBeDefined();
  await openProperty(page, business!.id, "units");
  const table = page.getByRole("table", { name: "Unidades" });
  await expect(table.getByRole("row").nth(1)).toBeVisible({ timeout: 30_000 });
  await expect(page.getByRole("tab", { name: /Unidades/ })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByText("ID de propiedad inválido")).toHaveCount(0);
  await expect(page.getByLabel("Resumen de unidades")).toContainText("Suma de coeficientes");
  await shot(page, "u1-lista");

  // Chip de bloque → URL y lista filtrada ("Casa 126", nunca el id).
  const chips = page.getByRole("group", { name: "Filtrar por bloque" });
  await chips.getByRole("button", { name: /^Casa/ }).click();
  await expect(page).toHaveURL(/bloque=Casa/);
  await expect(table.getByRole("cell").filter({ hasText: /^Casa \d+$/ }).first()).toBeVisible({ timeout: 30_000 });

  await page.getByRole("tab", { name: /Por bloque/ }).click();
  await expect(page).toHaveURL(/vista=bloques/);
  const byBlock = page.getByRole("table", { name: "Unidades por bloque" });
  await expect(byBlock).toContainText("Participación");
  await shot(page, "u1-por-bloque");

  await page.getByRole("tab", { name: /Unidades/ }).click();
  await page.getByRole("button", { name: "+ Nueva unidad" }).click();
  const create = page.getByRole("dialog", { name: "Crear unidad" });
  await expect(create.getByLabel("Coeficiente de copropiedad")).toBeVisible();
  await shot(page, "u2-crear");
  await create.getByRole("button", { name: "Cancelar" }).click();

  await page.getByRole("button", { name: "Importar Excel" }).click();
  const imp = page.getByRole("dialog", { name: "Importar unidades desde Excel" });
  await expect(imp).toContainText("Formato del archivo");
  await shot(page, "u3-importar");
  await imp.getByRole("button", { name: "Cancelar" }).click();
});

test("Residentes: lista con chips por tipo, panel de detalle y formularios", async ({ page, request }) => {
  const business = await apiFindBusiness(request, PROPERTY_NAME);
  expect(business, `la BD debe tener el negocio "${PROPERTY_NAME}"`).toBeDefined();
  await openProperty(page, business!.id, "residents");
  const table = page.getByRole("table", { name: "Residentes" });
  const firstRow = table.getByRole("row").nth(1);
  await expect(firstRow).toBeVisible({ timeout: 30_000 });
  await expect(page.getByRole("group", { name: "Filtrar por tipo" }).getByRole("button", { name: /^Todos/ })).toBeVisible();
  await shot(page, "r1-lista");

  await firstRow.click();
  const panel = page.getByRole("dialog").filter({ hasText: "Línea de tiempo" });
  await expect(panel).toBeVisible();
  await expect(panel).toContainText(/Residente · /);
  await shot(page, "r3-detalle");
  await panel.getByRole("button", { name: "Editar" }).click();
  await expect(page.getByText("Editar residente")).toBeVisible();
  await shot(page, "r2-editar");
  await page.getByRole("button", { name: "Cancelar" }).click();
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: "Edición masiva" }).click();
  await expect(page.getByRole("dialog", { name: "Actualizar residentes por Excel" })).toBeVisible();
  await shot(page, "r4-edicion-masiva");
});

test.describe("en teléfono (390 px)", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test("Unidades y Residentes sin scroll horizontal de la página", async ({ page, request }) => {
    const business = await apiFindBusiness(request, PROPERTY_NAME);
    expect(business, `la BD debe tener el negocio "${PROPERTY_NAME}"`).toBeDefined();
    await openProperty(page, business!.id, "units");
    for (const [path, action] of [["units", "+ Nueva unidad"], ["residents", "+ Nuevo residente"]] as const) {
      await page.goto(`/properties/${business!.id}/${path}`);
      await expect(page.getByRole("button", { name: action })).toBeVisible({ timeout: 30_000 });
      await page.waitForLoadState("networkidle");
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(scrollWidth, `${path}: scrollWidth ${scrollWidth} > 390`).toBeLessThanOrEqual(390);
      await shot(page, `movil-${path}`);
    }
  });
});
