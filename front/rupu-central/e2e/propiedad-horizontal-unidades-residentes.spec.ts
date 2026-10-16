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

test("Unidades: pestañas por bloque, filas agrupadas, formulario y vista previa de importación", async ({ page, request }) => {
  const business = await apiFindBusiness(request, PROPERTY_NAME);
  expect(business, `la BD debe tener el negocio "${PROPERTY_NAME}"`).toBeDefined();
  await openProperty(page, business!.id, "units");
  const table = page.getByRole("table", { name: "Unidades" });
  await expect(table.getByRole("rowgroup").first()).toBeVisible({ timeout: 30_000 });
  await expect(page.getByRole("tab", { name: /^Todas/ })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByText("ID de propiedad inválido")).toHaveCount(0);
  // Fila de grupo con el coeficiente acumulado del bloque.
  await expect(table.getByText(/^coef\. [\d.,]+ %$/).first()).toBeVisible();
  await shot(page, "u1-lista");

  // Pestaña de bloque → URL y filas solo de ese bloque ("Casa 126", nunca el id).
  await page.getByRole("tab", { name: /^Casa/ }).click();
  await expect(page).toHaveURL(/pestana=bloque%3ACasa|pestana=bloque:Casa/);
  await expect(table.getByRole("rowgroup")).toHaveCount(1, { timeout: 30_000 });
  await expect(table.getByRole("cell").filter({ hasText: /^Casa \d+$/ }).first()).toBeVisible();
  await shot(page, "u1-casa");

  // U2: editar desde el lápiz (se cancela).
  await table.getByRole("button", { name: /^Editar Casa / }).first().click();
  const edit = page.getByRole("dialog", { name: /^Editar Casa / });
  await expect(edit.getByText("Suma de la propiedad con este valor")).toBeVisible();
  await expect(edit.getByRole("radiogroup")).toBeVisible();
  await shot(page, "u2-editar");
  await edit.getByRole("button", { name: "Cancelar" }).click();

  // U3: paso 1 del importador (sin subir archivo).
  await page.getByRole("button", { name: "Importar Excel" }).click();
  const imp = page.getByRole("dialog", { name: "Elige el archivo" });
  await expect(imp).toContainText("Formato del archivo");
  await shot(page, "u3-importar");
  await imp.getByRole("button", { name: "Cancelar" }).click();
});

test("Residentes: pestañas por tipo, panel de detalle, formulario y edición masiva", async ({ page, request }) => {
  const business = await apiFindBusiness(request, PROPERTY_NAME);
  expect(business, `la BD debe tener el negocio "${PROPERTY_NAME}"`).toBeDefined();
  await openProperty(page, business!.id, "residents");
  const table = page.getByRole("table", { name: "Residentes" });
  const firstRow = table.getByRole("row").nth(1);
  await expect(firstRow).toBeVisible({ timeout: 30_000 });
  await expect(page.getByRole("tab", { name: /^Todos/ })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tab", { name: /^Sin correo/ })).toBeVisible();
  await shot(page, "r1-lista");

  await firstRow.click();
  const panel = page.getByRole("dialog").filter({ hasText: "Actividad reciente" });
  await expect(panel).toBeVisible();
  await expect(panel).toContainText(/Residente · /);
  await expect(panel.getByRole("link", { name: "Registrar visita" })).toBeVisible();
  await shot(page, "r4-detalle");
  await panel.getByRole("button", { name: "Editar" }).click();
  const edit = page.getByRole("dialog", { name: /^Editar / });
  await expect(edit.getByRole("checkbox", { name: "Residente principal de la unidad" })).toBeVisible();
  await shot(page, "r2-editar");
  await edit.getByRole("button", { name: "Cancelar" }).click();

  await page.getByRole("button", { name: "Edición masiva" }).click();
  const bulk = page.getByRole("dialog").filter({ hasText: /Edición masiva/i });
  await expect(bulk.getByRole("table", { name: "Residentes a editar" })).toBeVisible();
  await expect(bulk.getByText(/0 cambios sin guardar/)).toBeVisible({ timeout: 30_000 });
  await shot(page, "r3-edicion-masiva");
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
