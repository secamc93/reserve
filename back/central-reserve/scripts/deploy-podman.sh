#!/bin/bash

# Script de despliegue para ECR público con Podman
# Central Reserve - Sistema de Reservas

set -e

# Variables
IMAGE_NAME="central-reserve"
ECR_REPO="public.ecr.aws/d3a6d4r1/cam/reserve"
VERSION=${1:-"latest"}
DOCKERFILE_PATH="docker/Dockerfile"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Iniciando despliegue de Central Reserve${NC}"
echo -e "${YELLOW}Versión: ${VERSION}${NC}"

# Verificar que estamos en el directorio correcto
if [ ! -f "go.mod" ]; then
    echo -e "${RED}❌ Error: No se encontró go.mod. Ejecuta desde el directorio raíz del proyecto${NC}"
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
echo -e "${YELLOW}📦 Limpiando dependencias...${NC}"
go mod tidy

# Construir la imagen
echo -e "${YELLOW}🔨 Construyendo imagen Podman para ARM64...${NC}"
# Cambiar al directorio padre para incluir dbpostgres en el contexto de build
cd ..
podman build --platform linux/arm64 -f central-reserve/${DOCKERFILE_PATH} -t ${IMAGE_NAME}:${VERSION} .
# Volver al directorio original
cd central-reserve

# Etiquetar para ECR con nombres más descriptivos
echo -e "${YELLOW}🏷️ Etiquetando imagen para ECR...${NC}"

# Crear tags descriptivos
if [ "${VERSION}" = "latest" ]; then
    # Para latest, crear múltiples tags descriptivos
    TIMESTAMP=$(date +%Y%m%d)
    DESCRIPTIVE_TAG="backend-latest"
    DATED_TAG="backend-${TIMESTAMP}"
    
    podman tag ${IMAGE_NAME}:${VERSION} ${ECR_REPO}:${VERSION}
    podman tag ${IMAGE_NAME}:${VERSION} ${ECR_REPO}:${DESCRIPTIVE_TAG}
    podman tag ${IMAGE_NAME}:${VERSION} ${ECR_REPO}:${DATED_TAG}
    
    echo -e "${GREEN}📅 Tags creados: latest, ${DESCRIPTIVE_TAG}, ${DATED_TAG}${NC}"
else
    # Para versiones específicas, crear tag descriptivo
    DESCRIPTIVE_TAG="backend-${VERSION}"
    
    podman tag ${IMAGE_NAME}:${VERSION} ${ECR_REPO}:${VERSION}
    podman tag ${IMAGE_NAME}:${VERSION} ${ECR_REPO}:${DESCRIPTIVE_TAG}
    
    echo -e "${GREEN}🏷️ Tags creados: ${VERSION}, ${DESCRIPTIVE_TAG}${NC}"
fi

# Login a ECR público
echo -e "${YELLOW}🔐 Haciendo login a ECR público...${NC}"
aws ecr-public get-login-password --region us-east-1 | podman login --username AWS --password-stdin public.ecr.aws

# Push de las imágenes
echo -e "${YELLOW}⬆️ Subiendo imágenes a ECR...${NC}"

if [ "${VERSION}" = "latest" ]; then
    # Subir todos los tags para latest
    podman push ${ECR_REPO}:${VERSION}
    podman push ${ECR_REPO}:${DESCRIPTIVE_TAG}
    podman push ${ECR_REPO}:${DATED_TAG}
    echo -e "${GREEN}✅ Imágenes subidas con tags: latest, ${DESCRIPTIVE_TAG}, ${DATED_TAG}${NC}"
else
    # Subir tags para versiones específicas
    podman push ${ECR_REPO}:${VERSION}
    podman push ${ECR_REPO}:${DESCRIPTIVE_TAG}
    echo -e "${GREEN}✅ Imágenes subidas con tags: ${VERSION}, ${DESCRIPTIVE_TAG}${NC}"
fi

echo -e "${GREEN}🎉 Despliegue completado exitosamente!${NC}"
echo -e "${YELLOW}📋 Para usar la imagen:${NC}"
if [ "${VERSION}" = "latest" ]; then
    echo -e "podman run --env-file .env -p 3050:3050 ${ECR_REPO}:${DESCRIPTIVE_TAG}"
    echo -e "${YELLOW}🔖 Opciones de tags disponibles:${NC}"
    echo -e "  - ${ECR_REPO}:latest"
    echo -e "  - ${ECR_REPO}:${DESCRIPTIVE_TAG}"
    echo -e "  - ${ECR_REPO}:${DATED_TAG}"
else
    echo -e "podman run --env-file .env -p 3050:3050 ${ECR_REPO}:${DESCRIPTIVE_TAG}"
    echo -e "${YELLOW}🔖 Tags disponibles:${NC}"
    echo -e "  - ${ECR_REPO}:${VERSION}"
    echo -e "  - ${ECR_REPO}:${DESCRIPTIVE_TAG}"
fi
echo -e "${YELLOW}🌐 URL del repositorio ECR:${NC}"
echo -e "https://gallery.ecr.aws/d3a6d4r1/cam/reserve"
