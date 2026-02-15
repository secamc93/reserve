# Reserve Testing - Arquitectura de Microservicios Nativos en Go

## Visión General

Este proyecto implementa una suite de testing modular usando **microservicios nativos de Go**, donde cada módulo es un paquete independiente que puede ser ejecutado como parte del proyecto principal o de forma autónoma.

## Estado Actual de Módulos

| Módulo | Estado | Fase | Archivos |
|--------|--------|------|----------|
| `visit` | Completo | Arquitectura Hexagonal | 19 archivos Go |
| `residents` | Pendiente | Estructura Base | 1 archivo |
| `unit` | Pendiente | Estructura Base | 1 archivo |

> Ver reportes detallados en `.claude/reports/`

## Arquitectura

### Principios de Diseño

1. **Arquitectura Hexagonal**: Dominio aislado, puertos e interfaces, adaptadores intercambiables
2. **Módulos Independientes**: Cada módulo en `modules/` es un paquete de Go con su propio `go.mod`
3. **Sin Dependencias Cruzadas**: Los módulos NO dependen entre sí
4. **Microservicios Nativos**: Cada módulo puede ejecutarse como servicio independiente o librería

### Estructura del Proyecto

```
reserve/back/testing/
├── go.mod                          # Módulo raíz
├── claude.md                       # Este archivo
├── .claude/
│   ├── settings.local.json
│   └── reports/                    # Reportes de estado por módulo
│       ├── visit-status.md
│       ├── residents-status.md
│       └── unit-status.md
├── cmd/
│   └── main.go                     # Orquestador principal
├── shared/                         # Infraestructura compartida
│   └── ...
└── modules/                        # Módulos independientes
    ├── visit/                      # Arquitectura hexagonal completa
    │   ├── go.mod
    │   ├── bundle.go
    │   └── internal/
    │       ├── app/usecases/       # Casos de uso
    │       ├── domain/             # Entidades, puertos, value objects
    │       └── infra/              # Adaptadores primarios y secundarios
    ├── residents/                  # Estructura base
    │   ├── go.mod
    │   └── bundle.go
    └── unit/                       # Estructura base
        ├── go.mod
        └── bundle.go
```

## Visión del Proyecto

### Fase Actual: CLI Testing Tool
- Herramienta de línea de comandos para testing de la API de Reserve
- Módulos independientes ejecutables via CLI
- Arquitectura hexagonal para testabilidad

### Fase Futura: Frontend Web

La arquitectura hexagonal actual facilita agregar un frontend web:

```
Frontend (Web) → API HTTP → Use Cases → Domain → API/DB Adapters
                    ↑
        Mismos Use Cases que el CLI actual
```

**Recomendaciones:**
- Agregar adaptador HTTP primario (junto al CLI existente)
- Next.js o similar para el frontend
- API REST que exponga los casos de uso existentes
- Dashboard para visualizar resultados de pruebas

**Ventaja clave:** Solo necesitas agregar un nuevo adaptador primario HTTP. Los casos de uso y dominio permanecen intactos.

## Uso

### Ejecutar desde el proyecto principal

```bash
# Todos los módulos
go run cmd/main.go

# Módulo específico
go run cmd/main.go -module visit
go run cmd/main.go -module residents

# Con verbose
go run cmd/main.go -module visit -v
```

### Ejecutar un módulo de forma independiente

```bash
cd modules/visit
go run cmd/main.go
```

### Tests

```bash
# Tests del proyecto completo
go test ./...

# Tests de un módulo específico
cd modules/visit
go test ./...
```

## Agregar Nuevo Módulo

1. Crear estructura de carpetas siguiendo el patrón de `visit`
2. Inicializar `go.mod` del módulo
3. Crear `bundle.go` como punto de entrada
4. Implementar capas: domain → app → infra
5. Registrar en `cmd/main.go`
6. Crear reporte en `.claude/reports/`

## Próximos Pasos

1. **visit**: Implementar tests unitarios y de integración
2. **residents**: Implementar arquitectura hexagonal (seguir patrón de visit)
3. **unit**: Implementar arquitectura hexagonal (seguir patrón de visit)
4. **Infraestructura**: Agregar adaptador HTTP para futura API web

## Notas Técnicas

- **Go Version**: 1.23.0
- **Arquitectura**: Hexagonal / Ports & Adapters
- **Sin Frameworks Pesados**: Go puro
- **Internal Package**: Código que NO debe ser importado externamente

## Reglas de Código

### Constructores
- **Siempre usar `New` como nombre del constructor**, no `NewNombreCompleto`
- Ejemplo correcto: `repository.New(db)`, `httpclient.New(client)`
- Ejemplo incorrecto: `repository.NewVisitRepository(db)`

### Base de Datos (GORM)
- **Siempre usar GORM con modelos**, nunca SQL directo
- Los modelos se importan de `dbpostgres/app/infra/models`
- Usar métodos de GORM: `Find()`, `First()`, `Create()`, `Where()`, `Count()`, etc.
- **Prohibido**: `Raw()`, `Exec()` con SQL directo
- Si necesitas una consulta compleja, usar múltiples queries GORM en lugar de SQL raw

### Estructura de Infraestructura
```
infrastructure/
├── primary/           # Adaptadores de entrada
│   └── cli/           # Handlers CLI
└── secondary/         # Adaptadores de salida
    ├── httpclient/    # Cliente HTTP para APIs externas
    └── repository/    # Repositorios de base de datos
```

### Modelos Compartidos
- Los modelos de BD se importan de `dbpostgres/app/infra/models`
- No inventar modelos locales, usar los existentes
- Cada módulo es independiente, puede tener sus propios métodos de BD
