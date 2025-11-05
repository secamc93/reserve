#!/bin/bash

# =============================================================================
# SCRIPT DE BUILD Y PUSH A ECR - RESERVE APP
# =============================================================================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✓${NC} $1"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ✗${NC} $1"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠${NC} $1"
}

# Configurar BuildKit y optimizaciones
setup_buildkit() {
    log "Configurando BuildKit para construcción optimizada..."
    
    # Habilitar BuildKit
    export DOCKER_BUILDKIT=1
    
    # Crear directorio de cache
    CACHE_DIR=".buildkit/cache"
    mkdir -p "$CACHE_DIR"
    
    # Configurar cache compartido
    export BUILDX_CACHE_DIR="$CACHE_DIR"
    
    success "BuildKit configurado con cache en $CACHE_DIR"
}

# Limpiar cache de BuildKit
clean_buildkit_cache() {
    log "Limpiando cache de BuildKit..."
    rm -rf .buildkit/cache
    success "Cache de BuildKit limpiado"
}

# Verificar dependencias
check_dependencies() {
    log "Verificando dependencias..."
    
    # Verificar AWS CLI
    if ! command -v aws &> /dev/null; then
        error "AWS CLI no está instalado. Instálalo primero."
        exit 1
    fi
    
    # Verificar Docker
    if ! command -v docker &> /dev/null; then
        error "Docker no está instalado."
        exit 1
    fi
    
    # Verificar Docker Buildx
    if ! docker buildx version &> /dev/null; then
        error "Docker Buildx no está disponible."
        exit 1
    fi
    
    # Crear builder para multi-arch si no existe
    if ! docker buildx inspect multiarch &> /dev/null; then
        log "Creando builder multi-architectura optimizado..."
        docker buildx create --name multiarch --driver docker-container --use
    fi
    
    # Habilitar emulación para ARM64
    docker run --rm --privileged multiarch/qemu-user-static --reset -p yes
    
    success "Dependencias verificadas"
    
    # Verificar que la emulación ARM64 esté disponible
    log "Verificando emulación ARM64..."
    if docker run --rm --platform linux/arm64 alpine:latest uname -m | grep -q "aarch64"; then
        success "Emulación ARM64 funcionando correctamente"
    else
        warn "Emulación ARM64 no está funcionando. Las imágenes se construirán para la arquitectura local."
    fi
}

# Verificar configuración de AWS
check_aws_config() {
    log "Verificando configuración de AWS..."
    
    # Verificar credenciales
    if ! aws sts get-caller-identity &> /dev/null; then
        error "No tienes credenciales de AWS configuradas."
        echo "Ejecuta: aws configure"
        exit 1
    fi
    
    success "Configuración de AWS verificada"
}

