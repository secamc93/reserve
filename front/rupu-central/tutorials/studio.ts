import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { Locator, Page, TestInfo } from "@playwright/test";
import { narrate, speakable, voiceEnabled } from "./voice";

// Utilidades para grabar tutoriales: subtítulo en pantalla, resaltado del elemento antes de
// cada acción y ocultar lo que no debe salir en un video (indicador de desarrollo de Next,
// herramientas y correo del super admin: los videos los ve cualquier administrador).

const DEMO_USER = { name: "Administración", email: "admin@losalmendros.co" };

// Momento en que se muestra cada narración, relativo al inicio de la grabación de la página.
const narration = new WeakMap<Page, { start: number; clips: { at: number; file: string }[] }>();

export async function prepare(page: Page) {
  narration.set(page, { start: Date.now(), clips: [] });
  await page.addInitScript(({ name, email, demoProperty }) => {
    const css = `
      nextjs-portal, [data-nextjs-toast], #__next-build-watcher, section[aria-label="Otorgar plan"] { display: none !important; }
      #tuto-caption { position: fixed; left: 50%; bottom: 28px; transform: translateX(-50%); z-index: 2147483647;
        max-width: 880px; padding: 14px 22px; border-radius: 14px; background: rgba(4, 32, 31, .92); color: #fff;
        font: 600 19px/1.35 system-ui, -apple-system, "Segoe UI", sans-serif; text-align: center;
        box-shadow: 0 18px 40px -18px rgba(0,0,0,.6); transition: opacity .25s; pointer-events: none; }
      #tuto-caption b { color: #2CD8CC; }
      .tuto-focus { outline: 3px solid #2CD8CC !important; outline-offset: 3px !important; border-radius: 10px;
        box-shadow: 0 0 0 8px rgba(44,216,204,.22) !important; transition: outline .2s; }
    `;
    const hideSuperAdmin = () => {
      for (const el of Array.from(document.querySelectorAll("body *"))) {
        if (el.children.length) continue;
        const t = el.textContent?.trim() ?? "";
        if (t === "SUPER ADMIN") (el as HTMLElement).style.display = "none";
        else if (t === "Super Admin") el.textContent = name;
        else if (t.includes("@hotmail.com") || t.includes("@gmail.com")) el.textContent = email;
        else if (t === "A la medida (super admin)") {
          const card = el.closest("[role=radio], button, label") as HTMLElement | null;
          if (card) card.style.display = "none";
        } else if (t === "Super admin:" || t.startsWith("Sin cobro:")) {
          const row = el.closest("div") as HTMLElement | null;
          if (row) row.style.display = "none";
        }
      }
    };
    // En los planes solo se muestra el conjunto de demostración: los demás son clientes reales.
    const hideOtherProperties = () => {
      for (const label of Array.from(document.querySelectorAll('section[aria-label="Conjuntos"] label'))) {
        if (!label.textContent?.includes(demoProperty)) (label as HTMLElement).style.display = "none";
      }
    };
    const start = () => {
      const style = document.createElement("style");
      style.textContent = css;
      document.head.appendChild(style);
      const mask = () => { hideSuperAdmin(); hideOtherProperties(); };
      mask();
      new MutationObserver(mask).observe(document.body, { childList: true, subtree: true, characterData: true });
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
    else start();
  }, { ...DEMO_USER, demoProperty: process.env.DEMO_PROPERTY ?? "Conjunto Los Almendros" });
}

/** Muestra un subtítulo (admite <b>…</b>) y espera para que se alcance a leer (o a que termine la voz). */
export async function caption(page: Page, html: string, ms = 2200) {
  const voice = voiceEnabled ? await narrate(speakable(html)) : null;
  await page.evaluate((h) => {
    let el = document.getElementById("tuto-caption");
    if (!el) {
      el = document.createElement("div");
      el.id = "tuto-caption";
      document.body.appendChild(el);
    }
    el.innerHTML = h;
    el.style.opacity = "1";
  }, html);
  const track = narration.get(page);
  if (voice && track) track.clips.push({ at: Date.now() - track.start, file: voice.file });
  await page.waitForTimeout(voice ? Math.max(ms, voice.ms + 450) : ms);
}

/** Guarda junto al video los audios y en qué momento suenan (los mezcla build-videos.sh). */
export function saveNarration(page: Page, info: TestInfo) {
  const track = narration.get(page);
  if (!track?.clips.length) return;
  mkdirSync(info.outputDir, { recursive: true });
  writeFileSync(path.join(info.outputDir, "narration.json"), JSON.stringify(track.clips, null, 2));
}

export async function hideCaption(page: Page) {
  await page.evaluate(() => {
    const el = document.getElementById("tuto-caption");
    if (el) el.style.opacity = "0";
  });
}

/** Resalta el elemento un momento y luego hace clic, como lo haría una persona. */
export async function tap(locator: Locator, pause = 700) {
  await locator.scrollIntoViewIfNeeded();
  await locator.evaluate((el) => el.classList.add("tuto-focus"));
  await locator.page().waitForTimeout(pause);
  await locator.evaluate((el) => el.classList.remove("tuto-focus")).catch(() => {});
  await locator.click();
}

/** Escribe como una persona (letra por letra). */
export async function write(locator: Locator, text: string) {
  await locator.evaluate((el) => el.classList.add("tuto-focus"));
  await locator.click();
  await locator.fill("");
  await locator.pressSequentially(text, { delay: 45 });
  await locator.evaluate((el) => el.classList.remove("tuto-focus"));
}
