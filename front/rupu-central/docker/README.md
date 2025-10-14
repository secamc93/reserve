# 🐳 Docker - Rupu Central Frontend

Documentación para construir y desplegar la imagen Docker del frontend de Rupu Central para ARM64.

## 📋 Requisitos Previos

- **Docker** 20.10 o superior con BuildKit habilitado
- **Docker Buildx** para builds multi-arquitectura
- **AWS CLI** configurado con credenciales válidas

## 🏗️ Arquitectura

La imagen está optimizada para **ARM64 (AWS Graviton)** y utiliza:
- **Base**: Node.js 20 Alpine (ligera y segura)
- **Multi-stage build**: Reduce el tamaño final de la imagen
- **Standalone mode**: Next.js optimiza la build para producción
- **Non-root user**: Mejora la seguridad

### 🌐 Arquitectura de Red

```
┌─────────────────────────────────────────────────────────────┐
│                    SERVIDOR PRODUCCIÓN                       │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         Red Interna Docker: central_reserve_network    │ │
│  │                                                         │ │
│  │  ┌─────────────────┐         ┌──────────────────┐     │ │
│  │  │   Frontend      │ ──────> │   Backend        │     │ │
│  │  │   (Next.js)     │  HTTP   │   (Go)           │     │ │
│  │  │   Puerto: 3000  │ interno │   Puerto: 3050   │     │ │
│  │  └─────────────────┘         └──────────────────┘     │ │
│  │         │                            │                 │ │
│  └─────────│────────────────────────────│─────────────────┘ │
│            │                            │                   │
│            │ SSE (EventSource)          │ Server Actions    │
│            │ Público                    │ Interno           │
│            ▼                            ▼                   │
│   https://xn--rup-joa.com    http://central_reserve:3050   │
│                                                              │
└──────────────────────────────────────────────────────────────┘

Usuarios     ──> SSE ──> https://xn--rup-joa.com (dominio público)
Frontend     ──> API ──> http://central_reserve:3050 (red interna)
```

## 🚀 Despliegue a Producción

### Configurar URLs del API

⚠️ **IMPORTANTE**: Next.js necesita **DOS URLs** diferentes:

1. **Cliente (SSE)**: Dominio público → `https://xn--rup-joa.com/api/v1`
2. **Servidor (Actions)**: Red interna Docker → `http://central_reserve:3050/api/v1`

Las URLs ya están configuradas por defecto en `script/deploy.sh` líneas 75-76:

```bash
PUBLIC_API_URL=${NEXT_PUBLIC_API_BASE_URL:-"https://xn--rup-joa.com/api/v1"}
SERVER_API_URL=${API_BASE_URL:-"http://central_reserve:3050/api/v1"}
```

Si necesitas cambiarlas:

```bash
# Opción 1: Variables de entorno
export NEXT_PUBLIC_API_BASE_URL="https://otro-dominio.com/api/v1"
export API_BASE_URL="http://nombre_contenedor:3050/api/v1"
./script/deploy.sh

# Opción 2: Editar directamente el script/deploy.sh
```

### Desplegar a ECR Público

```bash
# Desde el directorio raíz del proyecto
./script/deploy.sh
```

Este script:
1. ✅ Verifica dependencias (Docker, AWS CLI, Buildx)
2. 📦 Instala dependencias de Node.js
3. 🔨 Construye la imagen para ARM64 con la URL del API
4. 🏷️ Crea tags descriptivos (frontend-latest, frontend-TIMESTAMP)
5. 🔐 Hace login a ECR público
6. ⬆️ Sube la imagen a ECR


## 📦 Usar la Imagen desde ECR

### Pull de la Imagen

```bash
# Login a ECR público
aws ecr-public get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin public.ecr.aws

# Pull de la imagen
docker pull public.ecr.aws/d3a6d4r1/cam/reserve:frontend-latest
```

### Ejecutar en Servidor ARM64

```bash
# Conectar a la red interna de Docker donde está el backend
docker run -d \
  --name rupu-central-frontend \
  --restart unless-stopped \
  --network central_reserve_network \
  -p 3000:3000 \
  public.ecr.aws/d3a6d4r1/cam/reserve:frontend-latest
```

**NOTAS:**
- `--network central_reserve_network`: Conecta a la red Docker del backend
- Las URLs ya están embebidas en la imagen durante el build
- El frontend se comunicará con el backend por la red interna (`http://central_reserve:3050`)
- Los clientes SSE usarán el dominio público (`https://xn--rup-joa.com`)

## 📊 Métricas de la Imagen

- **Tamaño final**: ~150-200 MB (comprimido)
- **Arquitectura**: linux/arm64
- **Base image**: node:20-alpine
- **Usuario**: nextjs (non-root, UID 1001)

## 🔍 Troubleshooting

### Build Falla en Simulación ARM64

Si el build de ARM64 falla en un sistema x86/amd64:

```bash
# Verificar que buildx esté instalado
docker buildx version

# Crear nuevo builder
docker buildx create --name multiarch-builder --driver docker-container --use

# Listar plataformas disponibles
docker buildx inspect --bootstrap
```

### Imagen No Inicia

Ver logs del contenedor:
```bash
docker logs -f rupu-central-frontend
```

Entrar al contenedor:
```bash
docker exec -it rupu-central-frontend sh
```


## 🏷️ Tags Disponibles en ECR

- `frontend-latest`: Última versión estable
- `frontend-YYYYMMDD-HHMMSS`: Versión con timestamp
- `frontend-vX.Y.Z`: Versiones específicas

Ver todos los tags:
```
https://gallery.ecr.aws/d3a6d4r1/cam/reserve
```

## 📝 Notas Importantes

1. **Standalone Mode**: El Dockerfile usa Next.js en modo standalone para optimización
2. **Multi-Stage Build**: Reduce el tamaño final eliminando dependencias de desarrollo
3. **ARM64 Native**: La imagen está compilada nativamente para ARM64 (AWS Graviton)
4. **Security**: Ejecuta como usuario non-root (nextjs:nodejs)
5. **Cache**: Docker usa caché de capas para builds más rápidos

## 🔗 Enlaces Útiles

- [Next.js Dockerfile Docs](https://nextjs.org/docs/app/building-your-application/deploying/docker)
- [Docker Buildx Multi-platform](https://docs.docker.com/build/building/multi-platform/)
- [AWS ECR Public Gallery](https://gallery.ecr.aws/d3a6d4r1/cam/reserve)
- [AWS Graviton](https://aws.amazon.com/ec2/graviton/)

## 📞 Soporte

Para problemas con el despliegue, contacta al equipo de DevOps.

