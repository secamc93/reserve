#!/bin/bash

# Script para build y despliegue con Podman
# Uso: ./scripts/build-podman.sh [dev|prod] [tag]

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir con colores
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Variables
ENVIRONMENT=${1:-dev}
TAG=${2:-latest}
IMAGE_NAME="central-reserve"
FULL_IMAGE_NAME="${IMAGE_NAME}:${TAG}"

# Verificar que estamos en el directorio correcto
if [ ! -f "go.mod" ]; then
    print_error "No se encontró go.mod. Ejecuta este script desde la raíz del proyecto."
    exit 1
fi

print_status "🚀 Iniciando build de Podman..."
print_status "Entorno: $ENVIRONMENT"
print_status "Tag: $TAG"
print_status "Imagen: $FULL_IMAGE_NAME"

# Verificar que existe el archivo .env
if [ ! -f ".env" ]; then
    print_warning "No se encontró archivo .env"
    print_status "Creando .env desde template..."
    if [ -f "env-template-email.txt" ]; then
        cp env-template-email.txt .env
        print_success "Archivo .env creado desde template"
    else
        print_error "No se encontró template de variables de entorno"
        exit 1
    fi
fi

# Limpiar contenedores y imágenes anteriores (opcional)
if [ "$ENVIRONMENT" = "prod" ]; then
    print_status "🧹 Limpiando contenedores anteriores..."
    podman-compose -f docker/docker-compose.prod.yml down --remove-orphans 2>/dev/null || true
fi

# Build de la imagen
print_status "🔨 Construyendo imagen Podman..."
podman build -f docker/Dockerfile -t $FULL_IMAGE_NAME .

if [ $? -eq 0 ]; then
    print_success "✅ Imagen construida exitosamente: $FULL_IMAGE_NAME"
else
    print_error "❌ Error construyendo la imagen"
    exit 1
fi

# Mostrar información de la imagen
print_status "📊 Información de la imagen:"
podman images $FULL_IMAGE_NAME

# Si es desarrollo, levantar con podman-compose
if [ "$ENVIRONMENT" = "dev" ]; then
    print_status "🐳 Levantando entorno de desarrollo..."
    cd docker
    podman-compose -f docker-compose.dev.yml up -d
    
    print_success "✅ Entorno de desarrollo levantado!"
    print_status "📋 Servicios disponibles:"
    echo "  - API Backend: http://localhost:3050"
    echo "  - Swagger Docs: http://localhost:3050/docs"
    echo "  - PostgreSQL: localhost:5432"
    echo "  - Redis: localhost:6379"
    echo "  - NATS: localhost:4222"
    echo "  - NATS Dashboard: http://localhost:8111"
    echo "  - Adminer (DB): http://localhost:8080"
    
    print_status "📝 Logs en tiempo real:"
    echo "  podman-compose -f docker/docker-compose.dev.yml logs -f central_reserve"
    
elif [ "$ENVIRONMENT" = "prod" ]; then
    print_status "🚀 Preparando para producción..."
    print_success "✅ Imagen lista para producción: $FULL_IMAGE_NAME"
    print_status "📋 Comandos útiles:"
    echo "  - Ejecutar: podman run --env-file .env -p 3050:3050 $FULL_IMAGE_NAME"
    echo "  - Con podman-compose: podman-compose -f docker/docker-compose.prod.yml up -d"
fi

print_success "🎉 Build completado exitosamente!"
