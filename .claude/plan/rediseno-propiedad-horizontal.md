# Plan — Rediseño de propiedad horizontal (Claude Design "PH - Mapa del producto")

**Estado (2026-10-15):** integrado en la rama `feat/rediseno-ph`, sin push ni PR. Probado en local
(pruebas, build y revisión en navegador de cada módulo con los datos reales de Tayazal).

Proyecto de diseño: `0e9c2e45-aeb2-4ea7-b84c-122f39db63ec` (archivos `PH - *.dc.html`). Solo se
puede leer desde la sesión principal (DesignSync): a los subagentes hay que pasarles el diseño.

## Hecho
- Sistema compartido `front/rupu-central/src/shared/ui/ds` (tokens, fuentes, diálogo 560, cabecera
  secundaria, chips, tabla densa, panel lateral, tabla agrupada, filtros en la URL…).
- Barra superior con miga de pan. Resumen "Hoy" + Ficha (S1/S2).
- Parqueaderos K1–K4 · Unidades U1–U3 · Residentes R1–R4 · Visitas V1–V4 · Paquetería P1–P4 ·
  Zonas comunes Z1–Z5.
- Migrador: catálogos de parqueadero, visitas y zonas comunes; columnas `time`; índices parciales.

## Decisiones
- 2026-10-14 (usuario): la barra lateral conserva el color de cada propiedad (el diseño la pinta en
  tinta fija): no se cambió.

## Pendientes
- [ ] Desplegar: PR a `main` + correr el migrador en producción (convierte columnas y siembra catálogos).
- [ ] Zonas comunes: campo `max_hours` (no existe en el modelo) y guardar el mensaje al aprobar.
- [ ] Paquetería: columnas `delivered_to_name/doc` y `photo_url` (hoy quien recibe va en las notas).
- [ ] Unificar en `shared/ui/ds` el panel lateral y la tabla de visitas/paquetería/zonas
      (`visits/ui/side-panel.tsx`, `packages/ui/side-panel.tsx`, `visits/ui/dense-table.tsx`).
- [ ] Votaciones: pasar su cabecera a `DsSectionHeader`.
- [ ] `e2e/movil-pantallas.spec.ts` roto desde antes (paso "resumen").
