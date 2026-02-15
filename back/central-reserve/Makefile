# Makefile para Central Reserve Backend
# Uso: make [comando]

.PHONY: help build run test clean podman-build podman-dev podman-prod podman-stop podman-logs

# Variables
APP_NAME=central_reserve
PODMAN_IMAGE=central-reserve
PODMAN_TAG=latest

# Comandos principales
help: ## Mostrar esta ayuda
	@echo "Comandos disponibles:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Desarrollo local
build: ## Compilar la aplicación
	go build -o bin/$(APP_NAME) ./cmd/main.go

run: ## Ejecutar la aplicación localmente
	go run ./cmd/main.go

test: ## Ejecutar todos los tests
	@echo "🧪 Ejecutando tests..."
	go test ./... -v

test-short: ## Ejecutar tests rápidos (sin integración)
	@echo "🧪 Ejecutando tests cortos..."
	go test ./... -short -v

test-coverage: ## Ejecutar tests con coverage
	@echo "🧪 Ejecutando tests con coverage..."
	go test ./... -coverprofile=coverage.out -covermode=atomic
	@echo "📊 Generando reporte HTML..."
	go tool cover -html=coverage.out -o coverage.html
	@echo "✅ Reporte generado en coverage.html"

test-coverage-summary: ## Mostrar resumen de coverage
	@echo "🧪 Ejecutando tests con coverage..."
	@go test ./... -coverprofile=coverage.out -covermode=atomic > /dev/null 2>&1
	@echo "\n📊 Resumen de Coverage:"
	@go tool cover -func=coverage.out | tail -n 1
	@echo "\n📁 Coverage por paquete:"
	@go tool cover -func=coverage.out | grep -E "^.*\.go:" | awk '{print $$1, $$3}' | sed 's|/[^/]*\.go:||' | awk '{coverage[$$1]+=$$2; count[$$1]++} END {for (pkg in coverage) printf "  %-60s %6.1f%%\n", pkg, coverage[pkg]/count[pkg]}' | sort

test-coverage-html: ## Abrir reporte de coverage en navegador
	@echo "🧪 Generando coverage y abriendo en navegador..."
	@make test-coverage > /dev/null 2>&1
	@xdg-open coverage.html 2>/dev/null || open coverage.html 2>/dev/null || echo "⚠️  Abre manualmente: coverage.html"

test-module: ## Ejecutar tests de un módulo específico (uso: make test-module MODULE=auth)
	@if [ -z "$(MODULE)" ]; then \
		echo "❌ Error: Debes especificar MODULE=nombre"; \
		echo "Ejemplo: make test-module MODULE=auth"; \
		exit 1; \
	fi
	@echo "🧪 Ejecutando tests del módulo $(MODULE)..."
	@go test ./services/auth/$(MODULE)/... -v -coverprofile=coverage-$(MODULE).out
	@echo "📊 Coverage del módulo $(MODULE):"
	@go tool cover -func=coverage-$(MODULE).out | tail -n 1

test-integration: ## Ejecutar solo tests de integración
	@echo "🧪 Ejecutando tests de integración..."
	go test ./... -run Integration -v

test-unit: ## Ejecutar solo tests unitarios
	@echo "🧪 Ejecutando tests unitarios..."
	go test ./... -short -v

test-race: ## Ejecutar tests con detector de race conditions
	@echo "🧪 Ejecutando tests con race detector..."
	go test ./... -race -v

test-bench: ## Ejecutar benchmarks
	@echo "🧪 Ejecutando benchmarks..."
	go test ./... -bench=. -benchmem

test-clean: ## Limpiar archivos de coverage
	@echo "🧹 Limpiando archivos de coverage..."
	rm -f coverage.out coverage.html coverage-*.out
	@echo "✅ Archivos de coverage eliminados"

# Tests por servicio
test-auth: ## Ejecutar tests del módulo auth
	@echo "🧪 Tests: Auth..."
	@go test ./services/auth/... -v -coverprofile=coverage-auth.out
	@go tool cover -func=coverage-auth.out | tail -n 1

test-horizontalproperty: ## Ejecutar tests de todos los módulos horizontalproperty
	@echo "🧪 Tests: Horizontal Property (todos los módulos)..."
	@go test ./services/horizontalproperty/... -v -coverprofile=coverage-hp.out
	@echo "📊 Coverage total:"
	@go tool cover -func=coverage-hp.out | tail -n 1

