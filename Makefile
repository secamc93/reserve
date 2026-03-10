# Makefile Centralizado - Proyecto Reserve
# Uso: make [comando]

.PHONY: help run-centralback run-centralfront run-website run-migrations run-all stop-all

# ============================================
# VARIABLES
# ============================================
BACK_CENTRAL_DIR=back/central-reserve
BACK_DBPOSTGRES_DIR=back/dbpostgres
FRONT_CENTRAL_DIR=front/rupu-central
FRONT_WEBSITE_DIR=front/website

# ============================================
# AYUDA
# ============================================
help: ## Mostrar esta ayuda
	@echo "┌────────────────────────────────────────────────────────────────┐"
	@echo "│         🏗️  MAKEFILE CENTRALIZADO - PROYECTO RESERVE          │"
	@echo "└────────────────────────────────────────────────────────────────┘"
	@echo ""
	@echo "📦 BACKEND (Go API):"
	@echo "  \033[36mrun-centralback\033[0m          - Ejecutar backend (Go API en :3050)"
	@echo "  \033[36mbuild-centralback\033[0m        - Compilar backend"
	@echo "  \033[36mtest-centralback\033[0m         - Ejecutar tests"
	@echo "  \033[36mtest-coverage-centralback\033[0m - Coverage con reporte HTML"
	@echo "  \033[36mdocs-centralback\033[0m         - Generar Swagger docs"
	@echo "  \033[36mpodman-dev\033[0m               - Levantar entorno dev (API + DB + Redis + NATS)"
	@echo "  \033[36mpodman-stop\033[0m              - Detener contenedores Podman"
	@echo "  \033[36mpodman-logs\033[0m              - Ver logs de Podman"
	@echo ""
	@echo "🗄️  MIGRACIONES (DB):"
	@echo "  \033[36mrun-migrations\033[0m           - Ejecutar migraciones"
	@echo "  \033[36mmigrate-up\033[0m               - Aplicar migraciones pendientes"
	@echo "  \033[36mmigrate-down\033[0m             - Revertir última migración"
	@echo "  \033[36mmigrate-status\033[0m           - Ver estado de migraciones"
	@echo ""
	@echo "🎨 FRONTEND:"
	@echo "  \033[36mrun-centralfront\033[0m         - Ejecutar frontend Next.js (en :3000)"
	@echo "  \033[36mbuild-centralfront\033[0m       - Compilar frontend para producción"
	@echo "  \033[36minstall-centralfront\033[0m     - Instalar dependencias frontend"
	@echo "  \033[36mclean-centralfront\033[0m       - Limpiar .next"
	@echo "  \033[36mrun-website\033[0m              - Ejecutar website Astro (en :4321)"
	@echo "  \033[36mbuild-website\033[0m            - Compilar website"
	@echo "  \033[36minstall-website\033[0m          - Instalar dependencias website"
	@echo ""
	@echo "🚀 FULL STACK:"
	@echo "  \033[36mrun-all\033[0m                  - Instrucciones para ejecutar TODO"
	@echo "  \033[36mstop-all\033[0m                 - Detener todos los servicios"
	@echo "  \033[36mhealth-check\033[0m             - Verificar salud de servicios"
	@echo "  \033[36mclean-all\033[0m                - Limpiar todos los archivos generados"
	@echo "  \033[36minstall-all\033[0m              - Instalar dependencias de TODO"
	@echo "  \033[36minfo\033[0m                     - Info del sistema"
	@echo ""
	@echo "⚡ ALIASES RÁPIDOS:"
	@echo "  \033[36mdev-back\033[0m                 - Alias de run-centralback"
	@echo "  \033[36mdev-front\033[0m                - Alias de run-centralfront"
	@echo "  \033[36mdev-full\033[0m                 - Alias de run-all"
	@echo ""
	@echo "💡 Tip: Usa 'make <comando>' para ejecutar cualquier comando"
	@echo ""

# ============================================
# BACKEND - CENTRAL RESERVE
# ============================================
run-centralback: ## Ejecutar backend central-reserve (Go API en :3050)
	@echo "🚀 Iniciando backend central-reserve..."
	@cd $(BACK_CENTRAL_DIR) && make run

