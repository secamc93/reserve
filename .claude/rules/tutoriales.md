# Tutoriales en video

Los videos de ayuda viven en **Tutoriales** de cada módulo (`/properties/:id/<módulo>/tutorials`,
acceso en el riel izquierdo) y se graban con Playwright desde `front/rupu-central/tutorials/`.
Proceso completo e historia: `.claude/bitacora/2026-10-23-tutoriales-en-video-y-voz.md`.

## La voz (no cambiarla sin pedírselo al usuario)

| Dato | Valor |
|------|-------|
| Servicio | Google Cloud Text-to-Speech, proyecto GCP `rupu-votaciones` (sesión de `gcloud`) |
| Voz | Gemini **`Algieba`**, modelo `gemini-2.5-pro-tts`, `speakingRate 1.3` |
| Estilo | "Habla como una persona colombiana real, cálida y cercana, explicándole algo a un amigo. Tono conversacional y relajado pero a ritmo ágil, como alguien que habla rápido y claro, sin pausas largas; nada de voz de locutor ni de robot." |

Está fijada en `tutorials/voice.ts` (variables `TUTORIAL_VOICE_*` para pruebas).

## Reglas

- Datos **ficticios** en propiedades de demostración (nunca Tayazal ni datos reales). `studio.ts`
  oculta el correo del usuario, herramientas de super admin y otros conjuntos.
- El subtítulo es corto; la **voz explica más** (no lee el subtítulo) y habla durante las acciones.
- Cada video se enfoca en una sola tarea y no repite lo de otro.
- Antes de grabar: `npx tsx tutorials/prewarm-voice.ts`; grabar con `--workers=1` y la máquina
  sin carga; después `tutorials/build-videos.sh` y revisar cuadros y pausas.
- Un módulo nuevo con tutoriales: página con `TutorialsPage` (`shared/ui/tutorials-page.tsx`), su
  `page.tsx` en `<módulo>/tutorials` y agregarlo a `MODULES_WITH_TUTORIALS`
  (`shared/utils/navigation.ts`).
