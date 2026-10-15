import { expect, test, devices, type Page } from "@playwright/test";
import { apiFindBusiness, login } from "./helpers";

// Shell en teléfono (< 768 px): barra inferior con el logo de la propiedad, menú de módulos que
// sube desde abajo y sin scroll horizontal. En escritorio la barra inferior no aparece y la
// barra lateral sí. Solo navega (no crea datos).

const PROPERTY = process.env.E2E_PROPERTY_NAME ?? "Tayazal de Suba";
// Celular emulado en Chromium (el perfil de iPhone fuerza WebKit, que no se instala).
const { defaultBrowserType: _webkit, ...PHONE } = devices["iPhone 13"];

/** Login + módulo Propiedad Horizontal. Deja al usuario en /properties. */
async function enterPropertyModule(page: Page) {
  await login(page);
  // Para el super admin, el layout de /select-type genera su token de negocio y recarga la página;
  // si se navega antes, esa recarga devuelve a /select-type a mitad de la prueba.
  // Se espera el token y se vuelve a cargar /select-type: con el token ya guardado no recarga.
  await page.waitForFunction(() => !!localStorage.getItem("business_token"), undefined, { timeout: 30_000 });
  if (new URL(page.url()).pathname === "/select-type") {
    await page.goto("/select-type");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: /Propiedad Horizontal/ }).click();
  }
  await page.waitForURL(/\/properties$/, { timeout: 30_000 });
  await page.waitForLoadState("networkidle");
}

const bottomBar = (page: Page) => page.getByRole("navigation", { name: "Navegación inferior" });
const logoButton = (page: Page) => page.getByRole("button", { name: "Abrir menú de módulos" });
const modulesMenu = (page: Page) => page.getByRole("dialog", { name: "Menú de módulos" });

async function expectNoHorizontalScroll(page: Page) {
  // Dejar que la página termine de pintar sus datos antes de medir.
  await page.waitForLoadState("networkidle");
  // En emulación móvil, si algo desborda, el navegador agranda el viewport de layout (innerWidth
  // deja de ser el ancho del teléfono): se compara contra el ancho del dispositivo.
  const deviceWidth = page.viewportSize()!.width;
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(scrollWidth, `scroll horizontal en ${page.url()}`).toBeLessThanOrEqual(deviceWidth);
}

