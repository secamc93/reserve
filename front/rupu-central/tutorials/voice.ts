import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

// Narración de los tutoriales con Google Cloud Text-to-Speech. Se activa con TUTORIAL_VOICE=1 y
// usa la sesión de gcloud (gcloud auth print-access-token) sobre el proyecto GCP_PROJECT.
// Los audios quedan en caché por texto en tutorials/.output/voice.

const PROJECT = process.env.GCP_PROJECT ?? "rupu-votaciones";
const VOICE = process.env.TUTORIAL_VOICE_NAME ?? "es-US-Chirp3-HD-Kore";
const RATE = Number(process.env.TUTORIAL_VOICE_RATE ?? 1.15);
const CACHE = path.join(__dirname, ".output", "voice");

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
export async function narrate(text: string): Promise<{ file: string; ms: number }> {
  mkdirSync(CACHE, { recursive: true });
  const key = createHash("sha1").update(`${VOICE}|${RATE}|${text}`).digest("hex").slice(0, 16);
  const file = path.join(CACHE, `${key}.mp3`);
  if (!existsSync(file)) {
    const res = await fetch("https://texttospeech.googleapis.com/v1/text:synthesize", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken()}`, "x-goog-user-project": PROJECT, "Content-Type": "application/json" },
      body: JSON.stringify({
        input: { text },
        voice: { languageCode: VOICE.slice(0, 5), name: VOICE },
        audioConfig: { audioEncoding: "MP3", speakingRate: RATE, sampleRateHertz: 24000 },
      }),
    });
    if (!res.ok) throw new Error(`Text-to-Speech ${res.status}: ${await res.text()}`);
    const { audioContent } = (await res.json()) as { audioContent: string };
    writeFileSync(file, Buffer.from(audioContent, "base64"));
  }
  return { file, ms: durationMs(file) };
}