test-hp-attendance: ## Tests: attendance
	@echo "🧪 Tests: Attendance..."
	@go test ./services/horizontalproperty/attendance/... -v -coverprofile=coverage-attendance.out
	@go tool cover -func=coverage-attendance.out 2>/dev/null | tail -n 1 || echo "Sin tests"

test-hp-commonarea: ## Tests: commonarea
	@echo "🧪 Tests: Common Area..."
	@go test ./services/horizontalproperty/commonarea/... -v -coverprofile=coverage-commonarea.out
	@go tool cover -func=coverage-commonarea.out 2>/dev/null | tail -n 1 || echo "Sin tests"

test-hp-dashboard: ## Tests: dashboard
	@echo "🧪 Tests: Dashboard..."
	@go test ./services/horizontalproperty/dashboard/... -v -coverprofile=coverage-dashboard.out
	@go tool cover -func=coverage-dashboard.out 2>/dev/null | tail -n 1 || echo "Sin tests"

test-hp-packages: ## Tests: packages
	@echo "🧪 Tests: Packages..."
	@go test ./services/horizontalproperty/packages/... -v -coverprofile=coverage-packages.out
	@go tool cover -func=coverage-packages.out 2>/dev/null | tail -n 1 || echo "Sin tests"

test-hp-parking: ## Tests: parking
	@echo "🧪 Tests: Parking..."
	@go test ./services/horizontalproperty/parking/... -v -coverprofile=coverage-parking.out
	@go tool cover -func=coverage-parking.out 2>/dev/null | tail -n 1 || echo "Sin tests"

test-hp-resident: ## Tests: resident
	@echo "🧪 Tests: Resident..."
	@go test ./services/horizontalproperty/resident/... -v -coverprofile=coverage-resident.out
	@go tool cover -func=coverage-resident.out 2>/dev/null | tail -n 1 || echo "Sin tests"

test-hp-security: ## Tests: security
	@echo "🧪 Tests: Security..."
	@go test ./services/horizontalproperty/security/... -v -coverprofile=coverage-security.out
	@go tool cover -func=coverage-security.out 2>/dev/null | tail -n 1 || echo "Sin tests"

test-hp-unit: ## Tests: unit
	@echo "🧪 Tests: Unit..."
	@go test ./services/horizontalproperty/unit/... -v -coverprofile=coverage-unit.out
	@go tool cover -func=coverage-unit.out 2>/dev/null | tail -n 1 || echo "Sin tests"

test-hp-visit: ## Tests: visit
	@echo "🧪 Tests: Visit..."
	@go test ./services/horizontalproperty/visit/... -v -coverprofile=coverage-visit.out
	@go tool cover -func=coverage-visit.out 2>/dev/null | tail -n 1 || echo "Sin tests"

test-hp-vote: ## Tests: vote
	@echo "🧪 Tests: Vote..."
	@go test ./services/horizontalproperty/vote/... -v -coverprofile=coverage-vote.out
	@go tool cover -func=coverage-vote.out 2>/dev/null | tail -n 1 || echo "Sin tests"

test-hp-wallnews: ## Tests: wallnews
	@echo "🧪 Tests: Wall News..."
	@go test ./services/horizontalproperty/wallnews/... -v -coverprofile=coverage-wallnews.out
	@go tool cover -func=coverage-wallnews.out 2>/dev/null | tail -n 1 || echo "Sin tests"

test-all-modules: ## Ejecutar tests de todos los módulos con reporte individual
	@echo "🧪 Ejecutando tests de TODOS los módulos...\n"
	@make test-auth
	@echo ""
	@make test-hp-attendance
	@make test-hp-commonarea
	@make test-hp-dashboard
	@make test-hp-packages
	@make test-hp-parking
	@make test-hp-resident
	@make test-hp-security
	@make test-hp-unit
	@make test-hp-visit
	@make test-hp-vote
	@make test-hp-wallnews
	@echo "\n✅ Tests completados para todos los módulos"

coverage-report: ## Generar reporte detallado de coverage para todos los módulos
	@./scripts/coverage-report.sh

