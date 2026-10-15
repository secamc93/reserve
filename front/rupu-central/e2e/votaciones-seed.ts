import { expect, devices, type APIRequestContext, type Page } from "@playwright/test";
import { API, apiBusinessToken, apiFindBusiness, login } from "./helpers";

// Datos y pasos comunes de los e2e de votaciones públicas (QR, red local, tiempo real).
// No es un spec (Playwright solo corre *.spec.ts).

export const PROPERTY = process.env.E2E_PROPERTY_NAME ?? "Tayazal de Suba";
/** Celular emulado en Chromium (el perfil de iPhone fuerza WebKit, que no se instala). */
export const { defaultBrowserType: _webkit, ...PHONE } = devices["iPhone 13"];
/** Carpeta opcional para guardar capturas de los e2e (p. ej. para el reporte). */
export const SHOTS_DIR = process.env.E2E_SCREENSHOTS_DIR ?? "";

export const runSuffix = () => `${Date.now().toString(36).slice(-5)}${Math.random().toString(36).slice(2, 4)}`.toUpperCase();

export async function api(request: APIRequestContext, method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE", path: string, token: string, data?: unknown) {
  const res = await request.fetch(`${API}${path}`, { method, headers: { Authorization: `Bearer ${token}` }, data });
  expect(res.ok(), `${method} ${path} -> ${res.status()} ${await res.text()}`).toBeTruthy();
  return res.status() === 204 ? {} : (await res.json()).data;
}

export type Unit = { id: number; number: string; dni: string };

export type VotingSeed = {
  businessId: number;
  q: string;
  token: string;
  groupId: number;
  groupName: string;
  votingId: number;
  votingTitle: string;
  options: Record<"Sí" | "No" | "Abstención", number>;
  units: Record<string, Unit>;
  /** Enlace del QR del grupo (solo si se pidió `publicUrlBase`). */
  publicUrl?: string;
};

/**
 * Siembra por la API un grupo con una votación activa (Sí/No/Abstención) y asistencia de
 * `attendance`. `requireDocument` es la configuración del grupo (el back anterior la ignora).
 */
export async function seedVoting(
  request: APIRequestContext,
  opts: { run: string; requireDocument?: boolean; attendance: string[]; units?: string[]; publicUrlBase?: string }
): Promise<VotingSeed> {
  const token = await apiBusinessToken(request);
  const business = await apiFindBusiness(request, PROPERTY);
  expect(business, `la propiedad "${PROPERTY}" debe existir`).toBeTruthy();
  const q = `?business_id=${business!.id}`;

  const all = (await api(request, "GET", `/horizontal-properties/property-units${q}&page=1&page_size=100`, token)).units as { id: number; number: string }[];
  const wanted = Array.from(new Set([...(opts.units ?? []), ...opts.attendance]));
  const units: Record<string, Unit> = {};
  for (const number of wanted) {
    const unit = all.find((u) => u.number === number);
    expect(unit, `la unidad ${number} debe existir`).toBeTruthy();
    // Convención de los datos de prueba: el residente de la unidad <id> tiene DNI 90000<id>.
    units[number] = { id: unit!.id, number, dni: `90000${String(unit!.id).padStart(4, "0")}` };
  }

  const now = Date.now();
  const groupName = `Asamblea e2e ${opts.run}`;
  const group = await api(request, "POST", `/horizontal-properties/voting-groups${q}`, token, {
    name: groupName, description: "e2e votación pública",
    voting_start_date: new Date(now - 60_000).toISOString(), voting_end_date: new Date(now + 86_400_000).toISOString(),
    requires_quorum: true, quorum_percentage: 51,
    require_document_validation: opts.requireDocument ?? false,
  });
  const vp = `/horizontal-properties/voting-groups/${group.id}/votings`;
  const votingTitle = `Punto e2e ${opts.run}`;
  const voting = await api(request, "POST", `${vp}${q}`, token, {
    title: votingTitle, description: "e2e", voting_type: "majority", allow_abstention: true, display_order: 1, required_percentage: 51,
  });
  const options = {} as VotingSeed["options"];
  for (const [i, [text, code, color]] of ([["Sí", "SI", "#1f8a4c"], ["No", "NO", "#c8382d"], ["Abstención", "ABS", "#8a8580"]] as const).entries()) {
    const option = await api(request, "POST", `${vp}/${voting.id}/options${q}`, token, { option_text: text, option_code: code, color, display_order: i + 1 });
    options[text] = option.id;
  }
  await api(request, "PATCH", `${vp}/${voting.id}/activate${q}`, token);
  for (const number of opts.attendance) {
    await api(request, "PUT", `${vp}/${voting.id}/units/${units[number].id}/attendance${q}`, token, { mark_attendance: true });
  }
  let publicUrl: string | undefined;
  if (opts.publicUrlBase) {
    const url = await api(request, "POST", `/horizontal-properties/voting-groups/${group.id}/generate-public-url${q}`, token, {
      duration_hours: 2, frontend_url: `${opts.publicUrlBase}/public/vote`,
    });
    publicUrl = url.public_url;
  }
  return { businessId: business!.id, q, token, groupId: group.id, groupName, votingId: voting.id, votingTitle, options, units, publicUrl };
}

