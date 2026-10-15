import { expect, test, type Page } from "@playwright/test";
import {
  PHONE, SHOTS_DIR, adminVote, deleteSeed, identify, loginAndSelectProperty, runSuffix, seedVoting, type VotingSeed,
} from "./votaciones-seed";

// Tiempo real sin depender de NEXT_PUBLIC_API_BASE_URL en el navegador: el panel A6 y el
// progreso R4 abren el SSE contra route handlers del mismo origen del front, que hablan con el
// back por API_BASE_URL. Así funciona también desde otro dispositivo de la red.
//
// Dependen del back con la configuración "exigir documento por grupo" (otro agente):
//  - "R4 se actualiza por SSE…" (SSE público con token de residente de un grupo);
//  - "grupo sin documento…" (validate-resident sin dni).
// El de A6 funciona con el back actual.

const UNIT_A = process.env.E2E_VOTE_UNIT ?? "T2-102";
const UNIT_B = process.env.E2E_VOTE_UNIT_B ?? "T2-101";
const UNIT_C = process.env.E2E_VOTE_UNIT_C ?? "T1-101";

/** Marca la página: si se recarga, la marca desaparece. */
const markNoReload = (page: Page) => page.evaluate(() => ((window as unknown as { __e2eNoReload: boolean }).__e2eNoReload = true));
const stillSamePage = (page: Page) => page.evaluate(() => (window as unknown as { __e2eNoReload?: boolean }).__e2eNoReload === true);

const pendingCount = async (page: Page) => {
  const name = (await page.getByRole("tab", { name: /Pendientes · \d+/ }).first().textContent()) ?? "";
  return Number(name.match(/Pendientes · (\d+)/)?.[1] ?? NaN);
};

