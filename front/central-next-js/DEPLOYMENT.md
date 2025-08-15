# Guía de Despliegue - Frontend Central Next.js

## Configuración de Entorno

### Variables de Entorno de Producción

La aplicación está configurada para usar diferentes URLs según el entorno:

- **Desarrollo local**: `http://localhost:3050`
- **Producción**: `https://www.xn--rup-joa.com/api`

### Configuración del Path Base

La aplicación está configurada para ejecutarse en el path `/app`:
- **URL de acceso**: `https://www.xn--rup-joa.com/app`
- **Configuración**: `next.config.ts` con `basePath: '/app'`

## Despliegue

### 1. Preparación

Asegúrate de estar en el directorio raíz del proyecto:
```bash
cd /home/cam/Desktop/reserve/front/central-next-js
```

### 2. Ejecutar Script de Despliegue

```bash
./scripts/deploy.sh
```

El script:
- Configura las variables de entorno de producción
- Construye la imagen Docker para ARM64
- Sube la imagen a AWS ECR
- Configura la URL del backend para producción

### 3. Verificación

Después del despliegue, la aplicación estará disponible en:
- **Frontend**: `https://www.xn--rup-joa.com/app`
- **API Backend**: `https://www.xn--rup-joa.com/api`

## Configuración de Docker

### Build Args

El Dockerfile recibe los siguientes argumentos de build:
- `NEXT_PUBLIC_API_BASE_URL`: URL del backend
- `NEXT_PUBLIC_APP_NAME`: Nombre de la aplicación
- `NEXT_PUBLIC_APP_VERSION`: Versión de la aplicación
- `NODE_ENV`: Entorno de ejecución

### Variables de Entorno en Runtime

Las variables se configuran en tiempo de ejecución para permitir flexibilidad en el despliegue.

## Estructura de URLs

- **Desarrollo**: `http://localhost:3000` (sin path base)
- **Producción**: `https://www.xn--rup-joa.com/app` (con path base `/app`)

## Troubleshooting

### Error: "package.json not found"
- **Causa**: Ejecutar el script desde el directorio incorrecto
- **Solución**: Ejecutar desde `/front/central-next-js`

### Error: "Docker is not running"
- **Causa**: Docker no está ejecutándose
- **Solución**: Iniciar Docker Desktop

### Error: "AWS CLI not configured"
- **Causa**: AWS CLI no está configurado
- **Solución**: Ejecutar `aws configure` 