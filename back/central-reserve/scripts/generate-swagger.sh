#!/bin/bash

# Script para generar documentación Swagger separada para Auth y Properties
# Uso: ./scripts/generate-swagger.sh [auth|properties|all]
# 
# El script detecta automáticamente el entorno y usa valores por defecto:
#   - Desarrollo (APP_ENV=development o no definido): http://localhost:${HTTP_PORT}
#   - Producción (APP_ENV=production): https://www.xn--rup-joa.com
# 
# Variables de entorno (opcionales, se pueden definir en .env):
#   APP_ENV          - Entorno: development/production (default: development)
#   URL_BASE_SWAGGER - URL base para Swagger (sobrescribe valores por defecto)
#   HTTP_PORT        - Puerto HTTP (default: 3050, solo usado en desarrollo)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Cargar variables de entorno desde .env si existe
load_env_file() {
    if [ -f .env ]; then
        echo -e "${BLUE}📋 Cargando variables desde .env...${NC}"
        # Exportar variables del .env (ignorar comentarios y líneas vacías)
        set -a
        source .env 2>/dev/null || true
        set +a
    fi
}

# Obtener configuración de URL base de Swagger
get_swagger_config() {
    # Cargar .env si existe
    load_env_file
    
    local url_base="${URL_BASE_SWAGGER:-}"
    local http_port="${HTTP_PORT:-3050}"
    local app_env="${APP_ENV:-development}"
    
    # Si no está definida, determinar según el entorno
    if [ -z "$url_base" ]; then
        if [ "$app_env" = "production" ] || [ "$app_env" = "prod" ]; then
            # URL de producción por defecto
            url_base="https://www.xn--rup-joa.com"
            echo -e "${BLUE}📋 Entorno: producción${NC}"
            echo -e "${BLUE}📋 Usando URL de producción por defecto: ${url_base}${NC}"
        else
            # URL de desarrollo por defecto
            url_base="http://localhost:${http_port}"
            echo -e "${BLUE}📋 Entorno: desarrollo${NC}"
            echo -e "${BLUE}📋 Usando URL de desarrollo por defecto: ${url_base}${NC}"
        fi
    else
        echo -e "${BLUE}📋 Usando URL_BASE_SWAGGER definida: ${url_base}${NC}"
    fi
    
    # Parsear URL para extraer host y scheme
    local host
    local scheme
    
    if [[ "$url_base" =~ ^https?:// ]]; then
        # Extraer scheme
        if [[ "$url_base" =~ ^https:// ]]; then
            scheme="https"
            host="${url_base#https://}"
        else
            scheme="http"
            host="${url_base#http://}"
        fi
    else
        # Si no tiene scheme, asumir http
        scheme="http"
        host="$url_base"
    fi
    
    # Exportar variables para uso en funciones
    export SWAGGER_HOST="$host"
    export SWAGGER_SCHEME="$scheme"
    export SWAGGER_BASE_URL="$url_base"
    
    echo -e "${BLUE}📋 Configuración Swagger:${NC}"
    echo -e "   Entorno: ${app_env}"
    echo -e "   Host: ${SWAGGER_HOST}"
    echo -e "   Scheme: ${SWAGGER_SCHEME}"
    echo -e "   Base URL: ${SWAGGER_BASE_URL}"
    echo ""
}

generate_auth() {
    echo -e "${BLUE}📚 Generando documentación de Auth...${NC}"
    
    # Generar documentación completa primero
    swag init -g ./cmd/main.go \
        --output ./shared/docs \
        --parseDependency \
        --parseInternal \
        --exclude services/reserve \
        --exclude services/restaurants
    
    # Filtrar solo rutas de auth y actualizar host/schemes desde variables de entorno
    mkdir -p ./shared/docs/auth
    cat ./shared/docs/swagger.json | jq --arg host "$SWAGGER_HOST" --arg scheme "$SWAGGER_SCHEME" '{
        swagger: .swagger,
        info: (.info | .title = "Auth API" | .description = "API para la gestión de autenticación, usuarios, roles y permisos."),
        host: $host,
        basePath: .basePath,
        schemes: [$scheme],
        paths: (.paths | with_entries(select(.key | test("^/(actions|auth|users|roles|permissions|resources|business-types|businesses|dashboard|logs)")))),
        definitions: .definitions,
        securityDefinitions: .securityDefinitions
    }' > ./shared/docs/auth/swagger.json
    
    # Generar docs.go desde el JSON filtrado usando Python
    python3 << 'PYTHON_SCRIPT'
import json
import os

# Leer variables de entorno
swagger_host = os.environ.get('SWAGGER_HOST', 'localhost:3050')
swagger_scheme = os.environ.get('SWAGGER_SCHEME', 'http')

# Leer swagger.json
with open('shared/docs/auth/swagger.json', 'r', encoding='utf-8') as f:
    swagger_data = json.load(f)

# Convertir a string JSON
json_str = json.dumps(swagger_data, ensure_ascii=False, indent=2)

# Escapar backticks y llaves para Go (necesitamos escapar para template de Go)
# Reemplazar backticks con concatenación de strings (usar chr(96) para evitar problemas con bash)
backtick = chr(96)
json_str = json_str.replace(backtick, backtick + ' + "' + backtick + '" + ' + backtick)
# Reemplazar {{ con template de Go
json_str = json_str.replace('{{', '{{"{{"}}')
# Reemplazar }} con template de Go  
json_str = json_str.replace('}}', '{{"}}"}}')

# Obtener valores del JSON o usar defaults
version = swagger_data.get("info", {}).get("version", "1.0")
base_path = swagger_data.get("basePath", "/api/v1")

# Generar docs.go con valores dinámicos
docs_content = f'''// Package auth Code generated by swaggo/swag. DO NOT EDIT
package auth

import "github.com/swaggo/swag"

const docTemplate = `{json_str}`

var SwaggerInfo = &swag.Spec{{
	Version:          "{version}",
	Host:             "{swagger_host}",
	BasePath:         "{base_path}",
	Schemes:          []string{{"{swagger_scheme}"}},
	Title:            "Auth API",
	Description:      "API para la gestión de autenticación, usuarios, roles y permisos.",
	InfoInstanceName: "auth",
	SwaggerTemplate:  docTemplate,
	LeftDelim:        "{{{{",
	RightDelim:       "}}}}",
}}

func init() {{
	swag.Register(SwaggerInfo.InstanceName(), SwaggerInfo)
}}
'''

with open('shared/docs/auth/docs.go', 'w', encoding='utf-8') as f:
    f.write(docs_content)
PYTHON_SCRIPT

    echo -e "${GREEN}✅ Documentación de auth generada en ./shared/docs/auth/${NC}"
}

generate_properties() {
    echo -e "${BLUE}📚 Generando documentación de Properties...${NC}"
    
    # Generar documentación completa primero
    swag init -g ./cmd/main.go \
        --output ./shared/docs \
        --parseDependency \
        --parseInternal \
        --exclude services/reserve \
        --exclude services/restaurants
    
    # Filtrar solo rutas de properties y actualizar host/schemes desde variables de entorno
    mkdir -p ./shared/docs/properties
    cat ./shared/docs/swagger.json | jq --arg host "$SWAGGER_HOST" --arg scheme "$SWAGGER_SCHEME" '{
        swagger: .swagger,
        info: (.info | .title = "Properties API" | .description = "API para la gestión de propiedades horizontales."),
        host: $host,
        basePath: .basePath,
        schemes: [$scheme],
        paths: (.paths | with_entries(select(.key | test("horizontal|attendance|resident|voting|property|public|visit|package|packages|common|parking")))),
        definitions: .definitions,
        securityDefinitions: .securityDefinitions
    }' > ./shared/docs/properties/swagger.json
    
    # Generar docs.go desde el JSON filtrado
    python3 << 'PYTHON_SCRIPT'
import json
import os

# Leer variables de entorno
swagger_host = os.environ.get('SWAGGER_HOST', 'localhost:3050')
swagger_scheme = os.environ.get('SWAGGER_SCHEME', 'http')

# Leer swagger.json
with open('shared/docs/properties/swagger.json', 'r', encoding='utf-8') as f:
    swagger_data = json.load(f)

# Convertir a string JSON
json_str = json.dumps(swagger_data, ensure_ascii=False, indent=2)

# Escapar backticks y llaves para Go (necesitamos escapar para template de Go)
# Reemplazar backticks con concatenación de strings (usar chr(96) para evitar problemas con bash)
backtick = chr(96)
json_str = json_str.replace(backtick, backtick + ' + "' + backtick + '" + ' + backtick)
# Reemplazar {{ con template de Go
json_str = json_str.replace('{{', '{{"{{"}}')
# Reemplazar }} con template de Go  
json_str = json_str.replace('}}', '{{"}}"}}')

# Obtener valores del JSON o usar defaults
version = swagger_data.get("info", {}).get("version", "1.0")
base_path = swagger_data.get("basePath", "/api/v1")

# Generar docs.go con valores dinámicos
docs_content = f'''// Package properties Code generated by swaggo/swag. DO NOT EDIT
package properties

import "github.com/swaggo/swag"

const docTemplate = `{json_str}`

var SwaggerInfo = &swag.Spec{{
	Version:          "{version}",
	Host:             "{swagger_host}",
	BasePath:         "{base_path}",
	Schemes:          []string{{"{swagger_scheme}"}},
	Title:            "Properties API",
	Description:      "API para la gestión de propiedades horizontales.",
	InfoInstanceName: "properties",
	SwaggerTemplate:  docTemplate,
	LeftDelim:        "{{{{",
	RightDelim:       "}}}}",
}}

func init() {{
	swag.Register(SwaggerInfo.InstanceName(), SwaggerInfo)
}}
'''

with open('shared/docs/properties/docs.go', 'w', encoding='utf-8') as f:
    f.write(docs_content)
PYTHON_SCRIPT

    echo -e "${GREEN}✅ Documentación de properties generada en ./shared/docs/properties/${NC}"
}

# Main
# Obtener configuración de Swagger desde variables de entorno
get_swagger_config

case "${1:-all}" in
    auth)
        generate_auth
        ;;
    properties)
        generate_properties
        ;;
    all)
        generate_auth
        generate_properties
        echo -e "${GREEN}✅ Documentación completa generada para ambos módulos${NC}"
        ;;
    *)
        echo "Uso: $0 [auth|properties|all]"
        echo ""
        echo "Variables de entorno:"
        echo "  URL_BASE_SWAGGER - URL base para Swagger (opcional)"
        echo "                    Si no se define, se usa según APP_ENV:"
        echo "                    - production/prod: https://www.xn--rup-joa.com"
        echo "                    - desarrollo: http://localhost:\${HTTP_PORT}"
        echo "  APP_ENV          - Entorno de la aplicación (development/production, default: development)"
        echo "  HTTP_PORT         - Puerto HTTP (usado en desarrollo, default: 3050)"
        echo ""
        echo "Ejemplos:"
        echo "  # Desarrollo (usa localhost:3050)"
        echo "  make docs-all"
        echo ""
        echo "  # Producción (usa https://www.xn--rup-joa.com)"
        echo "  APP_ENV=production make docs-all"
        echo ""
        echo "  # Con URL personalizada"
        echo "  URL_BASE_SWAGGER=https://api.example.com make docs-all"
        exit 1
        ;;
esac
