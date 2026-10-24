# Tutoriales en video con voz, guía, recorrido guiado y navegación (2026-10-23)

Trabajo de un día para que un administrador nuevo entienda Rupü sin ayuda. Todo en producción
(PRs #92–#105). Este archivo deja el **proceso** y la **voz** para repetirlo igual.

## Qué quedó en el panel

| Pieza | Dónde | PR |
|-------|-------|----|
| Guía de 5 pasos de la asamblea (se marca sola con los datos) | Votaciones, arriba | #92 |
| Recorrido guiado (product tour) la primera vez que se entra a Votaciones; se repite con "Recorrido guiado" | Votaciones | #92 |
| Tutoriales por módulo, en `…/<módulo>/tutorials`, acceso fijo en el riel izquierdo y en el menú del teléfono | Votaciones (6), Unidades (2), Residentes (2) | #92, #98, #102 |
| Ruta "dónde estoy" dentro del menú principal (propiedad › módulo › … › pestaña) | Barra superior | #97, #98, #101 |
| Tarjetas de conjuntos con dirección, unidades, residentes, coeficiente y qué falta | `/properties` | #101 |
| "+ Nueva propiedad" (super admin) y "Cambiar propiedad" siempre visible para el super admin | `/properties` | #95, #96 |
| Dar/quitar super admin desde IAM → Usuarios | IAM | #94 |
| Excel de ejemplo descargable en Importar Excel | Unidades y Residentes | #105 |
| Web pública: botón "Iniciar sesión" visible | rupü.com | #93 |

Decisiones del usuario: los videos solo viven en Tutoriales (no dentro de Votaciones); los
tutoriales son por módulo (la ruta dice *Votaciones › Tutoriales*); el menú y la ruta van en la
misma isla; video 3 = asistencia y voto manual (administrador), video 4 = votar con QR (propietarios).

## La voz de Rupü

**Google Cloud Text-to-Speech, voz Gemini `Algieba`** (masculina, suave), modelo
`gemini-2.5-pro-tts`, `speakingRate 1.3`, con esta instrucción de estilo:

> Habla como una persona colombiana real, cálida y cercana, explicándole algo a un amigo. Tono
> conversacional y relajado pero a ritmo ágil, como alguien que habla rápido y claro, sin pausas
> largas; nada de voz de locutor ni de robot.

- Proyecto GCP **`rupu-votaciones`** (con facturación activa), APIs `texttospeech.googleapis.com`
  y `aiplatform.googleapis.com` (las voces Gemini la necesitan). Autenticación: sesión de `gcloud`
  del dueño del proyecto.
- Se eligió entre 8 muestras; las Chirp 3 HD (p. ej. Kore) sonaron poco humanas. Con 1.0 la voz era
  lenta; 1.3 + "ritmo ágil" quedó bien.
- La voz **no lee los subtítulos**: el subtítulo es corto y la voz explica más (`caption(…, speech)`
  y `say()`), y habla mientras ocurren las acciones.
- Configuración en `front/rupu-central/tutorials/voice.ts` (variables `TUTORIAL_VOICE_*` para
  cambiarla). Regla para videos nuevos: `.claude/rules/tutoriales.md`.

## Cómo se graban

`front/rupu-central/tutorials/`: Playwright graba el panel local sobre propiedades **de
demostración** (datos ficticios), `studio.ts` pone subtítulos, resalta cada clic y oculta lo que
no debe salir (correo del usuario, herramientas de super admin, otros conjuntos).

```bash
cd front/rupu-central && set -a && . ../../.env.test && set +a
export TUTORIAL_VOICE=1 E2E_API_URL=http://localhost:3060/api/v1 PLAYWRIGHT_BASE_URL=http://localhost:3005
npx tsx tutorials/prewarm-voice.ts            # genera todas las frases en paralelo (caché)
pnpm tutorials -g votaciones --workers=1      # o -g modulos (Unidades y Residentes)
tutorials/build-videos.sh                     # mp4 + portada en public/tutoriales
```

## Problemas que costaron tiempo (hipótesis descartadas incluidas)

- **Pausas largas en los videos.** No era la voz: Playwright borra `tutorials/.output` al empezar y
  ahí estaba la caché de audios, así que cada grabación pedía todas las frases a Google y la
  pantalla quedaba quieta esperando. Arreglo: caché en `tutorials/.voice-cache` + `prewarm-voice.ts`.
- **"No escucho la voz".** El archivo sí tenía audio (picos ~0 dB); la voz empezaba en el segundo
  13 (carga de la página) y el navegador mostraba la versión vieja en caché. Arreglo: recorte de la
  carga inicial (`markReady` + `trimMs`) y recargar con Cmd+Shift+R.
- **Escenas que se colgaban** al abrir Asistencia: el clic a veces se perdía y el enmascarado
  (MutationObserver que recorría todo el DOM en cada cambio) saturaba el navegador. Arreglo:
  `openAttendance()` con reintento y enmascarado una vez por cuadro (`requestAnimationFrame`).
- **Carga alta de la máquina** (load > 20, Mac de 8 GB con swap lleno, Chrome del usuario) hacía
  fallar logins de e2e y grabaciones: grabar con `--workers=1` y la carga baja.
- **Build de CI que falla bajando fuentes de Google** (`next/font/google`, "Can't resolve
  …/font/google/font"): es de red, intermitente; se reintenta el job. Si se repite mucho, guardar
  las fuentes en el repo.

## Errores reales encontrados en el camino (cada uno con su entrada)

- [Crear unidad como super admin](2026-10-23-crear-unidad-super-admin.md)
- [Importar residentes que ya están en otro conjunto](2026-10-23-importar-residentes-correo-duplicado.md)
- [No se podía recrear un conjunto borrado](2026-10-23-dominio-de-conjuntos-borrados.md)
- Pruebas e2e desactualizadas: alerta `.claude/alerts/e2e-desactualizadas.md`.
