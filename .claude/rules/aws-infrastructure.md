# AWS Infrastructure - Proyecto Reserve (Rupü)

## Cuenta AWS

**SIEMPRE usar el perfil `default` de AWS CLI.** NO usar el perfil `probability`.

| Perfil | Cuenta | Uso |
|--------|--------|-----|
| `default` | `334689162817` (cam personal) | **ESTE PROYECTO** - Reserve/Rupü |
| `probability` | otra cuenta | NO USAR - proyecto diferente |

## EC2 - Servidor de Producción (temporal, desde 2026-10-14)

| Dato | Valor |
|------|-------|
| Nombre (tag) | `rupu-prod` — CI y scripts la ubican por este tag, no por ID |
| Instance ID | `i-07652126135349dd5` (puede cambiar si se recrea) |
| Tipo / AMI | `t4g.medium` (ARM64, 4 GB) · Ubuntu 24.04 ARM64 |
| IP | **dinámica, sin Elastic IP**: cambia en cada encendido |
| Auto-apagado | cron en la instancia, 23:59 hora Bogotá (`/etc/cron.d/rupu-autostop`) |
| Perfil IAM | `rupu-ec2-profile` (ECR pull, Parameter Store `/rupu/*`, SSM) |
| Key pair | `cam` (`cam.pem` en la raíz del repo, ignorado; SSH como `ubuntu`) |
| Stack | `~/reserve/infra/compose-prod/`: `postgres_prod`, `central_reserve_prod`, `frontend_prod`, `nginx_prod` |
| SSL | Let's Encrypt (certbot standalone) para `xn--rup-joa.com` y `www` |
| Bootstrap | `infra/scripts/rupu-ec2-userdata.sh` |

**Encender (y después de cada auto-apagado):**

```bash
infra/scripts/rupu-up.sh   # enciende, apunta rupü.com/www a la IP nueva (TTL 60) y despliega lo último por SSM
```

Desde 2026-10-16 la EC2 también se arregla sola al encender: `rupu-boot.service` (systemd, corre
`/usr/local/bin/rupu-boot.sh`, versionado en `infra/scripts/rupu-boot.sh`) apunta rupü.com/www a la IP
nueva y corre `deploy.sh all`. Para eso el instance role tiene la política inline `rupu-ec2-dns`
(solo registros A de `xn--rup-joa.com` y `www`). Log: `journalctl -u rupu-boot.service`.

**Encendido programado (sin la máquina local):** EventBridge Scheduler con el rol
`rupu-scheduler-start` (solo `ec2:StartInstances` sobre `rupu-prod`). Ejemplo, una sola vez:

```bash
aws scheduler create-schedule --name rupu-encender-AAAAMMDD \
  --schedule-expression "at(AAAA-MM-DDTHH:MM:00)" --schedule-expression-timezone America/Bogota \
  --flexible-time-window Mode=OFF --action-after-completion DELETE \
  --target '{"Arn":"arn:aws:scheduler:::aws-sdk:ec2:startInstances","RoleArn":"arn:aws:iam::334689162817:role/rupu-scheduler-start","Input":"{\"InstanceIds\":[\"<instance-id>\"]}"}'
```

> **Historial:** la instancia anterior `i-08c946b3dd12fc8c9` y su Elastic IP `3.220.183.29` se
> dieron de baja el 2026-07-23 (BD perdida, sin backup). Esa IP **ya no es nuestra**: nada
> (DNS, `.env`, MCP) debe apuntar a ella. Detalle en
> `.claude/bitacora/2026-10-14-relanzamiento-temporal-produccion.md`.

## CI/CD (GitHub Actions, sin secrets)

- Runners **ARM64 gratuitos** de GitHub (`ubuntu-24.04-arm`; el repo es público).
- Autenticación por **OIDC**: rol `arn:aws:iam::334689162817:role/github-actions-rupu` (ECR push + SSM).
- **PR**: solo build (validación). **Push a `main` / manual**: build ARM64 → push a ECR privado
  (`334689162817.dkr.ecr.us-east-1.amazonaws.com/rupu-{backend,frontend,nginx}`) → deploy por
  `.github/scripts/ssm-deploy.sh <servicio>` (send-command por tag `Name=rupu-prod`), que corre
  `infra/compose-prod/deploy.sh` en la instancia.