test.describe("votaciones — tiempo real", () => {
  test.setTimeout(150_000);
  const seeds: VotingSeed[] = [];

  test.afterAll(async ({ request }) => {
    for (const seed of seeds) await deleteSeed(request, seed);
  });

  test("A6: el panel en vivo se actualiza sin recargar cuando otro dispositivo vota", async ({ page, request }) => {
    const seed = await seedVoting(request, { run: `RT A6 ${runSuffix()}`, attendance: [UNIT_A, UNIT_B] });
    seeds.push(seed);

    // El stream del panel va al front (mismo origen), no al back directo.
    const stream = page.waitForResponse((r) => /\/votings\/\d+\/live\/stream\?token=/.test(r.url()), { timeout: 60_000 });
    await loginAndSelectProperty(page, seed.businessId);
    await page.goto(`/properties/${seed.businessId}/voting-groups/${seed.groupId}/votings/${seed.votingId}/live`);
    await expect(page.getByRole("heading", { name: seed.votingTitle })).toBeVisible({ timeout: 30_000 });
    const streamResponse = await stream;
    expect(streamResponse.status()).toBe(200);
    expect(new URL(streamResponse.url()).origin).toBe(new URL(page.url()).origin);
    expect(await streamResponse.headerValue("content-type")).toMatch(/text\/event-stream/);
    await expect(page.getByText("EN VIVO")).toBeVisible();

    const tileA = page.getByRole("button", { name: new RegExp(`^${UNIT_A} ·`) });
    await expect(tileA).toHaveAccessibleName(/clic para registrar voto/, { timeout: 30_000 });
    const pendingBefore = await pendingCount(page);
    await markNoReload(page);

    // Votan por la API (como otro dispositivo): el panel cambia solo.
    await adminVote(request, seed, UNIT_A, "Sí");
    await expect(page.getByRole("button", { name: new RegExp(`^${UNIT_A} ·.*Votó: Sí`) })).toBeVisible({ timeout: 15_000 });
    await adminVote(request, seed, UNIT_B, "No");
    await expect(page.getByRole("button", { name: new RegExp(`^${UNIT_B} ·.*Votó: No`) })).toBeVisible({ timeout: 15_000 });
    await expect.poll(() => pendingCount(page), { timeout: 15_000 }).toBe(pendingBefore - 2);
    expect(await stillSamePage(page)).toBe(true);
    await expect(page.getByText("RECONECTANDO")).toHaveCount(0);
    if (SHOTS_DIR) await page.screenshot({ path: `${SHOTS_DIR}/a6-en-vivo-sin-recargar.png` });
  });

  test("R4 se actualiza por SSE en el celular cuando el admin registra un voto", async ({ browser, request }) => {
    const seed = await seedVoting(request, {
      run: `RT R4 ${runSuffix()}`, requireDocument: true, attendance: [UNIT_A, UNIT_B], publicUrlBase: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    });
    seeds.push(seed);

    const phone = await browser.newContext({ ...PHONE });
    try {
      const page = await phone.newPage();
      await page.goto(seed.publicUrl!);
      await identify(page, UNIT_A, seed.units[UNIT_A].dni);
      await expect(page.getByRole("heading", { name: "Puntos a votar" })).toBeVisible({ timeout: 20_000 });
      await page.getByRole("listitem", { name: seed.votingTitle }).getByRole("button", { name: "Votar ahora" }).click();
      await page.getByRole("radio", { name: /^Sí/ }).click();

      const stream = page.waitForResponse((r) => r.url().includes("/public/vote/stream?"), { timeout: 30_000 });
      await page.getByRole("button", { name: "Confirmar voto: Sí" }).click();
      await expect(page.getByText("Tu voto quedó registrado: Sí")).toBeVisible();
      // El SSE público acepta el token del residente de un grupo (back nuevo).
      expect((await stream).status()).toBe(200);
      await expect(page.getByText("EN VIVO")).toBeVisible();

      const noRow = page.getByRole("list", { name: "Resultados por opción" }).getByRole("listitem", { name: "No", exact: true });
      await expect(noRow).toContainText("0 un.");
      await markNoReload(page);

      await adminVote(request, seed, UNIT_B, "No");
      await expect(noRow).toContainText("1 un.", { timeout: 10_000 });
      expect(await stillSamePage(page)).toBe(true);
      if (SHOTS_DIR) await page.screenshot({ path: `${SHOTS_DIR}/r4-actualizado-por-sse.png` });
    } finally {
      await phone.close();
    }
  });

  test("grupo sin documento: R1 pide solo la unidad y se vota", async ({ browser, request }) => {
    const seed = await seedVoting(request, {
      run: `RT SD ${runSuffix()}`, requireDocument: false, attendance: [UNIT_C], publicUrlBase: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    });
    seeds.push(seed);

    const phone = await browser.newContext({ ...PHONE });
    try {
      const page = await phone.newPage();
      await page.goto(seed.publicUrl!);
      await expect(page.getByLabel("Tu unidad")).toBeEnabled({ timeout: 30_000 });
      await expect(page.getByLabel("Documento de identidad")).toHaveCount(0);
      await page.getByLabel("Tu unidad").fill(UNIT_C);
      await page.getByRole("option", { name: new RegExp(`^${UNIT_C}`) }).click();
      if (SHOTS_DIR) await page.screenshot({ path: `${SHOTS_DIR}/r1-sin-documento.png` });
      await page.getByRole("button", { name: "Continuar" }).click();

      await expect(page.getByRole("heading", { name: "Puntos a votar" })).toBeVisible({ timeout: 20_000 });
      await page.getByRole("listitem", { name: seed.votingTitle }).getByRole("button", { name: "Votar ahora" }).click();
      await page.getByRole("radio", { name: /^Abstención/ }).click();
      await page.getByRole("button", { name: "Confirmar voto: Abstención" }).click();
      await expect(page.getByText("Tu voto quedó registrado: Abstención")).toBeVisible();
      // Volver a la lista desde R4 marca el punto como votado.
      await page.getByRole("button", { name: "Volver a la lista de puntos" }).click();
      await expect(page.getByRole("listitem", { name: seed.votingTitle })).toContainText("Votaste");
    } finally {
      await phone.close();
    }
  });
});
