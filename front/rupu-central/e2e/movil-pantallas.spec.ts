import { expect, test, devices, type APIRequestContext, type Locator, type Page } from "@playwright/test";
import { API, apiBusinessToken, apiFindBusiness, login, requireCredentials } from "./helpers";

// Pantallas de los módulos en teléfono (< 768px): sin scroll horizontal de página y con la acción
// principal visible y tocable (>= 44px de alto, dentro del ancho de la pantalla). Se prueba en dos
// celulares emulados en Chromium (los perfiles de iPhone fuerzan WebKit, que no se instala).
// Siembra por la API un grupo con una votación abierta (sufijo propio de la corrida) para A1 y A6.
// Con E2E_SHOTS_DIR guarda una captura de cada pantalla (revisión visual, no es parte de la regla).

const PROPERTY = process.env.E2E_PROPERTY_NAME ?? "Tayazal de Suba";
const RUN = Date.now().toString(36).slice(-6).toUpperCase();
const SHOTS = process.env.E2E_SHOTS_DIR;
const TAP = 44;
/** Alto de la barra inferior del shell en teléfono (las acciones fijas quedan por encima). */
const SHELL_BAR = 64;

// Sin defaultBrowserType: no se puede fijar dentro de un describe (forzaría otro worker).
const { defaultBrowserType: _iphoneEngine, ...IPHONE } = devices["iPhone 13"];
const { defaultBrowserType: _pixelEngine, ...PIXEL } = devices["Pixel 7"];
const PHONES = [
  ["iPhone 13", IPHONE],
  ["Pixel 7", PIXEL],
] as const;

type Seed = { q: string; token: string; businessId: number; groupId: number; groupName: string; votingId: number; votingTitle: string };

async function api(request: APIRequestContext, method: "GET" | "POST" | "PATCH" | "DELETE", path: string, token: string, data?: unknown) {
  const res = await request.fetch(`${API}${path}`, { method, headers: { Authorization: `Bearer ${token}` }, data });
  expect(res.ok(), `${method} ${path} -> ${res.status()} ${await res.text()}`).toBeTruthy();
  return res.status() === 204 ? {} : (await res.json()).data;
}

async function seed(request: APIRequestContext, device: string): Promise<Seed> {
  const token = await apiBusinessToken(request);
  const business = await apiFindBusiness(request, PROPERTY);
  expect(business, `la propiedad "${PROPERTY}" debe existir`).toBeTruthy();
  const q = `?business_id=${business!.id}`;
  const tag = `${RUN}-${device.replace(/\s+/g, "")}`;
  const now = Date.now();
  const groupName = `Asamblea móvil e2e ${tag}`;
  const group = await api(request, "POST", `/horizontal-properties/voting-groups${q}`, token, {
    name: groupName, description: "e2e pantallas de teléfono",
    voting_start_date: new Date(now - 60_000).toISOString(), voting_end_date: new Date(now + 86_400_000).toISOString(),
    requires_quorum: true, quorum_percentage: 51,
  });
  const vp = `/horizontal-properties/voting-groups/${group.id}/votings`;
  const votingTitle = `Presupuesto móvil e2e ${tag}`;
  const voting = await api(request, "POST", `${vp}${q}`, token, {
    title: votingTitle, description: "e2e", voting_type: "majority", allow_abstention: true, display_order: 1, required_percentage: 51,
  });
  for (const [i, [text, code, color]] of [["Sí", "SI", "#1f8a4c"], ["No", "NO", "#c8382d"], ["Abstención", "ABS", "#8a8580"]].entries()) {
    await api(request, "POST", `${vp}/${voting.id}/options${q}`, token, { option_text: text, option_code: code, color, display_order: i + 1 });
  }
  await api(request, "PATCH", `${vp}/${voting.id}/activate${q}`, token);
  return { q, token, businessId: business!.id, groupId: group.id, groupName, votingId: voting.id, votingTitle };
}

/** La página no se desplaza a lo ancho: el documento no es más ancho que la pantalla del celular. */
async function expectNoHorizontalScroll(page: Page) {
  const width = page.viewportSize()!.width;
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(scrollWidth, `scrollWidth ${scrollWidth} > ancho del celular ${width}`).toBeLessThanOrEqual(width);
}

/** Visible, dentro del ancho de la pantalla, con alto táctil y sin nada encima que bloquee el toque. */
async function expectTappable(page: Page, target: Locator) {
  await expect(target).toBeVisible({ timeout: 30_000 });
  await target.scrollIntoViewIfNeeded();
  const box = (await target.boundingBox())!;
  const width = page.viewportSize()!.width;
  expect(box.height, "alto táctil").toBeGreaterThanOrEqual(TAP);
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(width + 1);
  await target.click({ trial: true });
  return box;
}

async function shot(page: Page, device: string, name: string) {
  if (!SHOTS) return;
  await page.screenshot({ path: `${SHOTS}/${device.replace(/\s+/g, "-").toLowerCase()}-${name}.png`, fullPage: true });
}