export async function deleteSeed(request: APIRequestContext, seed: VotingSeed | undefined) {
  if (seed) await api(request, "DELETE", `/horizontal-properties/voting-groups/${seed.groupId}${seed.q}`, seed.token).catch(() => {});
}

/** Voto registrado por el administrador (API), como si lo hiciera otro dispositivo. */
export async function adminVote(request: APIRequestContext, seed: VotingSeed, unit: string, option: keyof VotingSeed["options"]) {
  const vp = `/horizontal-properties/voting-groups/${seed.groupId}/votings/${seed.votingId}`;
  await api(request, "POST", `${vp}/votes${seed.q}`, seed.token, {
    business_id: seed.businessId, property_unit_id: seed.units[unit].id, voting_option_id: seed.options[option],
  });
}

/** Login por la UI y elección de la propiedad en el selector de negocio (deja el token de negocio). */
export async function loginAndSelectProperty(page: Page, businessId: number) {
  await login(page);
  await expect(page).toHaveURL(/\/select-type/);
  await page.getByRole("button", { name: /Propiedad Horizontal/ }).click();
  await expect(page).toHaveURL(/\/properties$/);
  const businessSelect = page.getByRole("combobox").filter({ has: page.getByRole("option", { name: PROPERTY, exact: true }) });
  // .claude/alerts/selector-de-negocio-no-reintenta.md: si la lista queda vacía, recargar una vez.
  if (!(await businessSelect.isEnabled({ timeout: 20_000 }).catch(() => false))) await page.reload();
  await expect(businessSelect).toBeEnabled({ timeout: 30_000 });
  await businessSelect.selectOption({ label: PROPERTY });
  await page.waitForURL(new RegExp(`/properties/${businessId}$`), { timeout: 30_000 });
  await page.waitForLoadState("networkidle");
}

/**
 * R1: elige la unidad y, si el grupo exige documento, lo escribe. Si el campo no está y el back
 * responde que el documento es requerido (back anterior a la configuración por grupo), el campo
 * aparece y se completa.
 */
export async function identify(page: Page, unit: string, dni: string) {
  await page.getByLabel("Tu unidad").fill(unit);
  await page.getByRole("option", { name: new RegExp(`^${unit}`) }).click();
  const doc = page.getByLabel("Documento de identidad");
  const continuar = page.getByRole("button", { name: "Continuar" });
  if (!(await doc.isVisible())) {
    await continuar.click();
    // O pasa a R2, o el back pidió el documento.
    await expect(doc.or(page.getByRole("heading", { name: "Puntos a votar" }))).toBeVisible({ timeout: 20_000 });
    if (!(await doc.isVisible())) return;
  }
  await doc.fill(dni);
  await continuar.click();
}
