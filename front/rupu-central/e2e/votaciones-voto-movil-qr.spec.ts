import { expect, test, devices, type APIRequestContext } from "@playwright/test";
import { API, apiBusinessToken, apiFindBusiness, requireCredentials } from "./helpers";

// CU-03 (.claude/testing/votaciones/front/CU-03-voto-movil-por-qr.md): un residente vota desde el
// celular con el enlace del QR del grupo, y el voto queda contado para el admin. Los datos (grupo,
// votación, opciones, asistencia) se siembran por la API con sufijo propio de la corrida.
// Requiere en la propiedad una unidad con residente cuyo DNI se conoce: E2E_VOTE_UNIT y E2E_VOTE_DNI
// (por defecto la unidad T2-102 de la ronda de .claude/testing/votaciones/back/ronda_api.py).

const PROPERTY = process.env.E2E_PROPERTY_NAME ?? "Tayazal de Suba";
const UNIT_NUMBER = process.env.E2E_VOTE_UNIT ?? "T2-102";
const FRONT_VOTE_URL = `${process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000"}/public/vote`;
const RUN = Date.now().toString(36).slice(-6).toUpperCase();
// Celular emulado en Chromium (el perfil de iPhone fuerza WebKit, que no se instala).
const { defaultBrowserType: _webkit, ...PHONE } = devices["iPhone 13"];

type Seed = { q: string; token: string; groupId: number; votingId: number; unitId: number; dni: string; publicUrl: string };

async function api(request: APIRequestContext, method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE", path: string, token: string, data?: unknown) {
  const res = await request.fetch(`${API}${path}`, { method, headers: { Authorization: `Bearer ${token}` }, data });
  expect(res.ok(), `${method} ${path} -> ${res.status()} ${await res.text()}`).toBeTruthy();
  return res.status() === 204 ? {} : (await res.json()).data;
}

async function seedVoting(request: APIRequestContext): Promise<Seed> {
  const token = await apiBusinessToken(request);
  const business = await apiFindBusiness(request, PROPERTY);
  expect(business, `la propiedad "${PROPERTY}" debe existir`).toBeTruthy();
  const q = `?business_id=${business!.id}`;

  const units = (await api(request, "GET", `/horizontal-properties/property-units${q}&page=1&page_size=100`, token)).units as { id: number; number: string }[];
  const unit = units.find((u) => u.number === UNIT_NUMBER);
  expect(unit, `la unidad ${UNIT_NUMBER} debe existir (correr antes ronda_api.py)`).toBeTruthy();
  const dni = process.env.E2E_VOTE_DNI ?? `90000${String(unit!.id).padStart(4, "0")}`;

  const now = Date.now();
  const group = await api(request, "POST", `/horizontal-properties/voting-groups${q}`, token, {
    name: `Asamblea e2e ${RUN}`, description: "e2e voto móvil",
    voting_start_date: new Date(now - 60_000).toISOString(), voting_end_date: new Date(now + 86_400_000).toISOString(),
    requires_quorum: true, quorum_percentage: 51,
  });
  const vp = `/horizontal-properties/voting-groups/${group.id}/votings`;
  const voting = await api(request, "POST", `${vp}${q}`, token, {
    title: `Presupuesto e2e ${RUN}`, description: "e2e", voting_type: "majority", allow_abstention: true, display_order: 1, required_percentage: 51,
  });
  for (const [i, [text, code, color]] of [["Sí", "SI", "#1f8a4c"], ["No", "NO", "#c8382d"], ["Abstención", "ABS", "#8a8580"]].entries()) {
    await api(request, "POST", `${vp}/${voting.id}/options${q}`, token, { option_text: text, option_code: code, color, display_order: i + 1 });
  }
  await api(request, "PATCH", `${vp}/${voting.id}/activate${q}`, token);
  await api(request, "PUT", `${vp}/${voting.id}/units/${unit!.id}/attendance${q}`, token, { mark_attendance: true });
  const url = await api(request, "POST", `/horizontal-properties/voting-groups/${group.id}/generate-public-url${q}`, token, {
    duration_hours: 2, frontend_url: FRONT_VOTE_URL,
  });
  return { q, token, groupId: group.id, votingId: voting.id, unitId: unit!.id, dni, publicUrl: url.public_url };
}

test.describe("votaciones — voto desde el celular por QR", () => {
  test.use(PHONE);
  let seed: Seed;

  test.beforeAll(async ({ request }) => {
    requireCredentials();
    seed = await seedVoting(request);
  });

  test.afterAll(async ({ request }) => {
    if (seed) await api(request, "DELETE", `/horizontal-properties/voting-groups/${seed.groupId}${seed.q}`, seed.token).catch(() => {});
  });

  test("CU-03: DNI que no coincide no deja continuar", async ({ page }) => {
    await page.goto(seed.publicUrl);
    await page.getByLabel("Unidad Residencial").fill(UNIT_NUMBER);
    await page.getByRole("button", { name: new RegExp(`^${UNIT_NUMBER}`) }).click();
    await page.getByLabel("Documento de Identidad (DNI)").fill("111");
    await page.getByRole("button", { name: "Continuar a Votación" }).click();
    await expect(page.getByRole("heading", { name: "Validación de Residente" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Votar ahora" })).toHaveCount(0);
  });

  test("CU-03: el residente vota Sí y el admin ve el voto contado", async ({ page, request }) => {
    await page.goto(seed.publicUrl);
    await expect(page.getByRole("heading", { name: "Validación de Residente" })).toBeVisible();
    await page.getByLabel("Unidad Residencial").fill(UNIT_NUMBER);
    await page.getByRole("button", { name: new RegExp(`^${UNIT_NUMBER}`) }).click();
    await page.getByLabel("Documento de Identidad (DNI)").fill(seed.dni);
    await page.getByRole("button", { name: "Continuar a Votación" }).click();

    await page.getByRole("button", { name: "Votar ahora" }).first().click();
    await expect(page.getByRole("heading", { name: "Seleccione su voto:" })).toBeVisible();
    const confirmar = page.getByRole("button", { name: "Confirmar Voto" });
    await expect(confirmar).toBeDisabled();
    await page.getByRole("radio", { name: /^Sí/ }).click();
    await expect(confirmar).toBeEnabled();
    await confirmar.click();

    // El voto queda registrado para el admin (por API: independiente de la pantalla de confirmación).
    const vp = `/horizontal-properties/voting-groups/${seed.groupId}/votings/${seed.votingId}`;
    await expect.poll(async () => {
      const details = await api(request, "GET", `${vp}/voting-details${seed.q}`, seed.token);
      const u = (details.units as { property_unit_id: number; has_voted: boolean; option_code: string | null }[])
        .find((x) => x.property_unit_id === seed.unitId);
      return u?.has_voted ? u.option_code : "sin voto";
    }, { timeout: 15_000 }).toBe("SI");

    // Volver a entrar con la misma unidad no permite votar de nuevo en esa votación.
    const again = await request.post(`${API}/public/validate-resident`, {
      headers: { Authorization: `Bearer ${new URL(seed.publicUrl).searchParams.get("token")}` },
      data: { property_unit_id: seed.unitId, dni: seed.dni },
    });
    const vat = (await again.json()).data.voting_auth_token as string;
    const dup = await request.post(`${API}/public/vote`, {
      headers: { Authorization: `Bearer ${vat}` },
      data: { voting_id: seed.votingId, voting_option_id: 1 },
    });
    expect([400, 409]).toContain(dup.status());
  });
});
