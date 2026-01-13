# 🚀 Próximos Pasos - Despliegue

## ✅ Ya Completado

1. ✅ Terraform aplicado - Repositorios ECR creados
2. ✅ IAM Role asociado a EC2 (`ec2-ecr-pull-role`)
3. ✅ Secrets de GitHub configurados

## 📋 Pasos Restantes

### 1. Configurar EC2 (Instalar Podman)

Conectarse al EC2:

```bash
ssh ec2-user@TU_EC2_HOST
```

Instalar Podman:

```bash
# Para Amazon Linux
sudo yum install -y podman podman-compose

# Para Ubuntu
sudo apt-get update
sudo apt-get install -y podman podman-compose

# Verificar instalación
podman --version
podman-compose --version
```

### 2. Subir Archivos al EC2

Desde tu máquina local:

```bash
# Crear directorio en EC2 si no existe
ssh ec2-user@TU_EC2_HOST "mkdir -p ~/reserve/infra/compose-prod"

# Subir podman-compose.yaml
scp infra/compose-prod/podman-compose.yaml \
  ec2-user@TU_EC2_HOST:~/reserve/infra/compose-prod/

# Subir archivo .env (si existe)
scp infra/compose-prod/.env \
  ec2-user@TU_EC2_HOST:~/reserve/infra/compose-prod/ 2>/dev/null || echo "Archivo .env no encontrado - créalo en el EC2"
```

### 3. Verificar Volumen de PostgreSQL

En el EC2, verificar dónde están los datos actuales:

```bash
# Ver volúmenes Podman existentes
podman volume ls

# O si usas bind mount
ls -la /opt/postgresql/data  # Ajusta según tu configuración
```

Si los datos están en un bind mount, editar `podman-compose.yaml` línea 112-114.

### 4. Probar el Despliegue

#### Opción A: Probar Manualmente en EC2

```bash
# En el EC2
cd ~/reserve/infra/compose-prod

# Login a ECR (el IAM Role ya tiene permisos)
aws ecr get-login-password --region us-east-1 | \
  podman login --username AWS --password-stdin 334689162817.dkr.ecr.us-east-1.amazonaws.com

# Pull y levantar servicios
podman-compose -f podman-compose.yaml pull
podman-compose -f podman-compose.yaml up -d

# Ver estado
podman-compose -f podman-compose.yaml ps

# Ver logs
podman-compose -f podman-compose.yaml logs -f
```

#### Opción B: Probar con GitHub Actions

1. Hacer un push a `main` o `develop` con cambios en:
   - `front/rupu-central/**`
   - `back/central-reserve/**`
   - `infra/nginx/**`

2. O ejecutar manualmente desde GitHub:
   - Actions > Deploy Services (Frontend, Backend, Nginx) > Run workflow

## 🔍 Verificación Final

Después del despliegue, verificar:

```bash
# En el EC2
podman ps  # Ver contenedores corriendo

# Verificar servicios
curl http://localhost:3050/health  # Backend
curl http://localhost:8080/        # Frontend
curl http://localhost:80/          # Nginx
```

## 📊 URLs de los Repositorios ECR

- Frontend: `334689162817.dkr.ecr.us-east-1.amazonaws.com/rupu-frontend:latest`
- Backend: `334689162817.dkr.ecr.us-east-1.amazonaws.com/rupu-backend:latest`
- Nginx: `334689162817.dkr.ecr.us-east-1.amazonaws.com/rupu-nginx:latest`

## 🐛 Troubleshooting

### Error: "repository not found"
- Los repositorios ya están creados ✅
- Verifica que el Account ID sea correcto: `334689162817`

### Error: "Permission denied" al hacer pull de ECR
- El IAM Role ya está asociado ✅
- Espera unos minutos para que los permisos se propaguen

### Error: "podman-compose: command not found"
- Instala podman-compose en el EC2

### Error: "Cannot connect to Podman socket"
- Verifica permisos: `sudo usermod -aG podman $USER`
- Reinicia sesión SSH
