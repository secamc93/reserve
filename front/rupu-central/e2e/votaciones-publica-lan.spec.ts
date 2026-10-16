import { expect, test } from "@playwright/test";
import { PHONE, SHOTS_DIR, deleteSeed, loginAndSelectProperty, runSuffix, seedVoting, type VotingSeed } from "./votaciones-seed";

// Reporte del usuario (2026-10-15): abrió el admin por la IP de la red (http://192.168.3.11:3000)
//  1. "No me dejó copiar": navigator.clipboard no existe fuera de HTTPS/localhost.
//  2. "La URL no abre nada para votar": el enlace del QR salía como https://<ip>:3000/… .
// Correr con PLAYWRIGHT_BASE_URL=http://<ip-de-la-red>:<puerto> para reproducir el contexto no
// seguro; con localhost también pasa (contexto seguro: usa navigator.clipboard).

const BASE = new URL(process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000");

test.describe("votaciones — enlace público por la red local", () => {
  let seed: VotingSeed | undefined;

  test.afterAll(async ({ request }) => {
    await deleteSeed(request, seed);
  });

  test("A5: el enlace del QR usa el origen real (http por IP), se copia y abre R1 en el celular", async ({ page, browser, request }, testInfo) => {
    test.setTimeout(120_000);
    seed = await seedVoting(request, { run: `LAN ${runSuffix()}`, attendance: [] });

    await loginAndSelectProperty(page, seed.businessId);
    await page.goto(`/properties/${seed.businessId}/voting-groups`);
    const group = page.getByRole("region", { name: `Grupo ${seed.groupName}` });
    await expect(group).toBeVisible({ timeout: 30_000 });

    // A5 · QR del grupo: el enlace lo arma la Server Action con el origen de la petición.
    await group.getByRole("button", { name: "QR" }).click();
    const qrDialog = page.getByRole("dialog", { name: seed.groupName });
    await expect(qrDialog.getByRole("button", { name: "Proyectar en pantalla completa" })).toBeVisible({ timeout: 20_000 });
    await qrDialog.getByRole("button", { name: "ver enlace completo" }).click();
    const fullUrl = (await qrDialog.getByText(/\/public\/vote\?token=/).textContent())!.trim();
    expect(fullUrl.startsWith(`${BASE.origin}/public/vote?token=`), `enlace generado: ${fullUrl}`).toBe(true);
    if (/^\d+\.\d+\.\d+\.\d+$/.test(BASE.hostname)) expect(fullUrl.startsWith("http://")).toBe(true);

    // ¿El navegador considera seguro el contexto? (por IP no lo es: no hay navigator.clipboard)
    const secure = await page.evaluate(() => window.isSecureContext);
    testInfo.annotations.push({ type: "contexto", description: secure ? "seguro" : "no seguro (sin navigator.clipboard)" });

    await qrDialog.getByRole("button", { name: "Copiar enlace" }).click();
    await expect(qrDialog.getByRole("button", { name: "Enlace copiado" })).toBeVisible();
    await expect(qrDialog.getByText("Selecciona y copia el enlace")).toHaveCount(0);
    if (SHOTS_DIR) await page.screenshot({ path: `${SHOTS_DIR}/a5-qr-enlace-copiado.png` });

    // 1i · Proyección: muestra la misma URL (sin protocolo) para quien no tenga cámara.
    await qrDialog.getByRole("button", { name: "Proyectar en pantalla completa" }).click();
    await expect(page.getByText(fullUrl.replace(/^https?:\/\//, ""), { exact: true })).toBeVisible();
    if (SHOTS_DIR) await page.screenshot({ path: `${SHOTS_DIR}/1i-proyeccion-url.png` });
    await page.getByRole("button", { name: "Salir" }).click();

    // El enlace abre R1 en un celular.
    const phone = await browser.newContext({ ...PHONE });
    try {
      const mobile = await phone.newPage();
      await mobile.goto(fullUrl);
      await expect(mobile.getByRole("heading", { name: seed.groupName })).toBeVisible({ timeout: 30_000 });
      await expect(mobile.getByLabel("Tu unidad")).toBeEnabled({ timeout: 20_000 });
      await expect(mobile.getByRole("button", { name: "Continuar" })).toBeVisible();
      if (SHOTS_DIR) await mobile.screenshot({ path: `${SHOTS_DIR}/r1-celular-por-lan.png` });
    } finally {
      await phone.close();
    }
  });
});