- Si la instancia está apagada, el deploy avisa sin fallar; `rupu-up.sh` trae lo último al encenderla.
- Config de la app: **Parameter Store `/rupu/*`** (secretos como SecureString). `deploy.sh`
  regenera el `.env` del servidor desde ahí. `API_BASE_URL` y `NEXT_PUBLIC_API_BASE_URL` deben
  terminar en `/api/v1`.
- Los Dockerfiles fijan `linux/arm64`: en x86 sin qemu el build falla a propósito.

## Security Group - Puertos Abiertos

| Puerto | Protocolo | Acceso | Servicio |
|--------|-----------|--------|----------|
| 22 | TCP | 0.0.0.0/0 | SSH |
| 80 | TCP | 0.0.0.0/0 | HTTP (Nginx) |
| 443 | TCP | 0.0.0.0/0 | HTTPS (Nginx) |
| 3050 | TCP | 0.0.0.0/0 | Backend API |
| 5433 | TCP | IP del dev (restringido) | PostgreSQL |
| 8080 | TCP | 0.0.0.0/0 | Frontend Next.js |
| 8081 | TCP | 0.0.0.0/0 | Otros servicios |

## Problema Frecuente: DB no conecta desde local

**Causa**: El puerto 5433 está restringido por IP. Si el ISP cambia la IP del desarrollador, hay que actualizarla.

**Solución**:
```bash
# 1. Obtener IP actual
curl -s ifconfig.me

# 2. Agregar al security group
aws ec2 authorize-security-group-ingress \
  --group-id sg-0511c666dfe873353 \
  --protocol tcp --port 5433 \
  --cidr <TU_IP>/32

# 3. (Opcional) Remover IP vieja
aws ec2 revoke-security-group-ingress \
  --group-id sg-0511c666dfe873353 \
  --protocol tcp --port 5433 \
  --cidr <IP_VIEJA>/32
```

## Contenedores en Producción (Docker)

| Contenedor | Puerto | Imagen |
|------------|--------|--------|
| `nginx_prod` | 80, 443 | Nginx reverse proxy |
| `frontend_prod` | 8080→3000 | Next.js |
| `central_reserve_prod` | 3050 | Go API |
| `postgres_prod` | 5433→5432 | PostgreSQL |

## ECR (Container Registry)

- **Privado (el que se usa)**: `334689162817.dkr.ecr.us-east-1.amazonaws.com/rupu-{backend,frontend,nginx}:latest`
- Público (legado, sin uso): `public.ecr.aws/d3a6d4r1/cam/reserve`

## S3 - Buckets y Logging

Buckets en la cuenta (`us-east-1`): `images-cam93` (assets/imágenes de productos),
`rupuu` (avatars/logos/assets de la app, vía CloudFront `d358lf4dgcrm2m.cloudfront.net`),
`lube-parts` (web estática Astro, vía CloudFront `dzl18koqqq5ir.cloudfront.net`),
`secamc-web` (web estática), `latoria-la-bella` (web estática, CloudFront inactivo),
`terraform-state-bucket-rupu` (⚠️ estado de Terraform — NUNCA borrar).

**Access logging (configurado 2026-07-23):** habilitado en `images-cam93`, `secamc-web`
y `latoria-la-bella` — cada bucket se loguea a sí mismo bajo el prefijo `logs/`. Los dos
públicos (`images-cam93`, `secamc-web`) llevan un `Deny` en su bucket policy para que
`logs/*` NO sea legible públicamente. Regla de lifecycle `expire-access-logs-90d` borra
los logs con más de 90 días. `rupuu` y `lube-parts` no tienen logging S3 porque su tráfico
real se mide vía métricas de CloudFront en CloudWatch (namespace `AWS/CloudFront`).

---

**Última actualización:** 2026-10-14
