import path from "node:path";
import { expect, test, type APIRequestContext, type Page } from "@playwright/test";
import { caption, finish, markReady, prepare, saveNarration, say, tap, write } from "./studio";

// Tutoriales de Unidades y Residentes sobre una propiedad de demostración que se crea vacía en cada
// grabación (datos ficticios): pnpm tutorials -g modulos
const API = process.env.E2E_API_URL ?? "http://localhost:3060/api/v1";
const PROP = "Conjunto Los Pinos (demo)";
const FIXTURES = path.join(__dirname, "fixtures");
let propId = 0;

async function apiToken(request: APIRequestContext) {
  const login = await request.post(`${API}/auth/login`, { data: { email: process.env.E2E_EMAIL, password: process.env.E2E_PASSWORD } });
  const main = (await login.json()).data.token;
  const bt = await request.post(`${API}/auth/business-token`, { headers: { Authorization: `Bearer ${main}` }, data: { business_id: 0 } });
  return (await bt.json()).data.token as string;
}

/** Entra a la propiedad demo desde el selector y abre el módulo; el video empieza con la pantalla lista. */
async function openModule(page: Page, module: "units" | "residents") {
  await prepare(page);
  await page.goto("/properties");
  await page.getByRole("button", { name: `Abrir ${PROP}` }).click();
  await page.waitForURL(/\/properties\/\d+$/, { timeout: 30_000 });
  await page.goto(`/properties/${propId}/${module}`);
  await expect(page.getByRole("button", { name: "Importar Excel" })).toBeVisible({ timeout: 30_000 });
  await page.waitForTimeout(1200);
  markReady(page);
  await page.waitForTimeout(600);
}

