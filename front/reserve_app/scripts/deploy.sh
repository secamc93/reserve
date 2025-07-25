#!/bin/bash

# Script de despliegue para ECR público
# Reserve App Frontend - Sistema de Reservas

set -e

# Variables
IMAGE_NAME="reserve-app-frontend"
ECR_REPO="public.ecr.aws/d3a6d4r1/cam/reserve"
VERSION=${1:-"latest"}
DOCKERFILE_PATH="Dockerfile"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Iniciando despliegue de Reserve App Frontend${NC}"
echo -e "${YELLOW}Versión: ${VERSION}${NC}"

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: No se encontró package.json. Ejecuta desde el directorio raíz del proyecto${NC}"
    exit 1
fi

# Verificar que existe el Dockerfile
if [ ! -f "${DOCKERFILE_PATH}" ]; then
    echo -e "${RED}❌ Error: No se encontró ${DOCKERFILE_PATH}${NC}"
    exit 1
fi

# Verificar que Docker esté corriendo
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Docker no está corriendo${NC}"
    exit 1
fi

# Verificar que AWS CLI esté configurado
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: AWS CLI no está configurado correctamente${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Verificaciones completadas${NC}"

# Limpiar dependencias de Node.js
echo -e "${YELLOW}📦 Limpiando dependencias de Node.js...${NC}"
if [ -d "node_modules" ]; then
    rm -rf node_modules
fi
npm install --legacy-peer-deps

# Construir la imagen con URL hardcodeada para producción
echo -e "${YELLOW}🔨 Construyendo imagen Docker...${NC}"
echo -e "${BLUE}Usando REACT_APP_API_BASE_URL: https://www.xn--rup-joa.com/api${NC}"
docker build \
  --no-cache \
  --build-arg REACT_APP_API_BASE_URL="https://www.xn--rup-joa.com/api" \
  -f ${DOCKERFILE_PATH} \
  -t ${IMAGE_NAME}:${VERSION} \
  .

# Etiquetar para ECR con prefijo frontend
echo -e "${YELLOW}🏷️ Etiquetando imagen para ECR...${NC}"
FRONTEND_TAG="frontend-${VERSION}"
docker tag ${IMAGE_NAME}:${VERSION} ${ECR_REPO}:${FRONTEND_TAG}

# Si es latest, también crear tag con timestamp
if [ "${VERSION}" = "latest" ]; then
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    docker tag ${IMAGE_NAME}:${VERSION} ${ECR_REPO}:frontend-${TIMESTAMP}
    echo -e "${GREEN}📅 Tag con timestamp: frontend-${TIMESTAMP}${NC}"
fi

# Login a ECR público
echo -e "${YELLOW}🔐 Haciendo login a ECR público...${NC}"
aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin public.ecr.aws

# Push de la imagen
echo -e "${YELLOW}⬆️ Subiendo imagen a ECR...${NC}"
docker push ${ECR_REPO}:${FRONTEND_TAG}

# Si creamos tag con timestamp, también lo subimos
if [ "${VERSION}" = "latest" ]; then
    docker push ${ECR_REPO}:frontend-${TIMESTAMP}
    echo -e "${GREEN}✅ Imagen subida con tags: frontend-latest y frontend-${TIMESTAMP}${NC}"
else
    echo -e "${GREEN}✅ Imagen subida con tag: frontend-${VERSION}${NC}"
fi

echo -e "${GREEN}🎉 Despliegue completado exitosamente!${NC}"
echo -e "${YELLOW}📋 Para usar la imagen:${NC}"
echo -e "docker run -p 80:80 \\
  -e REACT_APP_API_BASE_URL=https://www.xn--rup-joa.com/api \\
  ${ECR_REPO}:${FRONTEND_TAG}"
echo -e ""
echo -e "${YELLOW}🐳 Con Docker Compose:${NC}"
echo -e "version: '3.8'"
echo -e "services:"
echo -e "  frontend:"
echo -e "    image: ${ECR_REPO}:${FRONTEND_TAG}"
echo -e "    ports:"
echo -e "      - \"80:80\""
echo -e "    environment:"
echo -e "      - REACT_APP_API_BASE_URL=https://www.xn--rup-joa.com/api"
echo -e ""
echo -e "${YELLOW}🌐 URL del repositorio ECR:${NC}"
echo -e "https://gallery.ecr.aws/d3a6d4r1/cam/reserve" 