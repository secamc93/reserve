# 🐳 Podman - Rupu Central Frontend

Documentación para construir y desplegar la imagen Podman del frontend de Rupu Central para ARM64.

## 📋 Requisitos Previos

- **Podman** 4.0 o superior
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
│  │         Red Interna Podman: app-network                │ │
│  │                                                         │ │
│  │  ┌──────────────────────┐    ┌──────────────────┐     │ │
│  │  │   Frontend           │───>│   Backend        │     │ │
│  │  │   (Next.js)          │    │   (Go)           │     │ │
│  │  │   Interno: 80        │    │   Interno: 3050  │     │ │
│  │  │   Host: 8080         │    │                  │     │ │
│  │  │   (8080:80)          │    │   central_reserve│     │ │
│  │  └──────────────────────┘    └──────────────────┘     │ │
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
2. **Servidor (Actions)**: Red interna Podman → `http://central_reserve:3050/api/v1`

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
1. ✅ Verifica dependencias (Podman, AWS CLI)
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
  podman login --username AWS --password-stdin public.ecr.aws

# Pull de la imagen
podman pull public.ecr.aws/d3a6d4r1/cam/reserve:frontend-latest
```

### Ejecutar en Servidor ARM64

```bash
# Conectar a la red interna de Podman donde está el backend
podman run -d \
  --name rupu-central-frontend \
  --restart unless-stopped \
  --network app-network \
  -p 8080:80 \
  public.ecr.aws/d3a6d4r1/cam/reserve:frontend-latest
```

**NOTAS:**
- Puerto interno: `80` (Next.js escucha en puerto 80)
- Puerto expuesto: `8080` (acceso desde el host)
- `--network app-network`: Conecta a la red Podman del backend (según tu podman-compose.yaml)
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
# Verificar que Podman esté instalado
podman --version

# Podman soporta builds multi-arquitectura nativamente
# Usar --platform linux/arm64 en el comando build
```

### Imagen No Inicia

Ver logs del contenedor:
```bash
podman logs -f rupu-central-frontend
```

Entrar al contenedor:
```bash
podman exec -it rupu-central-frontend sh
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
5. **Cache**: Podman usa caché de capas para builds más rápidos

## 🔗 Enlaces Útiles

- [Next.js Dockerfile Docs](https://nextjs.org/docs/app/building-your-application/deploying/docker)
- [Podman Documentation](https://docs.podman.io/)
- [AWS ECR Public Gallery](https://gallery.ecr.aws/d3a6d4r1/cam/reserve)
- [AWS Graviton](https://aws.amazon.com/ec2/graviton/)

## 📞 Soporte

Para problemas con el despliegue, contacta al equipo de DevOps.

