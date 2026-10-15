# Exportar asistencia a Excel no funciona entrando por la red local

**Fecha:** 2026-10-15 · **Prioridad:** deseable

## Contexto

`front/rupu-central/src/services/modules/horizontal-properties/attendance/ui/attendance-list-modal.tsx`
exporta a Excel llamando al back desde el navegador con `envPublic.API_BASE_URL`
(`NEXT_PUBLIC_API_BASE_URL`, en local `http://localhost:3050`). Entrando por la IP del WiFi
(`http://192.168.3.11:3000`) el navegador del otro equipo apunta a su propio localhost. En producción
funciona (el dominio es público). Mismo patrón que se corrigió para el SSE (route handler en el front).

## Ítems

- [ ] Pasar la exportación por una Server Action o un route handler del front.
- [ ] Revisar otros usos de `NEXT_PUBLIC_API_BASE_URL` desde el navegador (`grep -rn envPublic src`).

## Cierre

Exportar funciona entrando por la IP de la red local.
