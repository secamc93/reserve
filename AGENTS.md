# AGENTS.md — Rupü (Reserve)

Punto de entrada para cualquier agente de IA que trabaje en este repositorio
(Claude Code, Codex, Cursor, Copilot u otro). `CLAUDE.md` solo importa este archivo:
**una sola fuente de verdad**. Todo el contexto para agentes vive en `.claude/`.

## Antes de empezar

1. Leer este archivo completo.
2. Revisar `.claude/alerts/`: pendientes urgentes. Si hay una alerta del módulo que vas a
   tocar, leerla completa y mencionarla al usuario.
3. Revisar `.claude/plan/`: si el trabajo pertenece a un plan en curso, seguirlo.
4. Buscar en `.claude/bitacora/` si el problema se parece a algo ya investigado.
5. Leer las reglas de `.claude/rules/` que apliquen a lo que vas a tocar.

## El proyecto

**Rupü** es una plataforma PropTech para la administración de **propiedad horizontal**
(conjuntos residenciales): unidades, residentes, parqueaderos, paquetería, visitas, zonas
comunes, asistencia y **votaciones de asamblea** (por coeficiente, con QR y resultados en vivo).

Desde 2026-10-14 el producto es **exclusivamente propiedad horizontal**: los módulos de
restaurantes y sport training se eliminaron (código y base de datos). No reintroducirlos.

Producción: `https://rupü.com` (`xn--rup-joa.com`), EC2 temporal con auto-apagado. Ver
`.claude/rules/aws-infrastructure.md`.

## Estructura

| Ruta | Qué hay |
|------|---------|
| `back/central-reserve` | API Go (Gin + GORM), puerto 3050. Módulos en `services/{auth,horizontalproperty}` |
| `back/dbpostgres` | Migrador (AutoMigrate GORM) y modelos: **única fuente de cambios de esquema** |
| `back/models` | Copia espejo de los modelos (mantener igual a `back/dbpostgres/app/infra/models`) |
| `front/rupu-central` | Dashboard Next.js 16 + React 19 (puerto 3000) |
| `front/website` | Landing Astro (puerto 4321) |
| `mobile/rupu` | App Flutter |
| `infra/compose-prod` | Compose de producción + `deploy.sh` (lo corre CI por SSM) |
| `infra/compose-local` | Postgres local compartido (`rupu_postgres_local`, 127.0.0.1:5435) |
| `infra/scripts` | `rupu-up.sh` (encender EC2 + DNS + deploy), user-data de la EC2 |
| `scripts/` | `dev-services.sh` (servicios en tmux), `worktree.sh` (worktree por agente) |
| `.github/workflows` | CI/CD en runners ARM64 gratuitos (OIDC + SSM, sin secrets) |
| `.claude/` | Contexto, reglas, testing, bitácora, alertas, hooks y agentes |

## Reglas duras

- **Llaves y secretos nunca se commitean**: `cam.pem`, `.env*` (salvo `.example`),
  `.claude/settings.local.json`, `.claude/mcp.json`. Jamás `git add -f`. Lo bloquea
  `.claude/hooks/guard-bash.mjs`.
- **Servicios solo con `scripts/dev-services.sh` (tmux)**, nunca con `&` ni `nohup`. Iniciar,
  reiniciar o detener servicios **solo con permiso del usuario**; leer `status` y `logs` no lo
  necesita. Ver `.claude/rules/servicios-y-worktrees.md`.
- **Trabajo en paralelo = un worktree por agente** con `scripts/worktree.sh` (puertos y BD
  propios). Un agente en un worktree no escribe fuera de él (lo bloquea `guard-scope.mjs`).
- **Ramas y PR**: nunca push directo a `main`; `main` despliega a producción. Push y PR solo
  con autorización. GitHub siempre con `gh` como `secamc93`. Ver `.claude/rules/github-workflow.md`.
- **Arquitectura hexagonal** en back y front. Ver `.claude/rules/architecture.md` y
  `.claude/rules/repository-isolation.md`.
