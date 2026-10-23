import { expect, test, type Page } from "@playwright/test";
import { caption, hideCaption, prepare, saveNarration, tap, write } from "./studio";

// Videos tutoriales del módulo de votaciones, en el orden real de una asamblea. Se graban sobre la
// propiedad de demostración (datos ficticios): pnpm tutorials -g votaciones
const API = process.env.E2E_API_URL ?? "http://localhost:3060/api/v1";
const DEMO_ID = Number(process.env.DEMO_BUSINESS_ID ?? 134);
const GROUP = "Asamblea ordinaria 2027";
const VOTING = "¿Aprueba los estados financieros 2026?";
const PRESENT = ["T1-101", "T1-102", "T1-103", "T1-201"];

async function apiToken(request: import("@playwright/test").APIRequestContext) {
  const login = await request.post(`${API}/auth/login`, { data: { email: process.env.E2E_EMAIL, password: process.env.E2E_PASSWORD } });
  const main = (await login.json()).data.token;
  const bt = await request.post(`${API}/auth/business-token`, { headers: { Authorization: `Bearer ${main}` }, data: { business_id: 0 } });
  return (await bt.json()).data.token as string;
}

async function openVoting(page: Page) {
  await prepare(page);
  await page.goto(`/properties/${DEMO_ID}/voting-groups`);
  await expect(page.getByRole("heading", { name: "Grupos de votación" })).toBeVisible({ timeout: 30_000 });
  await page.waitForTimeout(800);
}

async function groupCard(page: Page) {
  const group = page.getByRole("region", { name: `Grupo ${GROUP}` });
  await expect(group).toBeVisible({ timeout: 30_000 });
  const expand = group.getByRole("button", { name: `Expandir grupo ${GROUP}` });
  if (await expand.isVisible()) await tap(expand, 400);
  return group;
}

