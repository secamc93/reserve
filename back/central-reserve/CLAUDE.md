   # Central Reserve Backend - Guía para Claude Code

## Comandos Principales

### Build & Run
- `make build` - Compilar: `go build -o bin/central_reserve ./cmd/main.go`
- `make run` - Ejecutar: `go run ./cmd/main.go`
- `make test` - Tests: `go test ./...`
- `make deps` - Dependencias: `go mod tidy && go mod download`

### Docker/Podman
- `make podman-dev` - Levantar entorno desarrollo
- `make podman-build` - Build imagen
- `make podman-logs` - Ver logs

### Documentación
- `make docs` - Generar Swagger completo
- `make docs-auth` - Solo Auth API
- `make docs-properties` - Solo Properties API

### Testing & Coverage
- `make test` - Ejecutar todos los tests
- `make test-coverage` - Tests con reporte HTML
- `make test-coverage-summary` - Resumen en terminal
- `make coverage-report` - Reportes detallados por módulo
- Ver [README.md - Testing](README.md#🧪-testing--coverage) para quick start
- Ver [TESTING.md](TESTING.md) para documentación completa

## Protocolo de Planeación

Antes de escribir cualquier código, DEBES seguir estos pasos:

1. **Análisis de Impacto**:
   - Identifica qué archivos se verán afectados
   - Si un cambio en módulo A afecta al módulo B, propón una abstracción (puerto/interfaz)
   - Revisa las dependencias en `internal/domain/ports.go`

2. **Draft de Diseño**:
   - Describe el cambio en términos de Arquitectura Hexagonal
   - Especifica: ¿es domain, app, o infra?
   - Si creas una interfaz nueva, va en `domain/ports.go`

3. **Validación**:
   - Espera confirmación "GO" antes de editar archivos
   - Asegúrate de no romper contratos existentes

## Documentación Adicional
- Ver arquitectura: `.claude/architecture.md`
- Ver estándares Go: `.claude/standards.md`

## Variables de Entorno Requeridas
Ver `.env.example` para lista completa. Principales:
- `APP_ENV` - development/production
- `HTTP_PORT` - Puerto API (3050)
- `DB_*` - Configuración PostgreSQL
- `JWT_SECRET` - Secret para tokens
