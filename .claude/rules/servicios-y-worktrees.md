# Servicios de desarrollo (tmux) y worktrees por agente

## Servicios: siempre con `scripts/dev-services.sh`

Cada servicio corre en una ventana de la sesión tmux **de su checkout**. Así se pueden leer
sus logs, reiniciarlos y detenerlos sin procesos sueltos, y varios checkouts corren a la vez.

```bash
./scripts/dev-services.sh start infra|backend|frontend|all
./scripts/dev-services.sh stop backend|frontend|all     # "stop infra" solo desde el repo principal
./scripts/dev-services.sh restart backend
./scripts/dev-services.sh status          # estado, puertos, BD y sesión
./scripts/dev-services.sh logs backend 100
./scripts/dev-services.sh health
./scripts/dev-services.sh kill-zombies    # huérfanos de ESTE checkout en sus puertos
./scripts/dev-services.sh attach          # entrar a la sesión tmux
```

| Sesión tmux | Checkout | Puertos |
|-------------|----------|---------|
| `rupu` | repo principal (`~/Desktop/reserve`) | back 3050, front 3000 |
| `rupu-<nombre>` | worktree `~/Desktop/reserve-wt/<nombre>` | back/front +10, +20… |

Los puertos salen del `.env` de cada checkout: `HTTP_PORT` en `back/central-reserve/.env` y
`PORT` en `front/rupu-central/.env.local`. Logs completos en `/tmp/rupu-logs/<sesión>/<svc>.log`.

### Reglas

- **Nunca** `go run ./cmd/main.go &`, `pnpm dev &`, `nohup` ni procesos sueltos: siempre el
  script (lo bloquea `.claude/hooks/guard-bash.mjs`). Para esperar algo largo, usar la opción
  de segundo plano del harness, no `&`.
- **Iniciar, reiniciar o detener servicios solo con permiso del usuario.** Leer `status`,
  `logs` y `health` no necesita permiso.
- Para verificar que compila no hace falta levantar nada: `make build-centralback`,
  `pnpm typecheck`.
- El script **solo toca procesos de su propio checkout** (los identifica por su carpeta de
  trabajo): nunca mata procesos de otros proyectos de la máquina. Si un puerto lo ocupa otro
  proyecto, avisa y no hace nada: se cambia el puerto en el `.env`.
- La infraestructura Docker (Postgres `rupu_postgres_local`, 127.0.0.1:5435) es **una sola** y
  la comparten el repo principal y todos los worktrees. Se detiene solo desde el repo principal.
- `status` muestra `fuera de tmux` si hay algo escuchando en el puerto que no lanzó el script
  (p. ej. un proceso viejo): pedir permiso y reemplazarlo con `kill-zombies` + `start`.

## Worktrees: un checkout por agente

Un worktree es otro checkout del mismo repo, en otra carpeta y otra rama. Sirve para que dos
agentes (o dos tareas) trabajen a la vez sin pisarse archivos, puertos ni datos.

```bash
./scripts/worktree.sh new <nombre> [rama-base]   # ../reserve-wt/<nombre>, rama wt/<nombre>
./scripts/worktree.sh list
./scripts/worktree.sh remove <nombre>             # detiene sus servicios, borra su BD y el worktree
```

`new`:
- crea la rama `wt/<nombre>` desde `main` (o desde `rama-base`, p. ej. una rama con un PR abierto);
- copia los `.env` ignorados (permisos 600);
- le asigna el primer par de puertos libre (+10, +20…) que no use otro worktree ni otro proceso,
  y apunta el front del worktree al back del worktree;
- crea su **base propia** `rupu_<nombre>` dentro del mismo Postgres local (copia de la base
  principal, con estructura y datos). Si el Postgres local no está arriba, queda apuntando a
  la base principal y lo avisa.

**Preferir `scripts/worktree.sh` a la isolación automática del harness** (`isolation: "worktree"`):
la del harness no copia los `.env`, no asigna puertos ni crea BD propia.

### Reglas

- **Código y datos aislados**: el worktree puede migrar y escribir en su BD sin afectar a los
  demás. Nadie migra la base principal desde un worktree.