for (const [device, profile] of PHONES) {
  test.describe(`pantallas de los módulos en teléfono (${device})`, () => {
    test.use(profile);
    test.setTimeout(240_000);
    let s: Seed;

    test.beforeAll(async ({ request }) => {
      requireCredentials();
      s = await seed(request, device);
    });

    test.afterAll(async ({ request }) => {
      if (s) await api(request, "DELETE", `/horizontal-properties/voting-groups/${s.groupId}${s.q}`, s.token).catch(() => {});
    });

    test("propiedad horizontal: resumen, unidades, residentes, paquetería y visitas", async ({ page }) => {
      await login(page);
      const base = `/properties/${s.businessId}`;

      await test.step("resumen", async () => {
        await page.goto(base);
        await expect(page.getByRole("heading", { name: /Información General/ })).toBeVisible({ timeout: 30_000 });
        await expectNoHorizontalScroll(page);
        await shot(page, device, "resumen");
      });

      const screens: [string, string, RegExp][] = [
        ["unidades", "units", /^Agregar$/],
        ["residentes", "residents", /Agregar Residente/],
        ["paqueteria", "packages", /Recibir Paquete/],
        ["visitas", "visits", /Nueva Visita/],
      ];
      for (const [name, path, action] of screens) {
        await test.step(name, async () => {
          await page.goto(`${base}/${path}`);
          await page.waitForLoadState("networkidle");
          await expectTappable(page, page.getByRole("button", { name: action }).first());
          await expectNoHorizontalScroll(page);
          await shot(page, device, name);
        });
      }
    });

    test("votaciones: A1 grupos, modal de crear grupo y A6 panel en vivo", async ({ page }) => {
      await login(page);
      // El resumen deja listo el token de negocio que usan las pantallas de votaciones.
      await page.goto(`/properties/${s.businessId}`);
      await expect(page.getByRole("heading", { name: /Información General/ })).toBeVisible({ timeout: 30_000 });

      await test.step("A1 grupos", async () => {
        await page.goto(`/properties/${s.businessId}/voting-groups`);
        await expect(page.getByRole("heading", { name: "Grupos de votación" })).toBeVisible({ timeout: 30_000 });
        const group = page.getByRole("region", { name: `Grupo ${s.groupName}` });
        await expect(group).toBeVisible();
        const expand = group.getByRole("button", { name: `Expandir grupo ${s.groupName}` });
        if (await expand.isVisible()) await expand.click();

        await expectTappable(page, page.getByRole("button", { name: "+ Nuevo grupo" }).first());
        // Cada votación: la acción principal a lo ancho de la tarjeta.
        const row = group.getByRole("listitem", { name: s.votingTitle });
        const primary = await expectTappable(page, row.getByRole("button", { name: `En vivo: ${s.votingTitle}` }));
        // Ocupa el ancho de la tarjeta salvo el botón "más acciones" (44px) y los márgenes internos.
        const rowBox = (await row.boundingBox())!;
        expect(primary.width, "acción principal a lo ancho de la tarjeta").toBeGreaterThanOrEqual(rowBox.width - 90);
        await expectTappable(page, group.getByRole("link", { name: "Asistencia" }));
        await expectNoHorizontalScroll(page);
        await shot(page, device, "votaciones-a1");
      });

      await test.step("modal de crear grupo (A2)", async () => {
        await page.getByRole("button", { name: "+ Nuevo grupo" }).first().click();
        const dialog = page.getByRole("dialog", { name: "Nuevo grupo" });
        await expect(dialog).toBeVisible();
        await expectTappable(page, dialog.getByLabel("Nombre"));
        await expectTappable(page, dialog.getByRole("button", { name: "Crear grupo" }));
        await expectNoHorizontalScroll(page);
        await shot(page, device, "votaciones-a2-modal");
        await dialog.getByRole("button", { name: "Cancelar" }).click();
        await expect(dialog).toBeHidden();
      });

      await test.step("A6 panel en vivo", async () => {
        await page.goto(`/properties/${s.businessId}/voting-groups/${s.groupId}/votings/${s.votingId}/live`);
        const toolbar = page.getByRole("toolbar", { name: "Acciones de la votación" });
        const register = await expectTappable(page, toolbar.getByRole("button", { name: "Registrar voto" }));
        const height = page.viewportSize()!.height;
        // Barra de acciones abajo, por encima de la barra del shell.
        expect(register.y + register.height).toBeLessThanOrEqual(height - SHELL_BAR + 1);
        await expectTappable(page, toolbar.getByRole("button", { name: "Cerrar votación" }));
        await expect(page.getByText("PARTICIPACIÓN")).toBeVisible({ timeout: 30_000 });
        await expectNoHorizontalScroll(page);
        await shot(page, device, "votaciones-a6");

        // A7 desde la barra: el diálogo se abre como hoja inferior y su acción queda a la vista.
        await toolbar.getByRole("button", { name: "Registrar voto" }).click();
        const dialog = page.getByRole("dialog", { name: "Registrar voto" });
        await expect(dialog).toBeVisible();
        await expectTappable(page, dialog.getByRole("button", { name: "Cancelar" }));
        await expectNoHorizontalScroll(page);
        await shot(page, device, "votaciones-a7-modal");
      });
    });
  });
}
