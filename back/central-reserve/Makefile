# Makefile para Central Reserve Backend
# Uso: make [comando]

.PHONY: help build run test clean docker-build docker-dev docker-prod docker-stop docker-logs

# Variables
APP_NAME=central_reserve
DOCKER_IMAGE=central-reserve
DOCKER_TAG=latest

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

# Docker
docker-build: ## Construir imagen Docker
	docker build -f docker/Dockerfile -t $(DOCKER_IMAGE):$(DOCKER_TAG) .

docker-dev: ## Levantar entorno de desarrollo con Docker
	@echo "🚀 Levantando entorno de desarrollo..."
	cd docker && docker-compose -f docker-compose.dev.yml up -d
	@echo "✅ Entorno listo!"
	@echo "📋 Servicios disponibles:"
	@echo "  - API: http://localhost:3050"
	@echo "  - Swagger: http://localhost:3050/docs"
	@echo "  - NATS Dashboard: http://localhost:8111"
	@echo "  - Adminer: http://localhost:8080"

docker-prod: ## Levantar entorno de producción con Docker
	@echo "🚀 Levantando entorno de producción..."
	cd docker && docker-compose -f docker-compose.prod.yml up -d
	@echo "✅ Entorno de producción listo!"

docker-stop: ## Detener contenedores Docker
	@echo "🛑 Deteniendo contenedores..."
	cd docker && docker-compose -f docker-compose.dev.yml down
	cd docker && docker-compose -f docker-compose.prod.yml down

docker-logs: ## Ver logs de la aplicación
	cd docker && docker-compose -f docker-compose.dev.yml logs -f central_reserve

docker-logs-all: ## Ver logs de todos los servicios
	cd docker && docker-compose -f docker-compose.dev.yml logs -f

# Scripts automatizados
build-and-run: ## Build y ejecutar con script automatizado
	./scripts/build-docker.sh dev

build-prod: ## Build para producción
	./scripts/build-docker.sh prod

# Utilidades
deps: ## Instalar dependencias
	go mod tidy
	go mod download

docs: ## Generar documentación
	swag init -g ./cmd/main.go --output ./shared/docs --parseDependency --parseInternal --exclude services/reserve

# Base de datos
db-migrate: ## Ejecutar migraciones de base de datos
	@echo "📊 Ejecutando migraciones..."
	# Aquí puedes agregar comandos para migraciones si las tienes

db-reset: ## Resetear base de datos (¡CUIDADO!)
	@echo "⚠️  Reseteando base de datos..."
	cd docker && docker-compose -f docker-compose.dev.yml down -v
	cd docker && docker-compose -f docker-compose.dev.yml up -d postgres

# Email testing
test-email: ## Probar envío de emails
	go run examples/email-starttls-test.go

# Health check
health: ## Verificar salud de los servicios
	@echo "🏥 Verificando salud de servicios..."
	@curl -f http://localhost:3050/health || echo "❌ API no responde"
	@curl -f http://localhost:8111 || echo "❌ NATS Dashboard no responde"

# Limpieza completa
clean-all: ## Limpieza completa (Docker + binarios)
	@echo "🧹 Limpieza completa..."
	make clean
	make docker-stop
	docker system prune -f
	docker volume prune -f

# Información del sistema
info: ## Mostrar información del sistema
	@echo "📊 Información del sistema:"
	@echo "  - Go version: $(shell go version)"
	@echo "  - Docker version: $(shell docker --version)"
	@echo "  - Docker Compose version: $(shell docker-compose --version)"
	@echo "  - Contenedores activos:"
	@docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "(central_reserve|postgres|redis|nats)" || echo "  No hay contenedores activos" 