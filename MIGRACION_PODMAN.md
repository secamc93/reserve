# Migración de Docker a Podman

Este documento describe los cambios realizados para migrar de Docker a Podman en el proyecto.

## 📋 Cambios Realizados

### 1. Archivos Renombrados/Actualizados

- ✅ `infra/compose-prod/docker-compose.yaml` → `infra/compose-prod/podman-compose.yaml`
  - Actualizado socket de Docker (`/var/run/docker.sock`) a Podman (`/run/podman/podman.sock`)
  - Actualizado comentarios para reflejar uso de Podman

### 2. Backend (central-reserve)

- ✅ `Makefile`: Todos los comandos `docker-*` cambiados a `podman-*`
- ✅ `scripts/build-docker.sh` → `scripts/build-podman.sh` (nuevo script)
- ✅ `scripts/deploy.sh` → `scripts/deploy-podman.sh` (nuevo script)
- ✅ `docker/Dockerfile`: Eliminada instalación de `docker-cli` (no se necesita Podman en el contenedor)
- ✅ `services/auth/logs/internal/infra/secondary/repository/logs_repository.go`: 
  - Cambiado `docker` por `podman` en todas las llamadas
  - Actualizado `streamFromDocker` → `streamFromPodman`
- ✅ `README.md`: Actualizada toda la documentación para usar Podman

### 3. Frontend (rupu-central)

- ✅ `script/deploy.sh` → `script/deploy-podman.sh` (nuevo script)
- ✅ Actualizado comentarios en `docker/Dockerfile` y `next.config.ts`

### 4. GitHub Actions

- ✅ `.github/workflows/backend-ci-cd.yml`: Workflow para build y deploy del backend
- ✅ `.github/workflows/frontend-ci-cd.yml`: Workflow para build y deploy del frontend
- ✅ `.github/workflows/deploy-all.yml`: Workflow para desplegar todos los servicios

## 🔧 Configuración Requerida

### Secrets de GitHub Actions

Configura los siguientes secrets en GitHub (Settings > Secrets and variables > Actions):

| Secret Name | Descripción | Ejemplo |
|------------|-------------|---------|
| `AWS_ACCESS_KEY_ID` | Clave de acceso de AWS IAM | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | Clave secreta de AWS IAM | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `EC2_SSH_KEY` | Contenido completo del archivo `.pem` para SSH | `-----BEGIN RSA PRIVATE KEY-----...` |
| `EC2_HOST` | IP pública o hostname del servidor | `ec2-xx-xx-xx-xx.compute-1.amazonaws.com` |
| `EC2_USER` | Usuario SSH del servidor | `ec2-user` o `ubuntu` |
| `NEXT_PUBLIC_API_BASE_URL` | (Opcional) URL pública del API para el frontend | `https://xn--rup-joa.com/api/v1` |
| `API_BASE_URL` | (Opcional) URL interna del API para server actions | `http://central_reserve:3050/api/v1` |

### Configuración en el Servidor

1. **Instalar Podman y Podman Compose**:
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y podman podman-compose

# O desde source
pip3 install podman-compose
```

2. **Configurar socket de Podman**:
```bash
# Para rootless Podman (recomendado)
# El socket estará en: /run/user/$UID/podman/podman.sock

# Para Podman con root
# El socket estará en: /run/podman/podman.sock
```

3. **Configurar grupo para acceso al socket**:
```bash
# Verificar GID del grupo podman
getent group podman

# Si no existe, crear grupo
sudo groupadd -g 988 podman
sudo usermod -aG podman $USER
```

4. **Actualizar ruta en podman-compose.yaml**:
   - Ajustar la ruta del socket según tu configuración (rootless vs root)
   - Ajustar el `group_add` con el GID correcto del grupo podman

## 🚀 Uso

### Desarrollo Local

```bash
# Backend
cd back/central-reserve
make podman-dev

# Frontend
cd front/rupu-central
podman build -f docker/Dockerfile -t rupu-central .
```

### Producción

```bash
# En el servidor
cd infra/compose-prod
podman-compose -f podman-compose.yaml up -d
```

### Despliegue Manual

```bash
# Backend
cd back/central-reserve
./scripts/deploy-podman.sh

# Frontend
cd front/rupu-central
./script/deploy-podman.sh
```

## 🔄 CI/CD Automático

Los workflows de GitHub Actions se ejecutan automáticamente cuando:

- **Backend**: Se hace push a `main` o `develop` con cambios en `back/central-reserve/**`
- **Frontend**: Se hace push a `main` o `develop` con cambios en `front/rupu-central/**`
- **Deploy All**: Se puede ejecutar manualmente o cuando hay cambios en `infra/compose-prod/**`

### Flujo de CI/CD

1. **Build**: Construye la imagen con Podman
2. **Push**: Sube la imagen a ECR público
3. **Deploy**: Se conecta al servidor vía SSH y actualiza los servicios usando `podman-compose`

## 📝 Notas Importantes

1. **Socket de Podman**: El socket puede estar en diferentes ubicaciones según la configuración:
   - Rootless: `/run/user/$UID/podman/podman.sock`
   - Root: `/run/podman/podman.sock`
   - Ajustar en `podman-compose.yaml` según tu configuración

2. **Red Interna**: Podman Compose crea una red interna similar a Docker, los servicios se comunican por nombre de contenedor.

3. **Compatibilidad**: Podman es compatible con Docker Compose, pero se recomienda usar `podman-compose` para mejor compatibilidad.

4. **Permisos**: Asegúrate de que el usuario tenga permisos para acceder al socket de Podman.

## 🐛 Troubleshooting

### Error: "Cannot connect to Podman socket"

```bash
# Verificar que Podman esté corriendo
podman info

# Verificar ubicación del socket
ls -la /run/podman/podman.sock
# o
ls -la /run/user/$UID/podman/podman.sock
```

### Error: "Permission denied" al acceder al socket

```bash
# Agregar usuario al grupo podman
sudo usermod -aG podman $USER
# Reiniciar sesión o ejecutar: newgrp podman
```

### Los contenedores no se comunican entre sí

```bash
# Verificar que estén en la misma red
podman network ls
podman inspect <container> | grep NetworkMode
```

## 📚 Recursos

- [Podman Documentation](https://docs.podman.io/)
- [Podman Compose](https://github.com/containers/podman-compose)
- [Podman vs Docker](https://podman.io/getting-started/difference)
