# Resultados — votaciones (front)

| Fecha | Entorno | Caso | Resultado | Evidencia | Bug / commit |
|-------|---------|------|-----------|-----------|--------------|
| 2026-10-14 | local | CU-01 Entrar al módulo | FAIL → OK | Selector de negocio vacío con super admin; corregido | `5403d7b0` (PR #69) |
| 2026-10-14 | worktree `ronda-votaciones` (front :3010) | Playwright: login (2), CU-01 entrar al módulo, CU-03 voto móvil por QR (2) | OK | `pnpm test:e2e` **5/5** en 3 corridas seguidas | — |

| 2026-10-15 | worktree `votopub-front` (front :3020 por `http://192.168.3.11:3020`, back :3070 con `wt/votopub-back` + `wt/votos-aislamiento`) | Enlace del QR por IP, copiar sin HTTPS, SSE same-origin (A6/R4), grupo sin documento | FAIL → OK | Enlace salía `https://192.168.3.11:…` (reproducido en `votaciones-publica-lan.spec.ts`); "Copiar enlace" sin `navigator.clipboard`; SSE contra `localhost:3070` desde el navegador. `pnpm test:e2e --workers=2` **21/21** | rama `wt/votopub-front` |