- **El agente de un worktree solo escribe en su worktree** (lo bloquea `guard-scope.mjs`).
- `front/rupu-central/node_modules` no se copia: `pnpm install --frozen-lockfile` en el worktree.
- `cam.pem` no se copia a los worktrees.
- Borrar el worktree y su rama cuando esté integrado. No dejar worktrees olvidados
  (`./scripts/worktree.sh list`).

## Trabajo en paralelo con varios agentes

Cuando se pide "lanza N agentes en paralelo", el agente que recibe el pedido es el
**orquestador**: reparte, crea los worktrees, lanza los agentes e integra. Los demás son
**trabajadores**: cada uno trabaja solo en su worktree.

### 1. Repartir sin solaparse (orquestador)

- Dividir por áreas que no compartan archivos: un módulo, una capa o una carpeta por agente.
- Los **archivos compartidos** tienen **un solo dueño** o no los toca ningún trabajador (los
  edita el orquestador al integrar): `cmd/internal/server/init.go`, `services/*/bundle.go`,
  `go.mod`/`go.sum`, `back/dbpostgres/app/infra/models/models.go` y su espejo `back/models`,
  `migration_usecase.go`, `front/rupu-central/package.json` + `pnpm-lock.yaml`, `AGENTS.md`,
  `.claude/plan/*`.
- Cada trabajador migra solo su propia BD.
- Máximo recomendado: **3–4 trabajadores** a la vez (cada uno puede levantar back + front).

### 2. Crear worktrees y lanzar (orquestador)

```bash
./scripts/worktree.sh new <tarea> [rama-base]   # uno por trabajador; anotar los puertos impresos
```

Lanzar cada trabajador con la plantilla de abajo, en segundo plano y en paralelo.

### 3. Integrar en serie (orquestador)

A medida que cada trabajador termina, uno a la vez:

```bash
git -C ../reserve-wt/<tarea> rebase <rama-destino>        # la rama sobre el destino actual
# compilar y correr los tests del área en el worktree (y los de todo lo afectado)
git merge --ff-only wt/<tarea>                             # en el repo principal, en la rama destino
./scripts/worktree.sh remove <tarea> && git branch -D wt/<tarea>
```

- Conflictos: los resuelve el orquestador; si no es obvio, preguntar al usuario.
- Si una rama no compila o rompe tests: **no se integra**; se reporta al usuario con el detalle.
- Después de integrar todo: build y tests completos, y un reporte con qué se integró, qué no
  y por qué. Push / PR solo si el usuario lo autoriza.

### Plantilla del prompt para cada trabajador

```text
Trabajas SOLO en el worktree <RUTA_ABSOLUTA> (rama wt/<TAREA>). No edites nada fuera de esa
carpeta: el repo principal y los otros worktrees son de otros agentes. Usa rutas absolutas y
haz `cd` a tu worktree antes de cada comando.

Lee primero: AGENTS.md, .claude/rules/ (en especial <REGLAS_RELEVANTES>) y <PLAN_O_CONTEXTO>.

Tarea: <DESCRIPCIÓN CONCRETA Y ACOTADA>.
Alcance: solo <ARCHIVOS/CARPETAS>. No toques <ARCHIVOS COMPARTIDOS>: si necesitas un cambio
ahí, descríbelo en tu reporte y lo hace el orquestador.

Servicios: si necesitas levantar algo, solo con <RUTA>/scripts/dev-services.sh de tu worktree
(puertos: back <PUERTO_BACK>, front <PUERTO_FRONT>). Deténlos al terminar.
Tienes BD propia (rupu_<TAREA>): puedes migrarla. No toques la base principal.

Verificación antes de terminar: <COMANDOS: go build, go test, pnpm typecheck/test/build...> en verde.
Commits: en tu rama, en español, terminando con la línea
"Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>". Antes de cada commit,
`git diff --cached --name-only` no debe incluir .env*, .pem ni archivos fuera de tu alcance. Sin push.

Si algo no se puede hacer sin salir del alcance, o un test falla y no es por tu cambio,
detente y repórtalo en vez de improvisar. Prohibido t.Skip / it.skip.

Reporte final (en español): commits (hash y mensaje), qué quedó hecho, verificación con
números, cambios que el orquestador debe hacer en archivos compartidos, y pendientes o riesgos.
```
