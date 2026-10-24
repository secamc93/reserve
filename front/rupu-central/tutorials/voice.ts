import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

// Narración de los tutoriales con Google Cloud Text-to-Speech. Se activa con TUTORIAL_VOICE=1 y
// usa la sesión de gcloud (gcloud auth print-access-token) sobre el proyecto GCP_PROJECT.
// Por defecto usa una voz Gemini (acepta instrucciones de estilo: suena más humana); con
// TUTORIAL_VOICE_MODEL="" usa una voz clásica (p. ej. es-US-Chirp3-HD-Kore).
// Los audios quedan en caché por texto en tutorials/.voice-cache.

const PROJECT = process.env.GCP_PROJECT ?? "rupu-votaciones";
const MODEL = process.env.TUTORIAL_VOICE_MODEL ?? "gemini-2.5-pro-tts";
const VOICE = process.env.TUTORIAL_VOICE_NAME ?? (MODEL ? "Algieba" : "es-US-Chirp3-HD-Kore");
const RATE = Number(process.env.TUTORIAL_VOICE_RATE ?? (MODEL ? 1.3 : 1.15));
const STYLE =
  process.env.TUTORIAL_VOICE_STYLE ??
  "Habla como una persona colombiana real, cálida y cercana, explicándole algo a un amigo. Tono conversacional y relajado pero a ritmo ágil, como alguien que habla rápido y claro, sin pausas largas; nada de voz de locutor ni de robot.";
// Fuera de .output: Playwright borra esa carpeta al empezar cada grabación.
const CACHE = path.join(__dirname, ".voice-cache");

export const voiceEnabled = process.env.TUTORIAL_VOICE === "1";

let token: string | null = null;
function accessToken() {
  token ??= execFileSync("gcloud", ["auth", "print-access-token"], { encoding: "utf8" }).trim();
  return token;
}

/** Texto del subtítulo listo para leer en voz alta: sin HTML, símbolos ni montos ambiguos. */
export function speakable(html: string) {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/[✓✔]/g, "")
    .replace(/\$\s?([\d.]+)/g, "$1 pesos")
    .replace(/\bQR\b/g, "cu erre")
    .replace(/\s+/g, " ")
    .trim();
}

function durationMs(file: string) {
  const out = execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file], { encoding: "utf8" });
  return Math.round(Number(out.trim()) * 1000);
}

/** Sintetiza (o toma de la caché) la narración de un texto. */
export async function narrate(text: string, attempt = 0): Promise<{ file: string; ms: number }> {
  mkdirSync(CACHE, { recursive: true });
  const key = createHash("sha1").update(`${MODEL}|${VOICE}|${RATE}|${MODEL ? STYLE : ""}|${text}`).digest("hex").slice(0, 16);
  const file = path.join(CACHE, `${key}.mp3`);
  if (!existsSync(file)) {
    const res = await fetch("https://texttospeech.googleapis.com/v1/text:synthesize", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken()}`, "x-goog-user-project": PROJECT, "Content-Type": "application/json" },
      signal: AbortSignal.timeout(60_000),
      body: JSON.stringify({
        input: MODEL ? { prompt: STYLE, text } : { text },
        voice: MODEL ? { languageCode: "es-US", name: VOICE, modelName: MODEL } : { languageCode: VOICE.slice(0, 5), name: VOICE },
        audioConfig: { audioEncoding: "MP3", speakingRate: RATE, sampleRateHertz: 24000 },
      }),
    });
    if ((res.status === 429 || res.status >= 500) && attempt < 4) {
      // Límite de peticiones o fallo temporal: reintenta con espera creciente.
      await new Promise((r) => setTimeout(r, 5000 * (attempt + 1)));
      return narrate(text, attempt + 1);
    }
    if (!res.ok) throw new Error(`Text-to-Speech ${res.status}: ${await res.text()}`);
    const { audioContent } = (await res.json()) as { audioContent: string };
    writeFileSync(file, Buffer.from(audioContent, "base64"));
  }
  return { file, ms: durationMs(file) };
}
