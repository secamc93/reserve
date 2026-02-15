#!/bin/bash
# Script para generar reporte detallado de coverage
# Uso: ./scripts/coverage-report.sh [module_name]

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Generando reporte de coverage...${NC}\n"

# Directorio para reportes
REPORTS_DIR="coverage-reports"
mkdir -p "$REPORTS_DIR"

# Función para generar reporte de un módulo
generate_module_report() {
    local module_path=$1
    local module_name=$(basename "$module_path")

    echo -e "${YELLOW}📦 Analizando: ${module_name}${NC}"

    # Ejecutar tests con coverage
    if go test "./$module_path/..." -coverprofile="$REPORTS_DIR/coverage-${module_name}.out" -covermode=atomic > /dev/null 2>&1; then
        # Calcular coverage total
        local coverage=$(go tool cover -func="$REPORTS_DIR/coverage-${module_name}.out" | tail -n 1 | awk '{print $3}')

        # Generar HTML
        go tool cover -html="$REPORTS_DIR/coverage-${module_name}.out" -o "$REPORTS_DIR/coverage-${module_name}.html" 2>/dev/null

        # Color según coverage
        if (( $(echo "$coverage" | sed 's/%//') > 80 )); then
            echo -e "  ${GREEN}✅ Coverage: $coverage${NC}"
        elif (( $(echo "$coverage" | sed 's/%//') > 50 )); then
            echo -e "  ${YELLOW}⚠️  Coverage: $coverage${NC}"
        else
            echo -e "  ${RED}❌ Coverage: $coverage${NC}"
        fi

        echo -e "  📄 Reporte: $REPORTS_DIR/coverage-${module_name}.html"
    else
        echo -e "  ${RED}❌ Sin tests o error en tests${NC}"
    fi
    echo ""
}

# Si se especifica un módulo, analizar solo ese
if [ -n "$1" ]; then
    MODULE_PATH="services/$1"
    if [ -d "$MODULE_PATH" ]; then
        generate_module_report "$MODULE_PATH"
    else
        echo -e "${RED}❌ Módulo no encontrado: $1${NC}"
        exit 1
    fi
else
    # Analizar todos los módulos
    echo -e "${BLUE}📊 Analizando todos los módulos de horizontalproperty...${NC}\n"

    for module in services/horizontalproperty/*; do
        if [ -d "$module" ] && [ -f "$module/bundle.go" ]; then
            generate_module_report "$module"
        fi
    done

    echo -e "${BLUE}📊 Analizando módulo auth...${NC}\n"
    if [ -d "services/auth" ]; then
        generate_module_report "services/auth"
    fi
fi

# Generar reporte consolidado
echo -e "${BLUE}📊 Generando reporte consolidado...${NC}"
go test ./... -coverprofile="$REPORTS_DIR/coverage-all.out" -covermode=atomic > /dev/null 2>&1
go tool cover -html="$REPORTS_DIR/coverage-all.out" -o "$REPORTS_DIR/coverage-all.html" 2>/dev/null

TOTAL_COVERAGE=$(go tool cover -func="$REPORTS_DIR/coverage-all.out" | tail -n 1 | awk '{print $3}')
echo -e "\n${GREEN}✅ Coverage total del proyecto: $TOTAL_COVERAGE${NC}"
echo -e "${BLUE}📄 Reporte consolidado: $REPORTS_DIR/coverage-all.html${NC}\n"

# Mostrar top 10 archivos con menor coverage
echo -e "${YELLOW}📉 Top 10 archivos con menor coverage:${NC}"
go tool cover -func="$REPORTS_DIR/coverage-all.out" | grep -v "total:" | sort -k3 -n | head -n 10 | \
    awk '{printf "  %-60s %s\n", $1, $3}'

echo -e "\n${GREEN}✅ Reportes generados en: $REPORTS_DIR/${NC}"