test.describe.serial("votaciones", () => {
  test.afterEach(async ({ page }, info) => saveNarration(page, info));

  test.beforeAll(async ({ request }) => {
    if (process.env.TUTORIAL_KEEP_DATA === "1") return; // re-grabar escenas sueltas sin borrar la asamblea
    const token = await apiToken(request);
    const h = { Authorization: `Bearer ${token}` };
    const res = await request.get(`${API}/horizontal-properties/voting-groups?business_id=${DEMO_ID}`, { headers: h });
    for (const g of ((await res.json()).data ?? []) as { id: number }[]) {
      await request.delete(`${API}/horizontal-properties/voting-groups/${g.id}?business_id=${DEMO_ID}`, { headers: h });
    }
    await request.put(`${API}/horizontal-properties/voting-billing/exemption?business_id=${DEMO_ID}`, { headers: h, data: { exempt: true } });
  });

  test("1-crear-asamblea", async ({ page }) => {
    await openVoting(page);
    await caption(page, "En <b>Votaciones</b> creas cada asamblea de tu conjunto");
    await tap(page.getByRole("button", { name: "+ Nuevo grupo" }).first());
    const dialog = page.getByRole("dialog", { name: "Nuevo grupo" });
    await caption(page, "Ponle un nombre a la asamblea", 1200);
    await write(dialog.getByLabel("Nombre"), GROUP);
    await write(dialog.getByLabel("Descripción"), "Estados financieros, presupuesto y elección del consejo");
    await caption(page, "Elige la <b>fecha y hora</b> en que se va a votar", 2400);
    await caption(page, "El <b>quórum</b> viene en 51% del coeficiente; puedes cambiarlo", 2600);
    await tap(dialog.getByRole("button", { name: "Crear grupo" }));
    await expect(dialog).toBeHidden();
    await caption(page, "¡Listo! La asamblea quedó creada ✓", 2600);
    await hideCaption(page);
  });

  test("2-agregar-votaciones", async ({ page }) => {
    await openVoting(page);
    const group = await groupCard(page);
    await caption(page, "Agrega una <b>votación</b> por cada punto del orden del día");
    await tap(group.getByRole("button", { name: "+ Nueva votación" }));
    const dialog = page.getByRole("dialog", { name: "Nueva votación" });
    await write(dialog.getByLabel("Título"), VOTING);
    await write(dialog.getByLabel("Descripción"), "Se presentan los estados financieros del año");
    await caption(page, "Elige cómo se aprueba: por <b>mayoría</b> u otra regla", 1800);
    await tap(dialog.getByRole("radio", { name: "Mayoría" }));
    await caption(page, "Las opciones <b>Sí, No y Abstención</b> ya vienen listas; puedes cambiarlas", 2800);
    await tap(dialog.getByRole("button", { name: "Guardar votación" }));
    await expect(dialog).toBeHidden({ timeout: 20_000 });
    await caption(page, "La votación queda <b>lista</b> para abrirla el día de la asamblea ✓", 2800);
    await hideCaption(page);
  });

  test("3-asistencia-y-qr", async ({ page }) => {
    await openVoting(page);
    const group = await groupCard(page);
    await caption(page, "Con el <b>QR</b> los propietarios votan desde su celular, sin instalar nada");
    await tap(group.getByRole("button", { name: "QR" }));
    const qr = page.getByRole("dialog", { name: GROUP });
    await expect(qr.getByRole("img", { name: new RegExp(`Código QR para votar en ${GROUP}`) })).toBeVisible({ timeout: 20_000 });
    await caption(page, "Proyéctalo en la asamblea o compártelo por WhatsApp", 3000);
    await tap(qr.getByRole("button", { name: "Cerrar" }));
    await caption(page, "En <b>Asistencia</b> registras quién llegó: así se calcula el quórum", 2200);
    await tap(group.getByRole("link", { name: "Asistencia" }));
    const attendance = page.getByRole("dialog", { name: "Asistencia" });
    await expect(attendance.getByRole("switch", { name: `Presente ${PRESENT[0]}` })).toBeVisible({ timeout: 30_000 });
    await page.waitForTimeout(900);
    for (const unit of PRESENT) {
      const sw = attendance.getByRole("switch", { name: `Presente ${unit}` });
      await tap(sw, 350);
      await expect(sw).toHaveAttribute("aria-busy", "false", { timeout: 20_000 });
    }
    await caption(page, "El <b>quórum</b> se actualiza solo con el coeficiente de cada unidad presente ✓", 3200);
    await caption(page, "Si alguien no puede ir, registras su <b>apoderado</b> aquí mismo", 2600);
    await tap(attendance.getByRole("button", { name: "Cerrar asistencia" }));
    await hideCaption(page);
  });

  test("4-votacion-en-vivo", async ({ page }) => {
    await openVoting(page);
    const group = await groupCard(page);
    await caption(page, "El día de la asamblea, <b>inicia</b> la votación");
    await tap(group.getByRole("button", { name: `Iniciar: ${VOTING}` }));
    await expect(page).toHaveURL(/\/votings\/\d+\/live$/, { timeout: 30_000 });
    await expect(page.getByText("EN VIVO")).toBeVisible({ timeout: 30_000 });
    await caption(page, "Los votos llegan <b>en vivo</b>, cada uno con el peso de su coeficiente", 2600);
    const votes: [string, string][] = [["T1-101", "Sí"], ["T1-102", "Sí"], ["T1-103", "No"]];
    for (const [unit, option] of votes) {
      await tap(page.getByRole("button", { name: new RegExp(`^${unit} ·.*clic para registrar voto`) }), 400);
      const dialog = page.getByRole("dialog", { name: "Registrar voto" });
      await tap(dialog.getByRole("radio", { name: option }), 300);
      await tap(dialog.getByRole("button", { name: `Guardar: ${option}` }), 300);
      await expect(dialog).toBeHidden({ timeout: 20_000 });
      if (unit === "T1-101") await caption(page, "Quien no tenga celular vota aquí, con el administrador", 2200);
    }
    await caption(page, "Al terminar, <b>cierra</b> la votación", 1800);
    await tap(page.getByRole("button", { name: "Cerrar votación" }));
    await tap(page.getByRole("dialog", { name: "¿Cerrar la votación?" }).getByRole("button", { name: "Cerrar y ver resultado" }));
    await expect(page.getByText(/CERRADA/).first()).toBeVisible({ timeout: 20_000 });
    await caption(page, "El resultado sale al instante, calculado por <b>coeficiente</b> ✓", 3000);
    await caption(page, "Desde la asamblea descargas el <b>informe PDF</b> para el acta", 2800);
    await hideCaption(page);
  });

  test("5-dias-de-votacion", async ({ page, request }) => {
    const token = await apiToken(request);
    await request.put(`${API}/horizontal-properties/voting-billing/exemption?business_id=${DEMO_ID}`, { headers: { Authorization: `Bearer ${token}` }, data: { exempt: false } });
    try {
      await openVoting(page);
      await caption(page, "Para recibir votos, el día de la asamblea debe estar <b>cubierto</b>", 2800);
      await tap(page.getByRole("button", { name: "Comprar días" }));
      const dialog = page.getByRole("dialog", { name: "Comprar días de votación" });
      await caption(page, "Las fechas de tus asambleas ya vienen marcadas: <b>$50.000 por día</b>", 3000);
      await caption(page, "Pagas con Nequi, PSE o tarjeta en Wompi y queda listo al instante", 2800);
      await tap(dialog.getByRole("button", { name: "Cancelar" }));
      await caption(page, "Si haces varias asambleas, el <b>mes ilimitado</b> o un plan te sale mejor", 2600);
      await tap(page.getByRole("link", { name: "Planes para administradoras" }));
      await expect(page.getByRole("heading", { name: "Planes de votaciones" })).toBeVisible({ timeout: 30_000 });
      await caption(page, "Las administradoras cubren <b>varios conjuntos</b> con un solo pago", 3200);
      await hideCaption(page);
    } finally {
      await request.put(`${API}/horizontal-properties/voting-billing/exemption?business_id=${DEMO_ID}`, { headers: { Authorization: `Bearer ${token}` }, data: { exempt: true } });
    }
  });
});
