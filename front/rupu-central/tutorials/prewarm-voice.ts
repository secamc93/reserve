import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { narrate } from "./voice";

// Genera de una vez (en paralelo) todas las frases que dice la voz en todos los tutoriales (*.tutorial.ts), para que la
// grabación no se quede esperando a Google. Uso: TUTORIAL_VOICE=1 npx tsx tutorials/prewarm-voice.ts
const source = readdirSync(__dirname)
  .filter((f) => f.endsWith(".tutorial.ts"))
  .map((f) => readFileSync(path.join(__dirname, f), "utf8"))
  .join("\n");
const lines = [...new Set([...source.matchAll(/"([^"<]{40,}\.)"/g)].map((m) => m[1]))];

(async () => {
  console.log(`${lines.length} frases`);
  let next = 0;
  const worker = async () => {
    while (next < lines.length) {
      const text = lines[next++];
      const t = Date.now();
      const { ms } = await narrate(text);
      if (Date.now() - t < 500) continue; // ya estaba en caché
      console.log(`${(ms / 1000).toFixed(1)}s  ${text.slice(0, 70)}`);
    }
  };
  await Promise.all(Array.from({ length: 4 }, worker));
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