test.describe.serial("modulos", () => {
  test.afterEach(async ({ page }, info) => saveNarration(page, info));

  test.beforeAll(async ({ request }) => {
    const token = await apiToken(request);
    const h = { Authorization: `Bearer ${token}` };
    const list = await request.get(`${API}/businesses?page=1&per_page=100`, { headers: h });
    for (const b of ((await list.json()).data ?? []) as { id: number; name: string }[]) {
      if (b.name === PROP) await request.delete(`${API}/horizontal-properties/${b.id}`, { headers: h });
    }
    const created = await request.post(`${API}/horizontal-properties`, {
      headers: h,
      // Código y dominio únicos por grabación: los de la propiedad borrada siguen ocupados.
      multipart: { name: PROP, code: `los-pinos-demo-${Date.now()}`, custom_domain: `los-pinos-demo-${Date.now()}`, address: "Calle 45 # 12-30, Medellín", description: "Dos torres de cinco pisos, 30 apartamentos." },
    });
    const body = await created.json();
    propId = body.data?.id;
    expect(propId, JSON.stringify(body)).toBeGreaterThan(0);
  });

  test("1-unidades-importar", async ({ page }) => {
    await openModule(page, "units");
    await caption(page, "Las <b>unidades</b> son la base de toda asamblea", 1400,
      "Las unidades son la base de toda asamblea. Cada apartamento tiene un coeficiente, que es el peso de su voto y lo que cuenta para el quórum. La forma más rápida de cargarlas es con un Excel.");
    await tap(page.getByRole("button", { name: "Importar Excel" }));
    const dialog = page.getByRole("dialog", { name: "Elige el archivo" });
    await expect(dialog).toBeVisible();
    await caption(page, "El Excel lleva <b>Número, Torre, Piso, Tipo y Coeficiente</b>", 1600,
      "El archivo lleva una fila de encabezados con número, torre, piso, tipo y coeficiente. El número y el coeficiente son obligatorios; usa el mismo número que tienen los apartamentos en el conjunto.");
    await dialog.locator('input[type="file"]').setInputFiles(path.join(FIXTURES, "unidades-demo.xlsx"));
    await page.waitForTimeout(700);
    await tap(dialog.getByRole("button", { name: "Revisar archivo" }));
    const review = page.getByRole("dialog", { name: "Revisa antes de importar" });
    await expect(review).toBeVisible({ timeout: 30_000 });
    await caption(page, "Antes de guardar, Rupü <b>revisa cada fila</b>", 1600,
      "Antes de guardar nada, Rupü revisa cada fila: te dice cuáles están listas, cuáles ya existen y cuáles tienen errores, y cuánto suman los coeficientes.");
    await caption(page, "Los coeficientes deben sumar <b>100 %</b>", 1600,
      "Fíjate en el total: los coeficientes deben sumar cien por ciento. Si no suman cien, el quórum y los resultados de las votaciones salen mal, así que corrígelo antes de la asamblea.");
    await tap(review.getByRole("button", { name: /^Importar 30 unidades$/ }));
    const done = page.getByRole("dialog", { name: "Importación terminada" });
    await expect(done).toBeVisible({ timeout: 30_000 });
    await caption(page, "¡Listo! Las <b>30 unidades</b> quedaron cargadas ✓", 1600,
      "Confirmas, y en segundos quedan cargadas las treinta unidades, listas para la asamblea.");
    await tap(done.getByRole("button", { name: "Listo" }));
    await finish(page);
  });

  test("2-unidades-corregir", async ({ page }) => {
    await openModule(page, "units");
    await caption(page, "¿Un coeficiente quedó mal? Lo corriges <b>unidad por unidad</b>", 1400,
      "Si un coeficiente quedó mal, o cambió el reglamento, lo corriges unidad por unidad.");
    await tap(page.getByRole("button", { name: /^Editar .*T1-101$/ }));
    const dialog = page.getByRole("dialog").filter({ has: page.getByLabel("Coeficiente de copropiedad") });
    await expect(dialog).toBeVisible({ timeout: 20_000 });
    await say(page, "Abres la unidad y escribes su coeficiente, tal como aparece en el reglamento de propiedad horizontal o en la escritura.");
    const coef = dialog.getByLabel("Coeficiente de copropiedad");
    const current = await coef.inputValue();
    await write(coef, current || "3,3333");
    await caption(page, "Usa el coeficiente del <b>reglamento</b> o la escritura", 1400);
    await tap(dialog.getByRole("button", { name: "Guardar" }));
    await expect(dialog).toBeHidden({ timeout: 20_000 });
    await caption(page, "Revisa que el total siga en <b>100 %</b>", 1600,
      "Después revisa que el total siga en cien por ciento. Lo ves en el resumen de unidades y en la tarjeta del conjunto.");
    await finish(page);
  });

  test("3-residentes-importar", async ({ page }) => {
    await openModule(page, "residents");
    await caption(page, "Los <b>residentes</b> le ponen nombre a cada unidad", 1400,
      "Con las unidades listas, cargas a los residentes. Ellos le ponen nombre a cada unidad: aparecen en las credenciales de votación, en la asistencia y en el acta.");
    await tap(page.getByRole("button", { name: "Importar Excel" }));
    const dialog = page.getByRole("dialog", { name: "Importar residentes desde Excel" });
    await expect(dialog).toBeVisible();
    await caption(page, "Cada fila se empareja con su unidad por el <b>número exacto</b>", 1800,
      "El Excel lleva el número de la unidad, el nombre completo y el documento. Lo más importante: el número tiene que ser exactamente igual al de la unidad en Rupü, por ejemplo T uno guion ciento uno. Así cada persona queda emparejada con su apartamento.");
    await dialog.locator('input[type="file"]').setInputFiles(path.join(FIXTURES, "residentes-demo.xlsx"));
    await page.waitForTimeout(700);
    await tap(dialog.getByRole("button", { name: "Importar residentes" }));
    await expect(dialog.getByText(/Filas con error · 1/)).toBeVisible({ timeout: 30_000 });
    await caption(page, "Si una unidad no existe, esa fila <b>no se importa</b>", 1800,
      "Mira: treinta residentes quedaron cargados y una fila salió con error, porque la unidad T tres guion ciento uno no existe en el conjunto. Corriges el número en el Excel, o creas la unidad, y vuelves a importar esa fila.");
    await tap(dialog.getByRole("button", { name: "Listo" }));
    await finish(page);
  });

  test("4-residentes-completar", async ({ page }) => {
    await openModule(page, "residents");
    await caption(page, "La importación crea a todos como <b>propietarios</b>", 1400,
      "La importación crea a todos como propietarios, solo con nombre y documento. Para completar los datos tienes dos caminos.");
    await tap(page.getByRole("button", { name: "Edición masiva" }));
    const bulk = page.getByRole("dialog").last();
    await expect(bulk).toBeVisible({ timeout: 20_000 });
    await page.waitForTimeout(1500);
    await caption(page, "<b>Edición masiva</b>: corrige toda una torre en una tabla", 1800,
      "Con Edición masiva corriges en una tabla los nombres, documentos, correos y teléfonos de toda una torre, y guardas una sola vez.");
    await finish(page);
    await page.keyboard.press("Escape");
    await expect(bulk).toBeHidden({ timeout: 10_000 });
    await tap(page.getByRole("button", { name: /^Acciones de / }).first());
    await tap(page.getByRole("menuitem", { name: "Editar" }));
    const edit = page.getByRole("dialog", { name: /^Editar / });
    await expect(edit).toBeVisible({ timeout: 20_000 });
    await caption(page, "¿Arrendatario o familiar? Cámbialo <b>editando al residente</b>", 1200,
      "Y si alguien es arrendatario o familiar, lo cambias editando al residente.");
    await tap(edit.getByRole("radio", { name: "Arrendatario" }));
    await tap(edit.getByRole("button", { name: "Guardar cambios" }));
    await expect(edit).toBeHidden({ timeout: 20_000 });
    await caption(page, "Con datos correctos, las credenciales y el acta quedan <b>a nombre de quien es</b> ✓", 1800,
      "Con nombres y documentos correctos, las credenciales de votación y el acta quedan a nombre de quien es.");
    await finish(page);
  });
});
