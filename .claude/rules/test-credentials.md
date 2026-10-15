# Credenciales de pruebas y entornos

## Dónde están

Las credenciales **nunca** se escriben en archivos versionados (reglas, casos de prueba,
specs, commits, PRs, logs). Viven en archivos ignorados por git:

| Archivo (ignorado) | Qué tiene |
|--------------------|-----------|
| `back/central-reserve/.env` | Config del back local (BD, JWT, S3, SMTP) |
| `back/dbpostgres/.env` | Config del migrador local |
| `front/rupu-central/.env.local` | URL del back y puerto del front |
| `.env.test` (raíz) | Usuario de pruebas: `E2E_EMAIL`, `E2E_PASSWORD` (crearlo desde `.env.test.example`) |

Producción: la configuración vive en **AWS SSM Parameter Store** bajo `/rupu/*` (perfil
`default`); `deploy.sh` regenera el `.env` del servidor desde ahí.

**Antes de probar la API o el front, cargar las variables** y no pedirle al usuario lo que ya
esté ahí:

```bash
set -a && . ./.env.test && set +a
```

## Usuario de pruebas

Super admin (scope `platform`, `business_id = 0` en el token). El mismo usuario existe en local
y en producción; su clave está en `.env.test`. Si no existe el archivo, pedirla al usuario.

## Login en la API

```bash
API=http://localhost:3050/api/v1
MAIN=$(curl -s -X POST "$API/auth/login" -H 'Content-Type: application/json' \
  -d "{\"email\":\"$E2E_EMAIL\",\"password\":\"$E2E_PASSWORD\"}" | jq -r .data.token)
# El MAIN token solo sirve para /auth/business-token y /auth/verify:
BT=$(curl -s -X POST "$API/auth/business-token" -H "Authorization: Bearer $MAIN" \
  -H 'Content-Type: application/json' -d '{"business_id":0}' | jq -r .data.token)
curl -s "$API/horizontal-properties?page=1" -H "Authorization: Bearer $BT"
```

- Super admin: el business token sigue con `business_id = 0`; en cada petición de un módulo de
  negocio se envía `?business_id=<id>` (o `business_id` en el body).
- No imprimir tokens completos en la salida; usarlos desde variables.

## Entornos

| Entorno | Front | API | Datos |
|---------|-------|-----|-------|
| Local (repo principal) | `http://localhost:3000` | `http://localhost:3050/api/v1` | BD `postgres` en 127.0.0.1:5435 |
| Local (worktree) | puerto del worktree | puerto del worktree | BD `rupu_<nombre>` |
| Producción | `https://rupü.com` | `https://xn--rup-joa.com/api/v1` | EC2 (puede estar apagada) |

Producción: **solo lecturas** salvo autorización explícita del usuario. Crear, modificar o
borrar datos desde las pruebas escribe en producción.