- **Multi-tenant**: el `business_id` de un usuario normal sale SIEMPRE del token. El super
  admin tiene `business_id = 0` y debe enviar `?business_id=` (o en el body).
- **Builds siempre ARM64** (Graviton): no quitar `--platform=linux/arm64` de los Dockerfiles.
- **Nunca desactivar un test** (`t.Skip`, `it.skip`) para que pase el build, ni escribir un
  test que pase sin ejercitar la regla. Ver `.claude/rules/testing.md`.
- **No salirse del alcance** del trabajo pedido: nada de refactors oportunistas.
- **Probar en local primero**; producción solo lectura salvo autorización. Ver
  `.claude/rules/entorno-local.md` y `.claude/rules/test-credentials.md`.

## Comandos

```bash
./scripts/dev-services.sh start infra|backend|frontend|all   # tmux (pedir permiso)
./scripts/dev-services.sh status | logs backend 100 | health
./scripts/worktree.sh new <nombre> [rama-base] | list | remove <nombre>

make build-centralback          # compilar el back sin levantar nada
make test-centralback           # tests Go
make run-migrations             # migrar la BD del checkout (back/dbpostgres)
cd front/rupu-central && pnpm typecheck && pnpm test && pnpm build
cd front/rupu-central && pnpm test:e2e                       # Playwright (ver testing.md)
```

| Servicio | Puerto (repo principal) |
|----------|-------------------------|
| Backend API | 3050 (`/health`, Swagger en `/docs`) |
| Frontend | 3000 |
| Postgres local | 127.0.0.1:5435 (`rupu_postgres_local`) |
| Website | 4321 |

Worktrees: puertos desplazados +10, +20… (los imprime `worktree.sh new`).

## Mapa de `.claude/`

| Ruta | Qué hay | Cuándo se lee |
|------|---------|---------------|
| `rules/` | Reglas del proyecto | Antes de tocar el área |
| `plan/` | Planes de trabajo en curso | Antes de trabajar en algo planificado |
| `alerts/` | Pendientes urgentes; se borran al resolverse | Siempre, al iniciar sesión |
| `bitacora/` | Histórico de soportes y diagnósticos, un archivo por caso | Cuando el problema se parece |
| `testing/` | Casos de uso E2E manuales por módulo (`CU-NN`) y sus resultados | Al probar un módulo |
| `agents/` | Subagentes (`hexagonal-architecture-assistant`, `test-generator`) | Automático / por nombre |
| `hooks/` | Guardas que ejecuta el harness (`settings.json`) | Automático |

| Regla | Tema |
|-------|------|
| `rules/architecture.md` | Arquitectura hexagonal back (Go) y front (Next.js), paginación |
| `rules/repository-isolation.md` | Módulos no comparten repositorios |
| `rules/testing.md` | Unitarias, integración, e2e Playwright, casos manuales, definición de "hecho" |
| `rules/test-credentials.md` | Dónde están las credenciales de prueba y cómo autenticarse |
| `rules/entorno-local.md` | BD local, `.env`, migraciones, datos semilla |
| `rules/servicios-y-worktrees.md` | tmux por checkout, worktree por agente, orquestar agentes en paralelo |
| `rules/github-workflow.md` | Ramas, PR, `gh` con la cuenta correcta |
| `rules/aws-infrastructure.md` | EC2, ECR, SSM, DNS, CI/CD |
| `rules/alerts.md` | Cómo usar y crear alertas |
| `rules/bitacora.md` | Cómo usar y escribir la bitácora |

## Al terminar un trabajo relevante

- Si queda trabajo crítico inconcluso: crear alerta en `.claude/alerts/`.
- Si se investigó un problema o se descubrió un comportamiento no documentado: crear entrada
  en `.claude/bitacora/`.
- Si el trabajo avanza un plan: actualizar su estado en `.claude/plan/`.
- Si se probó un módulo: registrar el resultado en `.claude/testing/<modulo>/*/RESULTS.md`.
