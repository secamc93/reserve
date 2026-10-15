# Relanzamiento temporal de producción (2026-10-14)

## Contexto

La infra se había dado de baja el 2026-07-23 (EC2 terminada, EBS con la BD borrado sin backup,
Elastic IP `3.220.183.29` liberada). Se necesitaba la app ~1 día: EC2 nueva sin Elastic IP y con
auto-apagado.

## Hallazgos

- **DNS colgando**: rupü.com y www seguían apuntando a `3.220.183.29` (IP ya no nuestra): riesgo
  de que otra cuenta reciba el tráfico. Corregido apuntando a la IP nueva; `rupu-up.sh` lo
  actualiza en cada encendido (TTL 60).
- **Workflows sin mergear**: el CI/CD sin secrets (OIDC + SSM) vivía en una rama sin PR y con el
  `INSTANCE_ID` de la instancia terminada. Ahora la instancia se busca por tag `Name=rupu-prod`.
- **Imagen del front vieja**: `rupu-frontend:latest` en ECR era de febrero (sin el front de sport
  training de marzo). Se construyó en la propia EC2 (ARM nativo).
- **Parameter Store sin `/api/v1`** en las URLs del front (ver `2026-07-06-login-404-api-base-url.md`).
- **BD nueva sin semilla de auth**: las migraciones no crean scopes/roles/usuarios ni el tipo de
  negocio `horizontal_property` (500 al listar propiedades). Ver `.claude/rules/entorno-local.md`.
- El instance role no tiene permiso de Route53: el DNS se actualiza desde la máquina local.

## Hipótesis descartadas

- t4g.small alcanza: no, el build de Next.js necesita más de 2 GB (se usó t4g.medium + swap).

## Estado

EC2 `rupu-prod` con auto-apagado 23:59 Bogotá. Pendientes en
`.claude/alerts/produccion-temporal-pendientes.md`.