test.describe("navegación en teléfono", () => {
  test.use(PHONE);
  test.setTimeout(120_000);
  let businessId = 0;

  test.beforeAll(async ({ request }) => {
    const business = await apiFindBusiness(request, PROPERTY);
    expect(business, `la propiedad "${PROPERTY}" debe existir`).toBeTruthy();
    businessId = business!.id;
  });

  /** Elige la propiedad desde el menú de módulos (el selector vive ahí en el teléfono). */
  async function selectPropertyFromMenu(page: Page) {
    await enterPropertyModule(page);
    await logoButton(page).click();
    const menu = modulesMenu(page);
    await expect(menu).toBeVisible();
    const select = menu.getByRole("combobox").filter({ has: page.getByRole("option", { name: PROPERTY, exact: true }) });
    // El selector carga su lista al montarse y no reintenta (.claude/alerts/selector-de-negocio-no-reintenta.md):
    // si no aparece, cerrar y volver a abrir el menú lo vuelve a montar.
    if (!(await select.isEnabled({ timeout: 20_000 }).catch(() => false))) {
      await page.keyboard.press("Escape");
      await logoButton(page).click();
    }
    await expect(select).toBeEnabled({ timeout: 30_000 });
    await select.selectOption({ label: PROPERTY });
    await page.waitForURL(new RegExp(`/properties/${businessId}$`), { timeout: 30_000 });
  }

  test("barra inferior visible, sidebar oculto y sin scroll horizontal", async ({ page }) => {
    await selectPropertyFromMenu(page);

    await expect(bottomBar(page)).toBeVisible();
    await expect(logoButton(page)).toBeVisible();
    await expect(logoButton(page)).toHaveAttribute("aria-expanded", "false");
    // La barra lateral de escritorio no se ve (su botón "Cambiar Modulo" queda oculto).
    await expect(page.locator("aside")).toBeHidden();
    // Barra superior compacta con el nombre de la propiedad.
    await expect(page.getByRole("banner").getByText(PROPERTY, { exact: true }).first()).toBeVisible();
    // 2 accesos a cada lado del logo.
    await expect(bottomBar(page).getByRole("link")).toHaveText(["Inicio", "Residentes", "Paquetes", "Votaciones"]);

    // Páginas con tabla compartida (Table) y el resumen. Unidades, Paquetería y Parqueaderos aún
    // desbordan por su propio encabezado (pantallas de los módulos, fuera del shell).
    for (const path of ["", "/residents", "/visits", "/common-areas"]) {
      await page.goto(`/properties/${businessId}${path}`);
      await expect(bottomBar(page)).toBeVisible({ timeout: 30_000 });
      await expectNoHorizontalScroll(page);
    }

    // IAM también lleva la barra inferior; las páginas de (auth) como /select-type no.
    await page.goto("/iam");
    await expect(bottomBar(page)).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole("navigation", { name: "IAM Navigation" })).toBeVisible();
    await expectNoHorizontalScroll(page);
    await page.goto("/select-type");
    await expect(page.getByRole("heading", { name: "Selecciona un Modulo" })).toBeVisible({ timeout: 30_000 });
    await expect(bottomBar(page)).toHaveCount(0);
  });

  test("el logo abre el menú de módulos; Esc lo cierra y navegar desde él cambia de página", async ({ page }) => {
    await selectPropertyFromMenu(page);
    // Elegir propiedad navega: el menú quedó cerrado.
    await expect(modulesMenu(page)).toBeHidden();

    // Abrir y cerrar con Esc: el foco vuelve al logo.
    await logoButton(page).click();
    await expect(modulesMenu(page)).toBeVisible();
    await expect(logoButton(page)).toHaveAttribute("aria-expanded", "true");
    await expect(modulesMenu(page).getByText(PROPERTY, { exact: true }).first()).toBeVisible();
    for (const name of ["Cambiar módulo", "Cerrar sesión"]) {
      await expect(modulesMenu(page).getByRole("button", { name })).toBeVisible();
    }
    await page.keyboard.press("Escape");
    await expect(modulesMenu(page)).toBeHidden();
    await expect(logoButton(page)).toBeFocused();

    // Tocar fuera (fondo) cierra.
    await logoButton(page).click();
    await expect(modulesMenu(page)).toBeVisible();
    await page.mouse.click(195, 60);
    await expect(modulesMenu(page)).toBeHidden();

    // Navegar a un módulo desde el menú: cierra y cambia de página.
    await logoButton(page).click();
    // El selector de propiedad del menú carga su lista con server actions; Next encola la
    // navegación detrás de ellas, así que se espera a que terminen.
    await page.waitForLoadState("networkidle");
    await modulesMenu(page).getByRole("navigation", { name: "Módulos" }).getByRole("link", { name: "Visitas" }).click();
    await page.waitForURL(new RegExp(`/properties/${businessId}/visits`));
    await expect(modulesMenu(page)).toBeHidden();
    await expect(bottomBar(page)).toBeVisible();

    // Un acceso de la barra también navega y queda marcado.
    await bottomBar(page).getByRole("link", { name: "Residentes" }).click();
    await page.waitForURL(new RegExp(`/properties/${businessId}/residents`));
    await expect(bottomBar(page).getByRole("link", { name: "Residentes" })).toHaveAttribute("aria-current", "page");
  });
});

test.describe("navegación en escritorio", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("sin barra inferior; la barra lateral sí se ve", async ({ page }) => {
    await enterPropertyModule(page);
    await expect(page.locator("aside")).toBeVisible({ timeout: 30_000 });
    await expect(bottomBar(page)).toBeHidden();
    await expect(logoButton(page)).toBeHidden();
    await expect(page.getByRole("banner")).toBeHidden();
  });
});