build-centralback: ## Compilar backend central-reserve
	@echo "🔨 Compilando backend central-reserve..."
	@cd $(BACK_CENTRAL_DIR) && make build

test-centralback: ## Ejecutar tests del backend
	@echo "🧪 Ejecutando tests del backend..."
	@cd $(BACK_CENTRAL_DIR) && make test

test-coverage-centralback: ## Coverage del backend con reporte HTML
	@echo "📊 Generando coverage del backend..."
	@cd $(BACK_CENTRAL_DIR) && make test-coverage

docs-centralback: ## Generar documentación Swagger del backend
	@echo "📚 Generando documentación Swagger..."
	@cd $(BACK_CENTRAL_DIR) && make docs

podman-dev: ## Levantar entorno dev completo con Podman (API + DB + Redis + NATS)
	@echo "🐳 Levantando entorno de desarrollo con Podman..."
	@cd $(BACK_CENTRAL_DIR) && make podman-dev

podman-stop: ## Detener todos los contenedores Podman
	@echo "🛑 Deteniendo contenedores Podman..."
	@cd $(BACK_CENTRAL_DIR) && make podman-stop

podman-logs: ## Ver logs del backend en Podman
	@cd $(BACK_CENTRAL_DIR) && make podman-logs

# ============================================
# MIGRACIONES - DBPOSTGRES
# ============================================
run-migrations: ## Ejecutar migraciones de base de datos
	@echo "🗄️  Ejecutando migraciones..."
	@cd $(BACK_DBPOSTGRES_DIR) && go run cmd/main.go

migrate-up: ## Aplicar todas las migraciones pendientes
	@echo "⬆️  Aplicando migraciones..."
	@cd $(BACK_DBPOSTGRES_DIR) && go run cmd/main.go migrate up

migrate-down: ## Revertir última migración
	@echo "⬇️  Revirtiendo migración..."
	@cd $(BACK_DBPOSTGRES_DIR) && go run cmd/main.go migrate down

migrate-status: ## Ver estado de las migraciones
	@echo "📋 Estado de migraciones:"
	@cd $(BACK_DBPOSTGRES_DIR) && go run cmd/main.go migrate status

# ============================================
# FRONTEND - RUPU CENTRAL (Next.js)
# ============================================
run-centralfront: ## Ejecutar frontend rupu-central (Next.js en :3000)
	@echo "🎨 Iniciando frontend rupu-central..."
	@cd $(FRONT_CENTRAL_DIR) && pnpm dev

build-centralfront: ## Compilar frontend rupu-central para producción
	@echo "🔨 Compilando frontend rupu-central..."
	@cd $(FRONT_CENTRAL_DIR) && pnpm build

install-centralfront: ## Instalar dependencias del frontend central
	@echo "📦 Instalando dependencias de rupu-central..."
	@cd $(FRONT_CENTRAL_DIR) && pnpm install

clean-centralfront: ## Limpiar .next del frontend central
	@echo "🧹 Limpiando .next de rupu-central..."
	@cd $(FRONT_CENTRAL_DIR) && pnpm clean

# ============================================
# FRONTEND - WEBSITE (Astro)
# ============================================
run-website: ## Ejecutar website (Astro en :4321)
	@echo "🌐 Iniciando website (Astro)..."
	@cd $(FRONT_WEBSITE_DIR) && pnpm dev

build-website: ## Compilar website para producción
	@echo "🔨 Compilando website..."
	@cd $(FRONT_WEBSITE_DIR) && pnpm build

install-website: ## Instalar dependencias del website
	@echo "📦 Instalando dependencias del website..."
	@cd $(FRONT_WEBSITE_DIR) && pnpm install

