import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { Locator, Page, TestInfo } from "@playwright/test";
import { narrate, voiceEnabled } from "./voice";

// Utilidades para grabar tutoriales: subtítulo en pantalla, resaltado del elemento antes de
// cada acción y ocultar lo que no debe salir en un video (indicador de desarrollo de Next,
// herramientas y correo del super admin: los videos los ve cualquier administrador).

const DEMO_USER = { name: "Administración", email: "admin@losalmendros.co" };

// Narración de la escena: cada audio con el momento en que empieza (relativo al inicio de la
// grabación) y hasta cuándo está hablando, para no encimar frases.
const narration = new WeakMap<Page, { start: number; trim: number; clips: { at: number; file: string }[]; busyUntil: number }>();

export async function prepare(page: Page) {
  narration.set(page, { start: Date.now(), trim: 0, clips: [], busyUntil: 0 });
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
      // Una pasada por cuadro como máximo: recorrer todo el DOM en cada cambio satura páginas grandes.
      let queued = false;
      const mask = () => {
        if (queued) return;
        queued = true;
        requestAnimationFrame(() => {
          queued = false;
          hideSuperAdmin();
          hideOtherProperties();
        });
      };
      hideSuperAdmin();
      hideOtherProperties();
      new MutationObserver(mask).observe(document.body, { childList: true, subtree: true, characterData: true });
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
    else start();
  }, { ...DEMO_USER, demoProperty: process.env.DEMO_PROPERTY ?? "Conjunto Los Almendros" });
}

/** La página ya cargó: el video final empieza aquí (build-videos.sh recorta la carga inicial). */
export function markReady(page: Page) {
  const track = narration.get(page);
  if (track) track.trim = Math.max(0, Date.now() - track.start - 600);
}

async function untilQuiet(page: Page) {
  const track = narration.get(page);
  const wait = track ? track.busyUntil - Date.now() : 0;
  if (wait > 0) await page.waitForTimeout(wait);
}

/**
 * La voz dice `text` desde ahora y la escena sigue (habla mientras pasan las acciones).
 * Si todavía está diciendo la frase anterior, espera a que termine. Sin TUTORIAL_VOICE no hace nada.
 */
export async function say(page: Page, text: string) {
  const track = narration.get(page);
  if (!voiceEnabled || !track) return;
  const voice = await narrate(text);
  await untilQuiet(page);
  const now = Date.now();
  track.clips.push({ at: now - track.start, file: voice.file });
  track.busyUntil = now + voice.ms + 250;
}

/**
 * Muestra un subtítulo (admite <b>…</b>) y espera `ms` para que se alcance a leer. Con `speech`, la
 * voz dice ese texto (más completo que el subtítulo) y la escena espera a que termine.
 */
export async function caption(page: Page, html: string, ms = 2200, speech?: string) {
  if (speech) await say(page, speech);
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
  await page.waitForTimeout(ms);
  if (speech) await untilQuiet(page);
}

/** Cierre de escena: deja terminar la última frase y quita el subtítulo. */
export async function finish(page: Page) {
  await untilQuiet(page);
  await page.waitForTimeout(500);
  await hideCaption(page);
  await page.waitForTimeout(400);
}

/** Muestra una imagen (p. ej. una hoja de un PDF descargado) encima de la página. */
export async function showImage(page: Page, dataUrl: string) {
  await page.evaluate((src) => {
    const box = document.createElement("div");
    box.id = "tuto-image";
    box.style.cssText = "position:fixed;inset:0;z-index:2147483646;background:rgba(4,32,31,.55);display:flex;align-items:center;justify-content:center;padding:24px 0 96px";
    const img = document.createElement("img");
    img.src = src;
    img.style.cssText = "max-height:100%;max-width:90%;background:#fff;border-radius:6px;box-shadow:0 24px 60px -20px rgba(0,0,0,.6)";
    box.appendChild(img);
    document.body.appendChild(box);
  }, dataUrl);
}

export async function hideImage(page: Page) {
  await page.evaluate(() => document.getElementById("tuto-image")?.remove());
}

/** Guarda junto al video los audios y en qué momento suenan (los mezcla build-videos.sh). */
export function saveNarration(page: Page, info: TestInfo) {
  const track = narration.get(page);
  if (!track) return;
  mkdirSync(info.outputDir, { recursive: true });
  writeFileSync(path.join(info.outputDir, "narration.json"), JSON.stringify({ trimMs: track.trim, clips: track.clips }, null, 2));
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
  await locator.pressSequentially(text, { delay: 25 });
  await locator.evaluate((el) => el.classList.remove("tuto-focus"));
}
