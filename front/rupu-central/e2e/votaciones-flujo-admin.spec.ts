import { expect, test, type APIRequestContext, type Page } from "@playwright/test";
import { API, apiBusinessToken, apiFindBusiness, login } from "./helpers";

// Flujo del administrador (diseño "Votaciones - Flujo completo"):
// A2 crear grupo -> A3 votación con sus opciones -> A5 QR -> A4 asistencia -> A6 panel en vivo
// -> A7 registrar voto de una unidad -> A8 resultado final al cerrar. Todo por la UI; la API solo
// se usa para limpiar. Los nombres llevan sufijo propio de la corrida.

const PROPERTY = process.env.E2E_PROPERTY_NAME ?? "Tayazal de Suba";
const UNIT = process.env.E2E_VOTE_UNIT ?? "T2-102";
const RUN = Date.now().toString(36).slice(-6).toUpperCase();
const GROUP = `Asamblea flujo e2e ${RUN}`;
const VOTING = `Reglamento e2e ${RUN}`;

async function selectBusiness(page: Page, businessId: number) {
  await login(page);
  await expect(page).toHaveURL(/\/select-type/);
  await page.getByRole("button", { name: /Propiedad Horizontal/ }).click();
  await expect(page).toHaveURL(/\/properties$/);
  const businessSelect = page.getByRole("combobox").filter({ has: page.getByRole("option", { name: PROPERTY, exact: true }) });
  await expect(businessSelect).toBeEnabled({ timeout: 20_000 });
  await businessSelect.selectOption({ label: PROPERTY });
  await page.waitForURL(new RegExp(`/properties/${businessId}$`), { timeout: 30_000 });
  await page.waitForLoadState("networkidle");
}

