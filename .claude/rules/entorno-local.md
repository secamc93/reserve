# Entorno local

Todo cambio se prueba primero en local. La base local es desechable: se puede romper, resetear
y volver a migrar sin afectar a nadie.

## Qué hay

| Servicio | Cómo corre | Puerto | Credenciales |
|----------|-----------|--------|--------------|
| PostgreSQL 15 | contenedor `rupu_postgres_local` (`infra/compose-local/docker-compose.yml`, volumen `rupu_pg_local`) | `127.0.0.1:5435` | `postgres` / `rupu_local`, BD `postgres` |
| Backend Go | tmux, `scripts/dev-services.sh start backend` | 3050 | `back/central-reserve/.env` |
| Frontend Next.js | tmux, `scripts/dev-services.sh start frontend` | 3000 | `front/rupu-central/.env.local` |

Es un Postgres **propio del proyecto**: no se usan los de otros proyectos de la máquina
(`postgres_local` :5434, `terrablock_*`, `yo_postgres`…). Cada worktree tiene su base
`rupu_<nombre>` dentro de este mismo contenedor.

## Archivos `.env` (ignorados por git)

| Archivo | Plantilla | Uso |
|---------|-----------|-----|
| `back/central-reserve/.env` | `back/central-reserve/.env.example` | API local (`DB_HOST=localhost`, `DB_PORT=5435`) |
| `back/dbpostgres/.env` | — | Migrador local (mismas variables de BD) |
| `front/rupu-central/.env.local` | `front/rupu-central/.env.example` | `API_BASE_URL` y `NEXT_PUBLIC_API_BASE_URL` (deben terminar en `/api/v1`), `PORT` |
| `.env.test` (raíz) | `.env.test.example` | Usuario de pruebas (ver `test-credentials.md`) |

Los `.env` locales apuntan a local. **Nunca** a la IP vieja de producción `3.220.183.29` (fue
liberada y puede ser de otra persona).

## Flujo

```bash
./scripts/dev-services.sh start infra      # Postgres local
make run-migrations                         # AutoMigrate (back/dbpostgres) sobre la BD del checkout
./scripts/dev-services.sh start backend     # API en tmux
./scripts/dev-services.sh start frontend    # front en tmux
./scripts/dev-services.sh status
```

## Datos semilla

Las migraciones crean el esquema y catálogos (p. ej. estados de paquetes), pero **no** crean
usuarios, scopes, roles ni tipos de negocio. En una BD nueva hay que sembrar:

1. Scopes `platform` y `business`, rol `Super Admin` (scope `platform`), el usuario de pruebas
   (clave con bcrypt: `crypt('<clave>', gen_salt('bf',10))` con la extensión `pgcrypto`) y su
   `business_staff` (sin `business_id`).
2. El tipo de negocio `horizontal_property` (por la API `POST /business-types` como super admin).
   Sin él, el módulo responde 500 "tipo de negocio horizontal_property no encontrado".

Los ids cambian entre bases: **nunca fijar ids en código** (ver
`.claude/bitacora/2026-10-14-selector-de-negocio-vacio-id-fijo.md`).

Empezar de cero (solo local): borrar la base del checkout, crearla vacía, `make run-migrations`
y repetir la semilla.
