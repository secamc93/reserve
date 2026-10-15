# Datos de prueba — votaciones

- Propiedad: **Tayazal de Suba** (code `tayazal-de-suba`). Su id cambia entre bases: buscarlo con
  `GET /horizontal-properties?page=1` (super admin) y usarlo como `BID`.
- Usuario: super admin de `.env.test` (`E2E_EMAIL` / `E2E_PASSWORD`).
- Unidades: si la propiedad no tiene, crear al menos 6 con prefijo de torre (`T1-101`, `T1-102`,
  `T1-201`, `T2-101`, `T2-102`, `T2-201`) y coeficientes que sumen 100, para ver el panel por torres.
- Nombres de grupo/votación de una corrida: sufijo con la fecha-hora (`Asamblea QA 20261014-2130`)
  para no chocar con otras corridas ni worktrees.
- Opciones estándar: `Sí`, `No`, `Abstención` (el front las colorea por texto).

Variables de shell usadas en los casos:

```bash
set -a && . ./.env.test && set +a
API=http://localhost:3050/api/v1     # o el puerto del back de tu worktree
# MAIN y BT como en .claude/rules/test-credentials.md
BID=<id de Tayazal de Suba>
```
