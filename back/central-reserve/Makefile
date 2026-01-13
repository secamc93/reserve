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

test: ## Ejecutar tests
	go test ./...

clean: ## Limpiar archivos generados
	rm -rf bin/
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