coverage-report-module: ## Generar reporte de coverage para un módulo (uso: make coverage-report-module MODULE=auth)
	@if [ -z "$(MODULE)" ]; then \
		echo "❌ Error: Debes especificar MODULE=nombre"; \
		echo "Ejemplo: make coverage-report-module MODULE=auth"; \
		exit 1; \
	fi
	@./scripts/coverage-report.sh $(MODULE)

clean: ## Limpiar archivos generados
	rm -rf bin/
	rm -f coverage.out coverage.html coverage-*.out
	go clean

# Podman
podman-build: ## Construir imagen Podman
	podman build -f docker/Dockerfile -t $(PODMAN_IMAGE):$(PODMAN_TAG) .

podman-dev: ## Levantar entorno de desarrollo con Podman
	@echo "🚀 Levantando entorno de desarrollo..."
	cd docker && podman-compose -f docker-compose.dev.yml up -d
	@echo "✅ Entorno listo!"
	@echo "📋 Servicios disponibles:"
	@echo "  - API: http://localhost:3050"
	@echo "  - Swagger: http://localhost:3050/docs"
	@echo "  - NATS Dashboard: http://localhost:8111"
	@echo "  - Adminer: http://localhost:8080"

podman-prod: ## Levantar entorno de producción con Podman
	@echo "🚀 Levantando entorno de producción..."
	cd docker && podman-compose -f docker-compose.prod.yml up -d
	@echo "✅ Entorno de producción listo!"

podman-stop: ## Detener contenedores Podman
	@echo "🛑 Deteniendo contenedores..."
	cd docker && podman-compose -f docker-compose.dev.yml down
	cd docker && podman-compose -f docker-compose.prod.yml down

podman-logs: ## Ver logs de la aplicación
	cd docker && podman-compose -f docker-compose.dev.yml logs -f central_reserve

podman-logs-all: ## Ver logs de todos los servicios
	cd docker && podman-compose -f docker-compose.dev.yml logs -f

# Scripts automatizados
build-and-run: ## Build y ejecutar con script automatizado
	./scripts/build-podman.sh dev

build-prod: ## Build para producción
	./scripts/build-podman.sh prod

# Utilidades
deps: ## Instalar dependencias
	go mod tidy
	go mod download

docs: ## Generar documentación completa (todos los módulos)
	swag init -g ./cmd/main.go --output ./shared/docs --parseDependency --parseInternal --exclude services/reserve --exclude services/restaurants

docs-auth: ## Generar documentación solo para módulo Auth (detecta entorno automáticamente)
	@./scripts/generate-swagger.sh auth

docs-properties: ## Generar documentación solo para módulo Properties (detecta entorno automáticamente)
	@./scripts/generate-swagger.sh properties

docs-all: ## Generar documentación separada para ambos módulos (detecta entorno automáticamente)
	@./scripts/generate-swagger.sh all

# Base de datos
db-migrate: ## Ejecutar migraciones de base de datos
	@echo "📊 Ejecutando migraciones..."
	# Aquí puedes agregar comandos para migraciones si las tienes

db-reset: ## Resetear base de datos (¡CUIDADO!)
	@echo "⚠️  Reseteando base de datos..."
	cd docker && podman-compose -f docker-compose.dev.yml down -v
	cd docker && podman-compose -f docker-compose.dev.yml up -d postgres

# Email testing
test-email: ## Probar envío de emails
	go run examples/email-starttls-test.go

# Health check
health: ## Verificar salud de los servicios
	@echo "🏥 Verificando salud de servicios..."
	@curl -f http://localhost:3050/health || echo "❌ API no responde"
	@curl -f http://localhost:8111 || echo "❌ NATS Dashboard no responde"

# Limpieza completa
clean-all: ## Limpieza completa (Podman + binarios)
	@echo "🧹 Limpieza completa..."
	make clean
	make podman-stop
	podman system prune -f
	podman volume prune -f

# Información del sistema
info: ## Mostrar información del sistema
	@echo "📊 Información del sistema:"
	@echo "  - Go version: $(shell go version)"
	@echo "  - Podman version: $(shell podman --version)"
	@echo "  - Podman Compose version: $(shell podman-compose --version)"
	@echo "  - Contenedores activos:"
	@podman ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "(central_reserve|postgres|redis|nats)" || echo "  No hay contenedores activos" 