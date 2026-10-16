# Plan — Rediseño del módulo de votaciones

**Estado:** implementado en la rama `feat/voting-redesign` (commit `6138d814`), **sin revisar en
navegador ni mergear**. Base: `chore/remove-sport-training` (PR #69).

Diseño: Claude Design, proyecto "Votaciones - Rediseño" (opciones 1a–1j). Elegidas: **1a** panel
en vivo (barra apilada + fichas por torre), **1e** resultados (dona), **1f/1g** voto móvil,
**1h** progreso público, **1j/1i** QR (modal y proyección). Descartadas: 1b, 1c, 1d.

Código: `front/rupu-central/src/services/modules/horizontal-properties/voting/ui/` (+ `ui/design/`
con tokens, fuentes Public Sans / JetBrains Mono solo en el módulo, barra apilada, cálculos).

## Decisiones

- 2026-10-14 (usuario): el shell (menú lateral y barra superior) **conserva los colores de cada
  propiedad**; el diseño neutro de Claude Design ("Flujo completo") se aplica solo al contenido del
  módulo de votaciones, aunque el diseño muestre el shell en negro/gris.

## Pendientes

- [ ] Revisión visual en local con datos (propiedad con unidades por torre y una votación con
      votos): `.claude/testing/votaciones/front/CU-02` y `CU-03`.
- [x] 2026-10-15: `usePublicVotingSSE` no cerraba el stream al desmontar → resuelto con `useEventStream` (cierra al desmontar, reintento con backoff).
- [ ] 1h muestra una sola votación (la API pública solo da la del token); para una barra por
      votación del grupo hace falta un endpoint público de resultados por grupo.
- [ ] Contador "01 / 04": el panel no conoce el total de votaciones del grupo.
- [ ] Torre inferida del prefijo del número de unidad (`T2-804`); formatos tipo `101-A` agrupan mal.
- [ ] E2E del panel en vivo del admin (CU-02 front): se escribe sobre el rediseño 1a (los
      selectores del panel actual cambian con él). La ronda de API ya cubre registrar/anular/masiva.
- [ ] Usar `percentage_by_coefficient` del back (nuevo, `b0da089e`) en vez de recalcular en el front.
- [ ] PR a `main` después del PR #69.
- [ ] El cierre de un punto no llega por el SSE (el back no emite `voting_closed`); R4 lo revisa cada 8 s. Emitirlo en el back al desactivar la votación (el front ya lo escucha).
- [ ] La vista 1h (detalle por unidad con token individual) quedó sin detalle: el SSE público ya no expone votos individuales (a propósito, por privacidad).
