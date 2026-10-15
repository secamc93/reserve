# Login 404 en producción: API_BASE_URL sin /api/v1

## Síntoma

En producción el login mostraba "Error en login: 404".

## Causa

El Server Action de login arma `${API_BASE_URL}/auth/login`. `API_BASE_URL` y
`NEXT_PUBLIC_API_BASE_URL` estaban sin el sufijo `/api/v1`, así que pegaba a
`https://xn--rup-joa.com/auth/login` (no existe).

## Hipótesis descartadas

- Usuario inexistente en la BD: el super admin existía y ya había hecho login.
- El build-arg del workflow del front ya traía `/api/v1`: el `.env` de runtime del servidor lo
  sobrescribía. La fuente de verdad en runtime es el `.env` (generado desde Parameter Store).

## Arreglo

2026-07-06: se editó el `.env` del servidor. 2026-10-14: corregido en la fuente,
`/rupu/API_BASE_URL` y `/rupu/NEXT_PUBLIC_API_BASE_URL` en Parameter Store terminan en `/api/v1`.

## Verificación

`curl -s -o /dev/null -w '%{http_code}' -X POST https://xn--rup-joa.com/api/v1/auth/login -d '{}'`
→ 400/401 (no 404).