async function deleteGroupByName(request: APIRequestContext, businessId: number) {
  const token = await apiBusinessToken(request);
  const res = await request.get(`${API}/horizontal-properties/voting-groups?business_id=${businessId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const groups: { id: number; name: string }[] = (await res.json()).data ?? [];
  for (const g of groups.filter((x) => x.name === GROUP)) {
    await request.delete(`${API}/horizontal-properties/voting-groups/${g.id}?business_id=${businessId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }
}

test.describe("votaciones — flujo del administrador", () => {
  test.setTimeout(180_000);
  let businessId = 0;

  test.beforeAll(async ({ request }) => {
    const business = await apiFindBusiness(request, PROPERTY);
    expect(business, `la propiedad "${PROPERTY}" debe existir`).toBeTruthy();
    businessId = business!.id;
  });

  test.afterAll(async ({ request }) => {
    if (businessId) await deleteGroupByName(request, businessId).catch(() => {});
  });

  test("crear grupo y votación con opciones, asistencia, voto presencial y resultado", async ({ page }) => {
    await selectBusiness(page, businessId);
    await page.goto(`/properties/${businessId}/voting-groups`);
    await expect(page.getByRole("heading", { name: "Grupos de votación" })).toBeVisible({ timeout: 30_000 });

    // A2 · Nuevo grupo
    await page.getByRole("button", { name: "+ Nuevo grupo" }).first().click();
    const groupDialog = page.getByRole("dialog", { name: "Nuevo grupo" });
    await groupDialog.getByLabel("Nombre").fill(GROUP);
    await groupDialog.getByLabel("Descripción").fill("Grupo creado por el e2e del flujo admin");
    await expect(groupDialog.getByRole("switch", { name: "Requiere quórum" })).toHaveAttribute("aria-checked", "true");
    await groupDialog.getByRole("button", { name: "Crear grupo" }).click();
    await expect(groupDialog).toBeHidden();

    const group = page.getByRole("region", { name: `Grupo ${GROUP}` });
    await expect(group).toBeVisible();
    const expand = group.getByRole("button", { name: `Expandir grupo ${GROUP}` });
    if (await expand.isVisible()) await expand.click();
    await expect(group.getByText("Aún no hay votaciones en este grupo.")).toBeVisible();

    // A3 · Nueva votación con sus opciones (Sí / No / Abstención por defecto)
    await group.getByRole("button", { name: "+ Nueva votación" }).click();
    const votingDialog = page.getByRole("dialog", { name: "Nueva votación" });
    await votingDialog.getByRole("button", { name: "Guardar votación" }).click();
    await expect(votingDialog.getByText("El título debe tener al menos 3 caracteres")).toBeVisible();
    await votingDialog.getByLabel("Título").fill(VOTING);
    await votingDialog.getByLabel("Descripción").fill("Se somete a aprobación el reglamento");
    await votingDialog.getByRole("radio", { name: "Mayoría" }).click();
    await expect(votingDialog.getByRole("button", { name: "Quitar opción Abstención" })).toBeVisible();
    await votingDialog.getByRole("button", { name: "Guardar votación" }).click();
    await expect(votingDialog).toBeHidden({ timeout: 20_000 });

    const row = group.getByRole("listitem", { name: VOTING });
    await expect(row).toContainText("Lista");
    await expect(row).toContainText("Mayoría · quórum 51% · abstención permitida");
    await expect(row.getByRole("button", { name: `Iniciar: ${VOTING}` })).toBeVisible();

    // A5 · QR del grupo
    await group.getByRole("button", { name: "QR" }).click();
    const qrDialog = page.getByRole("dialog", { name: GROUP });
    await expect(qrDialog.getByRole("button", { name: "Proyectar en pantalla completa" })).toBeVisible({ timeout: 20_000 });
    await expect(qrDialog.getByRole("img", { name: new RegExp(`Código QR para votar en ${GROUP}`) })).toBeVisible();
    await qrDialog.getByRole("button", { name: "Cerrar" }).click();

    // A4 · Asistencia: marcar la unidad presente
    await group.getByRole("link", { name: "Asistencia" }).click();
    await expect(page.getByRole("heading", { name: "Asistencia" })).toBeVisible({ timeout: 30_000 });
    const presence = page.getByRole("switch", { name: `Presente ${UNIT}` });
    await expect(presence).toHaveAttribute("aria-checked", "false", { timeout: 30_000 });
    await presence.click();
    await expect(presence).toHaveAttribute("aria-checked", "true");
    await expect(page.getByRole("tab", { name: /Presentes · 1/ })).toBeVisible();
    // Persistió en el back: al recargar sigue presente.
    await page.reload();
    await expect(page.getByRole("switch", { name: `Presente ${UNIT}` })).toHaveAttribute("aria-checked", "true", { timeout: 30_000 });

    // A1 -> A6 · Iniciar la votación abre el panel en vivo
    await page.getByRole("link", { name: GROUP }).click();
    const groupAgain = page.getByRole("region", { name: `Grupo ${GROUP}` });
    const expandAgain = groupAgain.getByRole("button", { name: `Expandir grupo ${GROUP}` });
    if (await expandAgain.isVisible()) await expandAgain.click();
    await groupAgain.getByRole("button", { name: `Iniciar: ${VOTING}` }).click();
    await expect(page).toHaveURL(/\/votings\/\d+\/live$/, { timeout: 30_000 });
    await expect(page.getByRole("heading", { name: VOTING })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText("EN VIVO")).toBeVisible();

    // A7 · Registrar el voto de la unidad desde su ficha
    await page.getByRole("button", { name: new RegExp(`^${UNIT} ·.*clic para registrar voto`) }).click();
    const voteDialog = page.getByRole("dialog", { name: "Registrar voto" });
    await expect(voteDialog.getByText(UNIT, { exact: true })).toBeVisible();
    await expect(voteDialog.getByText(/presente/)).toBeVisible();
    await voteDialog.getByRole("radio", { name: "Sí" }).click();
    await voteDialog.getByRole("button", { name: "Guardar: Sí" }).click();
    await expect(voteDialog).toBeHidden({ timeout: 20_000 });
    await expect(page.getByRole("button", { name: new RegExp(`^${UNIT} ·.*Votó: Sí`) })).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole("tab", { name: /Pendientes · \d+/ })).toBeVisible();

    // A8 · Cerrar la votación muestra el resultado final
    await page.getByRole("button", { name: "Cerrar votación" }).click();
    await page.getByRole("dialog", { name: "¿Cerrar la votación?" }).getByRole("button", { name: "Cerrar y ver resultado" }).click();
    await expect(page.getByText(/VOTACIÓN 01 \/ 01 · CERRADA/)).toBeVisible({ timeout: 20_000 });
    // Una sola unidad votó: la participación no alcanza el quórum del 51%.
    await expect(page.getByText("SIN QUÓRUM", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Reabrir" })).toBeVisible();
  });
});
