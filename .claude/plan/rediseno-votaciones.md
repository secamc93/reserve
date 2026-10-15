# Plan — Rediseño del módulo de votaciones

**Estado:** implementado en la rama `feat/voting-redesign` (commit `6138d814`), **sin revisar en
navegador ni mergear**. Base: `chore/remove-sport-training` (PR #69).

Diseño: Claude Design, proyecto "Votaciones - Rediseño" (opciones 1a–1j). Elegidas: **1a** panel
en vivo (barra apilada + fichas por torre), **1e** resultados (dona), **1f/1g** voto móvil,
**1h** progreso público, **1j/1i** QR (modal y proyección). Descartadas: 1b, 1c, 1d.

Código: `front/rupu-central/src/services/modules/horizontal-properties/voting/ui/` (+ `ui/design/`
con tokens, fuentes Public Sans / JetBrains Mono solo en el módulo, barra apilada, cálculos).

## Pendientes

- [ ] Revisión visual en local con datos (propiedad con unidades por torre y una votación con
      votos): `.claude/testing/votaciones/front/CU-02` y `CU-03`.
- [ ] Bug previo: `usePublicVotingSSE` no cierra el stream al desmontar (con 1g → progreso
      quedan dos conexiones abiertas).
- [ ] 1h muestra una sola votación (la API pública solo da la del token); para una barra por
      votación del grupo hace falta un endpoint público de resultados por grupo.
- [ ] Contador "01 / 04": el panel no conoce el total de votaciones del grupo.
- [ ] Torre inferida del prefijo del número de unidad (`T2-804`); formatos tipo `101-A` agrupan mal.
- [ ] PR a `main` después del PR #69.
