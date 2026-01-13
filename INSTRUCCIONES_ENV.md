# 📝 Instrucciones para Archivo .env

## ✅ Solución Automática

El workflow ahora **crea automáticamente** el archivo `.env` en el EC2 si no existe.

## ⚠️ IMPORTANTE: Completar Valores

Después de que el workflow cree el `.env`, **debes editarlo** con tus valores reales:

```bash
# Conectarse al EC2
ssh -i /home/cam/Desktop/cam.pem ubuntu@ec2-3-220-183-29.compute-1.amazonaws.com

# Editar el archivo .env
nano ~/reserve/infra/compose-prod/.env
```

## 📋 Variables que Debes Completar

### Base de Datos (CRÍTICO)
```bash
DB_NAME=reserve_db                    # Nombre de tu base de datos
DB_USER=postgres                      # Usuario de PostgreSQL
DB_PASSWORD=TU_PASSWORD_SEGURO        # ⚠️ Cambia esto
DB_LOG_LEVEL=info
DB_SSLMODE=disable
```

### Aplicación (CRÍTICO)
```bash
JWT_SECRET=GENERA_UN_SECRET_SEGURO    # ⚠️ Genera uno seguro (openssl rand -hex 32)
APP_ENV=production
LOG_LEVEL=info
```

### SMTP (Opcional pero recomendado)
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-password-app
FROM_EMAIL=noreply@tu-dominio.com
```

### S3 (Si usas almacenamiento)
```bash
S3_BUCKET=tu-bucket-s3
S3_REGION=us-east-1
S3_KEY=TU_AWS_ACCESS_KEY
S3_SECRET=TU_AWS_SECRET_KEY
```

### Nginx (Si usas SSL)
```bash
DOMAIN=tu-dominio.com
SSL_CERT_PATH=/etc/letsencrypt/live/tu-dominio.com/fullchain.pem
SSL_KEY_PATH=/etc/letsencrypt/live/tu-dominio.com/privkey.pem
```

## 🔐 Generar JWT_SECRET Seguro

```bash
# En tu máquina local o en el EC2
openssl rand -hex 32
```

## 📍 Ubicación del Archivo

El archivo `.env` debe estar en:
```
~/reserve/infra/compose-prod/.env
```

## 🚨 Nota de Seguridad

**NUNCA** subas el archivo `.env` al repositorio Git. Está en `.gitignore` por seguridad.

## ✅ Verificar que Funciona

Después de editar el `.env`, ejecuta:

```bash
# En el EC2
cd ~/reserve/infra/compose-prod
podman-compose -f podman-compose.yaml config
```

Si no hay errores, el archivo está correcto.