# ============================================
# FULL STACK - COMANDOS COMBINADOS
# ============================================
run-all: ## Ejecutar TODOS los servicios (Backend + Frontend + Website)
	@echo "🚀 Iniciando TODOS los servicios..."
	@echo ""
	@echo "┌─────────────────────────────────────────────────────────────┐"
	@echo "│  🔧 INSTRUCCIONES:                                          │"
	@echo "│  1. Ctrl+C para detener este mensaje                        │"
	@echo "│  2. Abre 3 terminales diferentes                            │"
	@echo "│  3. Terminal 1: make run-centralback                        │"
	@echo "│  4. Terminal 2: make run-centralfront                       │"
	@echo "│  5. Terminal 3: make run-website                            │"
	@echo "│                                                              │"
	@echo "│  📋 Servicios disponibles:                                  │"
	@echo "│    - Backend API:    http://localhost:3050                  │"
	@echo "│    - Swagger Docs:   http://localhost:3050/docs             │"
	@echo "│    - Frontend:       http://localhost:3000                  │"
	@echo "│    - Website:        http://localhost:4321                  │"
	@echo "└─────────────────────────────────────────────────────────────┘"
	@echo ""
	@echo "⚠️  Nota: Los servicios deben ejecutarse en terminales separadas"
	@echo "          para poder ver los logs de cada uno individualmente."
	@echo ""

stop-all: ## Detener todos los servicios
	@echo "🛑 Deteniendo todos los servicios..."
	@pkill -f "go run ./cmd/main.go" || echo "  ✓ Backend detenido"
	@pkill -f "next dev" || echo "  ✓ Frontend central detenido"
	@pkill -f "astro dev" || echo "  ✓ Website detenido"
	@cd $(BACK_CENTRAL_DIR) && make podman-stop
	@echo "✅ Todos los servicios detenidos"

health-check: ## Verificar salud de todos los servicios
	@echo "🏥 Verificando salud de servicios..."
	@echo ""
	@echo "Backend API (3050):"
	@curl -f http://localhost:3050/health 2>/dev/null && echo "  ✅ OK" || echo "  ❌ No responde"
	@echo ""
	@echo "Frontend (3000):"
	@curl -f http://localhost:3000 2>/dev/null > /dev/null && echo "  ✅ OK" || echo "  ❌ No responde"
	@echo ""
	@echo "Website (4321):"
	@curl -f http://localhost:4321 2>/dev/null > /dev/null && echo "  ✅ OK" || echo "  ❌ No responde"
	@echo ""

clean-all: ## Limpiar TODOS los archivos generados
	@echo "🧹 Limpieza completa del proyecto..."
	@cd $(BACK_CENTRAL_DIR) && make clean
	@cd $(FRONT_CENTRAL_DIR) && pnpm clean || true
	@echo "✅ Limpieza completa"

# ============================================
# UTILIDADES
# ============================================
install-all: ## Instalar dependencias de TODOS los proyectos
	@echo "📦 Instalando dependencias de todos los proyectos..."
	@echo ""
	@echo "Backend central-reserve:"
	@cd $(BACK_CENTRAL_DIR) && make deps
	@echo ""
	@echo "Backend dbpostgres:"
	@cd $(BACK_DBPOSTGRES_DIR) && go mod tidy
	@echo ""
	@echo "Frontend rupu-central:"
	@cd $(FRONT_CENTRAL_DIR) && pnpm install
	@echo ""
	@echo "Website:"
	@cd $(FRONT_WEBSITE_DIR) && pnpm install
	@echo ""
	@echo "✅ Todas las dependencias instaladas"

info: ## Mostrar información del sistema
	@echo "📊 Información del Sistema:"
	@echo "  - Go version:     $(shell go version 2>/dev/null || echo 'No instalado')"
	@echo "  - Node version:   $(shell node --version 2>/dev/null || echo 'No instalado')"
	@echo "  - pnpm version:   $(shell pnpm --version 2>/dev/null || echo 'No instalado')"
	@echo "  - Podman version: $(shell podman --version 2>/dev/null || echo 'No instalado')"
	@echo ""
	@echo "📂 Estructura del proyecto:"
	@echo "  - Backend:        $(BACK_CENTRAL_DIR)"
	@echo "  - Migraciones:    $(BACK_DBPOSTGRES_DIR)"
	@echo "  - Frontend:       $(FRONT_CENTRAL_DIR)"
	@echo "  - Website:        $(FRONT_WEBSITE_DIR)"

# ============================================
# DESARROLLO RÁPIDO
# ============================================
dev-back: run-centralback ## Alias corto: ejecutar solo backend

dev-front: run-centralfront ## Alias corto: ejecutar solo frontend

dev-full: ## Alias corto: instrucciones para ejecutar todo
	@make run-all