# Construir y subir imágenes a ECR
build_and_push_images() {
    log "Construyendo y subiendo imágenes a ECR público..."
    
    # Obtener token de ECR público
    aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin public.ecr.aws
    
    # Repositorio único existente
    ECR_REPO="public.ecr.aws/d3a6d4r1/cam/reserve"
    
    # Tag de la imagen (puede ser pasado como parámetro)
    IMAGE_TAG="${1:-latest}"
    
    log "Tag de imagen: $IMAGE_TAG"
    
    # Lista de imágenes a construir y subir con sus tags
    declare -A images=(
        ["backend"]="back/central-reserve:docker/Dockerfile"
        ["frontend"]="front/reserve_app:Dockerfile"
        ["website"]="front/website:Dockerfile"
        ["migrator"]="back/dbpostgres:docker/Dockerfile"
    )
    
    for tag_name in "${!images[@]}"; do
        IFS=':' read -r context dockerfile <<< "${images[$tag_name]}"
        
        log "Construyendo $tag_name..."
        
        # Nombre completo de la imagen
        FULL_IMAGE_NAME="$ECR_REPO:$tag_name-$IMAGE_TAG"
        
        # Construir imagen para ARM64 con optimizaciones
        log "Construyendo $tag_name para ARM64 (optimizado)..."
        
        # Configurar argumentos específicos para cada imagen
        BUILD_ARGS=""
        if [ "$tag_name" = "frontend" ]; then
            # URL de la API para el frontend (comunicación interna Docker)
            API_BASE_URL="${REACT_APP_API_BASE_URL:-http://3.220.183.29:3050}"
            BUILD_ARGS="--build-arg REACT_APP_API_BASE_URL=$API_BASE_URL"
            log "Configurando REACT_APP_API_BASE_URL para frontend: $API_BASE_URL"
        fi
        
        # Manejar contexto especial para backend
        if [ "$tag_name" = "backend" ]; then
            log "Ejecutando build de backend desde directorio 'back'..."
            docker buildx build \
                --platform linux/arm64 \
                --cache-from type=local,src="$CACHE_DIR/$tag_name" \
                --cache-to type=local,dest="$CACHE_DIR/$tag_name",mode=max \
                --load \
                $BUILD_ARGS \
                -t "reserve-$tag_name:$IMAGE_TAG" \
                -f "$context/$dockerfile" \
                "back"
        else
            # Para las demás imágenes, usar el contexto normal
            docker buildx build \
                --platform linux/arm64 \
                --cache-from type=local,src="$CACHE_DIR/$tag_name" \
                --cache-to type=local,dest="$CACHE_DIR/$tag_name",mode=max \
                --load \
                $BUILD_ARGS \
                -t "reserve-$tag_name:$IMAGE_TAG" \
                -f "$context/$dockerfile" \
                "$context"
        fi
        
        # Tagear para ECR público
        docker tag "reserve-$tag_name:$IMAGE_TAG" "$FULL_IMAGE_NAME"
        
        # Subir a ECR público
        docker push "$FULL_IMAGE_NAME"
        
        success "$tag_name subida exitosamente como $FULL_IMAGE_NAME"
    done
}

# Mostrar información de las imágenes
show_images_info() {
    log "=================================================="
    log "IMÁGENES DISPONIBLES EN ECR"
    log "=================================================="
    echo -e "  ${ECR_REPO}:backend-${IMAGE_TAG}"
    echo -e "  ${ECR_REPO}:frontend-${IMAGE_TAG}"
    echo -e "  ${ECR_REPO}:website-${IMAGE_TAG}"
    echo -e "  ${ECR_REPO}:migrator-${IMAGE_TAG}"
    
    log ""
    log "=================================================="
    log "COMANDOS DE EJECUCIÓN"
    log "=================================================="
    echo -e "Backend:   docker run -p 3050:3050 ${ECR_REPO}:backend-${IMAGE_TAG}"
    echo -e "Frontend:  docker run -p 80:80 ${ECR_REPO}:frontend-${IMAGE_TAG}"
    echo -e "Website:   docker run -p 80:80 ${ECR_REPO}:website-${IMAGE_TAG}"
    echo -e "Migrator:  docker run --rm ${ECR_REPO}:migrator-${IMAGE_TAG}"
}

# Función principal
main() {
    case "${1:-build}" in
        "build")
            log "=================================================="
            log "BUILD Y PUSH A ECR - RESERVE APP (PRODUCCIÓN)"
            log "=================================================="
            
            check_dependencies
            setup_buildkit
            check_aws_config
            build_and_push_images "${2:-latest}"
            show_images_info
            
            success "=================================================="
            success "TODAS LAS IMÁGENES SUBIDAS EXITOSAMENTE A ECR"
            success "=================================================="
            ;;
        "clean")
            clean_buildkit_cache
            ;;
        *)
            echo "Uso: $0 [build|clean] [tag]"
            echo "  build [tag] - Construir y subir imágenes ARM64 (tag opcional, default: latest)"
            echo "  clean       - Limpiar cache de BuildKit"
            echo ""
            echo "Ejemplos:"
            echo "  $0 build           # Construir con tag 'latest'"
            echo "  $0 build v1.0.0    # Construir con tag 'v1.0.0'"
            echo "  $0 clean           # Limpiar cache"
            echo ""
            echo "NOTA: Este script construye imágenes ARM64 para producción"
            exit 1
            ;;
    esac
}

# Ejecutar función principal
main "$@" 