# Testing

## Definición de "hecho"

Una funcionalidad está hecha cuando existe una prueba automatizada que ejercita su criterio
de aceptación y está en verde (local y CI). Código que "se ve correcto" no está hecho. Un bug
corregido lleva una prueba que falla sin el arreglo.

## Dónde corre cada tipo (decisión del usuario, 2026-10-14)

| Tipo | Local | CI / deploy |
|------|-------|-------------|
| Unitarias (Go y Vitest) | sí | **sí**: job `unit-tests` en `backend-ci-cd.yml` y `frontend-ci-cd.yml`; si fallan, no se construye la imagen ni se despliega |
| Integración (Go, tag `integration`) | sí, antes de pedir merge | **no** |
| E2E (Playwright) | sí, antes de pedir merge | **no** |
| Casos manuales (`.claude/testing/`) | sí | no |

Por eso las de integración llevan siempre `//go:build integration` (así `go test ./...` del CI
no las compila) y las e2e viven en `e2e/`, que Vitest excluye. Que no corran en CI no las hace
opcionales: quien toca el área las corre en local y deja el resultado en el PR.

## Tipos de prueba

| Tipo | Dónde | Cómo se corre |
|------|-------|---------------|
| Unitaria back (Go) | `services/<modulo>/.../internal/app/test/<caso>_test.go`, paquete externo `package <x>_test` | `make test-centralback` o `cd back/central-reserve && go test ./...` |
| Integración back | `<caso>_integration_test.go` con `//go:build integration` en la primera línea, contra la BD local del checkout (la del worktree, `rupu_<nombre>`, o la principal) | `make test-integration` (solo local) |
| Unitaria front (Vitest) | junto al archivo: `<archivo>.test.ts(x)` | `cd front/rupu-central && pnpm test` |
| E2E front (Playwright) | `front/rupu-central/e2e/<area>-<flujo>.spec.ts` | `pnpm test:e2e` (variables abajo) |
| Caso de uso manual | `.claude/testing/<modulo>/{back,front}/CU-NN-*.md` | un agente lo ejecuta contra local y anota `RESULTS.md` |

### Back (Go)

- Mocks: structs con campos `Func` por cada método del puerto; si el `Func` es nil devuelven
  valores cero. Logger: `MockLogger` con `zerolog.Nop()`. Al agregar un método a un puerto,
  **actualizar su mock en el mismo cambio** (si no, los tests del módulo dejan de compilar).
- Se prueba el caso de uso por su `New()` público, no los internos.
- Todo endpoint con alcance de negocio necesita una prueba de aislamiento: un usuario normal no
  puede leer ni modificar datos de otro `business_id`.

### Front (Vitest)

- Lógica pura (mappers, cálculos, configuración, use cases) y componentes cliente con
  `@testing-library/react` + `user-event`. Nada de red: los repositorios se prueban con `fetch`
  simulado o no se prueban aquí.
- Las pruebas de componentes buscan por rol/label/texto visible, como un usuario.

### E2E (Playwright)

- Corren contra un front y un back **levantados con `dev-services.sh`** (los del repo principal
  o los de un worktree). Credenciales solo por variables de entorno, nunca en el código:

```bash
cd front/rupu-central
E2E_EMAIL=... E2E_PASSWORD=... \
E2E_API_URL=http://localhost:3050/api/v1 PLAYWRIGHT_BASE_URL=http://localhost:3000 \
  pnpm test:e2e
```

- Selectores accesibles (`getByRole`, `getByLabel`, `getByText`). Si la UI no tiene un rol o
  label estable, se mejora la UI en vez de depender de clases CSS.
- Los datos que crea una corrida llevan un sufijo propio (timestamp) para no chocar con otras
  corridas ni otros worktrees.
- Contra producción: **nunca** sin autorización explícita del usuario.

### Casos de uso manuales (`.claude/testing/`)

"Prueba", "testea", "lanza prueba back/front de X", "corre el CU-NN de Y" = ejecutar los casos
de `.claude/testing/<modulo>/`. Ver `.claude/testing/README.md`.

- **Back**: crear/modificar solo vía API, en el orden del caso, encadenando salidas. Verificar
  status, `success` y forma del payload. Leer la BD solo con SELECT para confirmar efectos.
- **Front**: navegar con Playwright (MCP del navegador o un spec); validar texto visible, la
  petición esperada y la consola sin errores.
- Registrar en `RESULTS.md`: fecha, caso, OK/FAIL/PARCIAL, evidencia, bug y commit del arreglo.
- Prohibido editar el caso para que coincida con un bug.

## Reglas

- Prueba primero cuando se corrige un bug: debe fallar antes del arreglo.
- La prueba ejercita la regla real, no aserciones sobre mocks que pasarían sin la regla.
- Prohibido `t.Skip`, `it.skip`, `test.skip`, `describe.skip` para que pase el build (lo
  bloquea `guard-bash.mjs`). Si una prueba está rota y no es por tu cambio: alerta en
  `.claude/alerts/` y reportarlo, no silenciarla.
- Antes de pedir un merge que toque el front: `pnpm typecheck && pnpm test && pnpm build` en
  verde. Si toca el back: `go build ./... && go vet ./... && go test ./...` del área.
