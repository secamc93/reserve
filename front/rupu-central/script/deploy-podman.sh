#!/bin/bash

# Script de despliegue para ECR público con Podman
# Rupu Central - Frontend Next.js

set -e

# Variables
IMAGE_NAME="rupu-central-frontend"
ECR_REPO="public.ecr.aws/d3a6d4r1/cam/reserve"
VERSION=${1:-"latest"}
DOCKERFILE_PATH="docker/Dockerfile"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Iniciando despliegue de Rupu Central Frontend${NC}"
echo -e "${YELLOW}Versión: ${VERSION}${NC}"

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: No se encontró package.json. Ejecuta desde el directorio raíz del proyecto${NC}"
    exit 1
fi

# Verificar que Podman esté corriendo
if ! podman info > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Podman no está corriendo${NC}"
    exit 1
fi

# Verificar que AWS CLI esté configurado
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: AWS CLI no está configurado correctamente${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Verificaciones completadas${NC}"

# Limpiar dependencias
echo -e "${YELLOW}📦 Limpiando dependencias de Node.js...${NC}"
if [ -f "pnpm-lock.yaml" ]; then
    echo -e "${BLUE}   Usando pnpm...${NC}"
    pnpm install
elif [ -f "package-lock.json" ]; then
    echo -e "${BLUE}   Usando npm...${NC}"
    npm ci
else
    echo -e "${BLUE}   Instalando dependencias...${NC}"
    npm install
fi

# URLs del API
# NEXT_PUBLIC_API_BASE_URL = Cliente (SSE, dominio público)
# API_BASE_URL = Servidor (Server Actions, red interna Podman)
PUBLIC_API_URL=${NEXT_PUBLIC_API_BASE_URL:-"https://xn--rup-joa.com/api/v1"}
SERVER_API_URL=${API_BASE_URL:-"http://central_reserve:3050/api/v1"}

echo -e "${BLUE}🌐 URLs del API:${NC}"
echo -e "   Cliente (SSE):  ${PUBLIC_API_URL}"
echo -e "   Servidor (Actions): ${SERVER_API_URL}"
echo ""

# Construir la imagen para ARM64
echo -e "${YELLOW}🔨 Construyendo imagen Podman para ARM64...${NC}"
echo -e "${BLUE}   Esto puede tomar varios minutos...${NC}"

podman build \
    --platform linux/arm64 \
    --build-arg NEXT_PUBLIC_API_BASE_URL=${PUBLIC_API_URL} \
    --build-arg API_BASE_URL=${SERVER_API_URL} \
    -f ${DOCKERFILE_PATH} \
    -t ${IMAGE_NAME}:${VERSION} \
    .

echo -e "${GREEN}✅ Imagen construida exitosamente${NC}"

# Etiquetar para ECR con nombres más descriptivos
echo -e "${YELLOW}🏷️  Etiquetando imagen para ECR...${NC}"

# Crear tags descriptivos
if [ "${VERSION}" = "latest" ]; then
    # Para latest, crear múltiples tags descriptivos
    TIMESTAMP=$(date +%Y%m%d-%H%M%S)
    DESCRIPTIVE_TAG="frontend-latest"
    DATED_TAG="frontend-${TIMESTAMP}"
    
    podman tag ${IMAGE_NAME}:${VERSION} ${ECR_REPO}:${DESCRIPTIVE_TAG}
    podman tag ${IMAGE_NAME}:${VERSION} ${ECR_REPO}:${DATED_TAG}
    
    echo -e "${GREEN}📅 Tags creados: ${DESCRIPTIVE_TAG}, ${DATED_TAG}${NC}"
else
    # Para versiones específicas, crear tag descriptivo
    DESCRIPTIVE_TAG="frontend-${VERSION}"
    
    podman tag ${IMAGE_NAME}:${VERSION} ${ECR_REPO}:${DESCRIPTIVE_TAG}
    
    echo -e "${GREEN}🏷️  Tags creados: ${DESCRIPTIVE_TAG}${NC}"
fi

# Login a ECR público
echo -e "${YELLOW}🔐 Haciendo login a ECR público...${NC}"
aws ecr-public get-login-password --region us-east-1 | podman login --username AWS --password-stdin public.ecr.aws

# Push de las imágenes
echo -e "${YELLOW}⬆️  Subiendo imágenes a ECR...${NC}"
echo -e "${BLUE}   Esto puede tomar varios minutos dependiendo de tu conexión...${NC}"

if [ "${VERSION}" = "latest" ]; then
    # Subir todos los tags para latest
    podman push ${ECR_REPO}:${DESCRIPTIVE_TAG}
    podman push ${ECR_REPO}:${DATED_TAG}
    echo -e "${GREEN}✅ Imágenes subidas con tags: ${DESCRIPTIVE_TAG}, ${DATED_TAG}${NC}"
else
    # Subir tags para versiones específicas
    podman push ${ECR_REPO}:${DESCRIPTIVE_TAG}
    echo -e "${GREEN}✅ Imagen subida con tag: ${DESCRIPTIVE_TAG}${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Despliegue completado exitosamente!${NC}"
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📋 Información de la imagen desplegada:${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ "${VERSION}" = "latest" ]; then
    echo -e "${BLUE}🔖 Tags disponibles:${NC}"
    echo -e "   • ${ECR_REPO}:${DESCRIPTIVE_TAG}"
    echo -e "   • ${ECR_REPO}:${DATED_TAG}"
else
    echo -e "${BLUE}🔖 Tag disponible:${NC}"
    echo -e "   • ${ECR_REPO}:${DESCRIPTIVE_TAG}"
fi

echo ""
echo -e "${BLUE}🐳 Para ejecutar en producción (ARM64):${NC}"
echo -e "   podman run -d \\"
echo -e "     --name rupu-central-frontend \\"
echo -e "     --restart unless-stopped \\"
echo -e "     --network app-network \\"
echo -e "     -p 8080:80 \\"
echo -e "     ${ECR_REPO}:${DESCRIPTIVE_TAG}"

echo ""
echo -e "${BLUE}📝 Configuración de la imagen:${NC}"
echo -e "   • Puerto interno:     80"
echo -e "   • Puerto expuesto:    8080"
echo -e "   • Cliente (SSE):      ${PUBLIC_API_URL}"
echo -e "   • Servidor (Actions): ${SERVER_API_URL}"

echo ""
echo -e "${BLUE}🌐 Repositorio ECR:${NC}"
echo -e "   https://gallery.ecr.aws/d3a6d4r1/cam/reserve"
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}✨ ¡Listo para desplegar en tu servidor ARM64!${NC}"
