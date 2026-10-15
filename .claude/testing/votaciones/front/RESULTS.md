# Resultados — votaciones (front)

| Fecha | Entorno | Caso | Resultado | Evidencia | Bug / commit |
|-------|---------|------|-----------|-----------|--------------|
| 2026-10-14 | local | CU-01 Entrar al módulo | FAIL → OK | Selector de negocio vacío con super admin; corregido | `5403d7b0` (PR #69) |
| 2026-10-14 | worktree `ronda-votaciones` (front :3010) | Playwright: login (2), CU-01 entrar al módulo, CU-03 voto móvil por QR (2) | OK | `pnpm test:e2e` **5/5** en 3 corridas seguidas | — |

