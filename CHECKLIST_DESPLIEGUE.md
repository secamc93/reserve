# ✅ Checklist de Despliegue

## Estado Actual

### ✅ Completado
- [x] Secrets de GitHub Actions configurados:
  - AWS_ACCESS_KEY_ID
  - AWS_SECRET_ACCESS_KEY
  - EC2_SSH_KEY
  - EC2_HOST
  - EC2_USER
- [x] Account ID actualizado en `podman-compose.yaml`: `334689162817`
- [x] Terraform aplicado - Repositorios ECR creados:
  - `rupu-frontend` ✅
  - `rupu-backend` ✅
  - `rupu-nginx` ✅
- [x] IAM Role asociado a EC2: `ec2-ecr-pull-role` ✅

### ⚠️ Pendiente

#### 1. ~~Aplicar Terraform (Crear Repositorios ECR)~~ ✅ COMPLETADO

```bash
cd infra/terraform

# Inicializar Terraform
terraform init

# Ver qué se creará
terraform plan

# Aplicar (crea los 3 repositorios ECR)
terraform apply
```

Esto creará:
- `rupu-frontend` en ECR
- `rupu-backend` en ECR
- `rupu-nginx` en ECR

#### 2. ~~Asociar IAM Role a la EC2~~ ✅ COMPLETADO

#### 3. Configurar EC2 (Instalar Podman)

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

# Verificar
podman --version
podman-compose --version
```

#### 4. Subir Archivos al EC2

Desde tu máquina local:

```bash
# Crear directorio en EC2 si no existe
ssh ec2-user@TU_EC2_HOST "mkdir -p ~/reserve/infra/compose-prod"

# Subir podman-compose.yaml
scp infra/compose-prod/podman-compose.yaml \
  ec2-user@TU_EC2_HOST:~/reserve/infra/compose-prod/

# Subir archivo .env (si existe)
scp infra/compose-prod/.env \
  ec2-user@TU_EC2_HOST:~/reserve/infra/compose-prod/ 2>/dev/null || echo "Archivo .env no encontrado"
```

#### 5. Verificar Volumen de PostgreSQL

En el EC2, verificar dónde están los datos actuales:

```bash
# Ver volúmenes Podman existentes
podman volume ls

# O si usas bind mount
ls -la /opt/postgresql/data  # Ajusta según tu configuración
```

Si los datos están en un bind mount, editar `podman-compose.yaml` línea 112-114.

## 🚀 Probar el Despliegue

### Opción 1: Probar Manualmente en EC2

```bash
# En el EC2
cd ~/reserve/infra/compose-prod

# Login a ECR
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

### Opción 2: Probar con GitHub Actions

1. Hacer un push a `main` o `develop` con cambios en:
   - `front/rupu-central/**`
   - `back/central-reserve/**`
   - `infra/nginx/**`

2. O ejecutar manualmente desde GitHub:
   - Actions > Deploy Services > Run workflow

## 📋 Verificación Final

Después del despliegue, verificar:

```bash
# En el EC2
podman ps  # Ver contenedores corriendo

# Verificar servicios
curl http://localhost:3050/health  # Backend
curl http://localhost:8080/        # Frontend
curl http://localhost:80/          # Nginx
```

## 🐛 Troubleshooting

### Error: "repository not found"
- Asegúrate de haber aplicado `terraform apply`

### Error: "Permission denied" al hacer pull de ECR
- Verifica que el IAM Role esté asociado a la EC2

### Error: "podman-compose: command not found"
- Instala podman-compose en el EC2

### Error: "Cannot connect to Podman socket"
- Verifica permisos: `sudo usermod -aG podman $USER`
