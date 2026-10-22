# Serie de videos cortos de Rupü: votaciones de asamblea

**Fecha:** 2026-10-19 · **Área:** marketing / videos (fuera del repo)

No es un soporte: se registra para poder retomar la serie de videos sin volver a investigar
el pipeline, las voces, los colores y los precios de la competencia.

## Contexto

- El usuario pidió una serie de videos verticales (9:16) en animación 2D *flat* con stickmans
  sobre lo aburridas que son las votaciones de asamblea (casa por casa con Excel, controles caros,
  mano alzada) y cómo se resuelven con Rupü.
- **Rupü solo trata de votaciones de asamblea** (corrección del usuario): no hacer videos de
  portería, parqueaderos ni zonas comunes.
- Ese mismo día también se trajeron los cambios de producción: `git pull --ff-only origin main`
  (985881d7 → f0751f55, PR #73–#85). Queda pendiente `pnpm install` en `front/rupu-central`,
  `make run-migrations` y reiniciar servicios (solo con permiso).

## Videos (todo en `~/Movies/shorts/`, fuera del repo)

| Video | Archivo vigente | Duración |
|-------|-----------------|----------|
| #1 La asamblea eterna (Excel casa por casa, a Eva le "explota" la cabeza) | `rupu-asamblea/rupu-asamblea-9x16-v4.mp4` | 36 s |
| #2 ¿Hay quórum? | `rupu-quorum/rupu-quorum-9x16-v2.mp4` | 38,5 s |
| #3 ¡Yo voté sí! (mano alzada, acelerado) | `rupu-manoalzada/rupu-manoalzada-9x16-v3.mp4` | 32,6 s |
| Final feliz: "La misma asamblea… con Rupü" | `rupu-final/rupu-final-9x16-v2.mp4` | 37 s |
| ¿Cuánto cuesta votar? (precios) | `rupu-precios/rupu-precios-9x16-v2.mp4` | 43 s |
| Así funciona Rupü en 5 pasos | `rupu-pasos/rupu-pasos-9x16-v1.mp4` | 45 s |
| Antes vs. Con Rupü (pantalla dividida, casi sin voz) | `rupu-vs/rupu-vs-9x16-v1.mp4` | 22,5 s |

**Descartar** (salieron sin subtítulos, ver abajo): quorum v1, manoalzada v1/v2, final v1,
precios v1. asamblea v1–v3 son iteraciones viejas.

## Identidad visual

- Colores del logo (`front/rupu-central/public/images/logo_rupu.png`, no estaban documentados):
  degradado `#2CD8CC` → `#25C5C0` → `#18A0AE` (también `#1CAEBA`, `#14A0A7`).
- El terracota `#c8603f` es del sistema de diseño del dashboard; en los videos se usa solo para
  lo "malo" (Excel, alquiler de controles, ¡PUM!).
- En pantalla se escribe **Rupü**; al TTS se le pasa "Rupú" para que lo pronuncie bien, y los
  subtítulos lo reemplazan por "Rupü".
- Marco de celular: `assets/iphone_frame.png` (recortado de una imagen que traía el cuadriculado
  pegado; pantalla 458×995 en offset 27,22 dentro de 511×1039).
- Casas del conjunto redibujadas en 2D flat a partir de una foto de referencia (la foto no se usa
  por estilo y derechos).

## Personajes y voces

Google Cloud TTS, Chirp 3 HD `es-US`, con la cuenta de Google de Probability (proyecto
`probabilityia`, header `x-goog-user-project`). El token se obtiene dentro de `tts.py` y nunca se
imprime.

| Personaje | Rasgo | Voz |
|-----------|-------|-----|
| Narrador | — | Charon |
| Administrador | bigote, corbata roja | Orus |
| Ana | moño rosa | Leda |
| Beto | gorra naranja | Fenrir |
| Caro | bufanda teal | Kore |
| Fer | gafas | — |
| Dani | gorro verde, "casa 12" | Puck |
| Eva | moño morado; chiste recurrente: le "explota" la cabeza (¡PUM!) | Aoede |

El usuario va a grabar él mismo las reacciones para reemplazar el TTS (archivos `build/audio/lN.wav`
de cada proyecto; p. ej. #1 l2, l3, l4, l8; #2 l3, l5, l7; #3 l3, l4, l5).

## Pipeline

Cada proyecto tiene `build/` con:

1. `scripts.json` (líneas y voces) → `tts.py` genera `audio/lN.wav`.
2. `timeline.py`: recorta silencios, saca tiempos por palabra con Whisper (venv
   `~/Movies/shorts/rupu-asamblea/.venv`, enlazado) y arma la línea de tiempo.
3. `lib.js` (stickman, poses, salón, subtítulos) + `<video>.js` + `style.css` + `short.html`.
4. `node render.js frame t1,t2` (cuadros sueltos) o `node render.js video` → `silent.mp4`
   (Playwright de `probabilityIA/front/central` + Chrome, cuadro a cuadro). `sheet.sh` arma hojas
   de contacto para revisar.
5. `audio.py`: efectos sintetizados + música → `bed.wav`.
6. Mezcla:
   `ffmpeg -i silent.mp4 -i voice.wav -i bed.wav -filter_complex "[1][2]amix=inputs=2:normalize=0,volume=2dB,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=44100[a]" ...`

Para retomar tras grabar voces: reemplazar `lN.wav` → `timeline.py` → `render.js video` →
`audio.py` → ffmpeg.

## Bug: videos sin subtítulos

- **Síntoma:** #2, #3, el final y el de precios salieron sin subtítulos.
- **Causa:** `lib.js` leía `CAP_LINES` al cargarse, antes de que cada video lo definiera.
- **Arreglo:** leer `window.CAP_LINES` al momento de dibujar (y reemplazar "Rupú"→"Rupü").
  Se re-renderizaron y se verificó que ya tienen subtítulos.
- **Descartado:** no era problema de fuentes ni de la sincronía de Whisper.

## Precios usados en el video de precios (investigación 2026-10-19)

Fuentes públicas de proveedores de Bogotá. **No nombrar proveedores en los videos.**

- Controles de votación: desde $8.000 por unidad, asista o no (120 unidades = $960.000), cubre
  5 horas; hora extra $300.000 + IVA; control perdido $380.000 + IVA (tabla publicada, actualizada
  27-sep-2026).
- Logística completa: desde $900.000 (≤99 unidades), $1.850.000 (100–199), $2.600.000,
  $3.350.000, $4.500.000.
- Otro proveedor, por evento: desde $800.000 / $2.000.000 / $3.500.000.
- Votación manual: "5–6 horas de asamblea"; "una votación que a mano tomaba 20 minutos".
- **Rupü: $50.000 el día de votación** (dato del usuario) → "al menos 19 veces menos"
  (960.000 / 50.000 = 19,2).
- Fuentes: asambleas.click (`/precios/`, `/controles-de-votacion/`,
  `/blog/cuanto-cuesta-votacion-electronica-asamblea-bogota.html`), votaph.co,
  capitalcolombia.com/articulo/software_control_votacion. Conviene guardar capturas: los precios
  pueden cambiar.

## Funciones de Rupü mostradas (verificadas en el código)

Importación de unidades desde Excel con coeficiente; credenciales PDF por unidad (QR, unidad,
propietario, contraseña); asistencia con apoderados y "Asistencia en tiempo real" (% presente por
coeficiente vs. quórum, "Quórum alcanzado"); votación pública con QR; resultados por coeficiente
(dona "SÍ · MAYORÍA", participación); informe PDF.

## Pendientes

- Confirmar con el usuario que los $50.000 son fijos por día sin importar el número de unidades.
- "Casi 4 horas… o 20 minutos" (video VS) es ilustrativo; cambiar a "horas… o minutos" si se
  quiere algo más conservador.
- Reemplazar el TTS de las reacciones por las grabaciones del usuario.
- Versiones horizontales 16:9.
- Volumen final queda ~-16 LUFS (objetivo -14): ajuste menor.
- Ideas opcionales: apoderados, acta/informe, "el administrador también sufre", teasers de 6–8 s,
  recopilación.
