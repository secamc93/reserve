# Módulo Visit - Arquitectura Hexagonal

## Resumen de la Refactorización

Este módulo ha sido completamente refactorizado siguiendo los principios de **Arquitectura Hexagonal (Ports and Adapters)**, separando claramente las responsabilidades en capas bien definidas.

---

## Estructura del Proyecto

```
modules/visit/
├── internal/
│   ├── domain/                          # 🔵 CAPA DE DOMINIO (Núcleo)
│   │   ├── entities.go                  # Entidades de dominio puras
│   │   ├── errors.go                    # Errores de dominio
│   │   └── ports.go                     # Interfaces (contratos)
│   │
│   ├── application/                     # 🟢 CAPA DE APLICACIÓN
│   │   ├── dtos.go                      # Data Transfer Objects
│   │   └── usecases/                    # Casos de uso
│   │       ├── visitor_usecases.go      # Lógica de visitantes
│   │       ├── visit_usecases.go        # Lógica de visitas
│   │       ├── catalog_usecases.go      # Lógica de catálogos
│   │       ├── auth_usecases.go         # Lógica de autenticación
│   │       └── database_usecases.go     # Lógica de consultas BD
│   │
│   └── infrastructure/                  # 🟡 CAPA DE INFRAESTRUCTURA
│       └── adapters/
│           ├── primary/                 # Adaptadores de entrada (CLI)
│           │   └── cli/
│           │       ├── visitor_handlers.go
│           │       ├── visit_handlers.go
│           │       ├── catalog_handlers.go
│           │       ├── database_handlers.go
│           │       ├── menu_handlers.go
│           │       └── state_manager.go
│           │
│           └── secondary/               # Adaptadores de salida (API, BD)
│               ├── visit_api_adapter.go
│               ├── auth_adapter.go
│               └── database_adapter.go
│
├── bundle.go                            # Orquestador principal (DI Container)
├── go.mod
└── go.sum
```

---

## Flujo de Dependencias

La arquitectura sigue estrictamente la **Regla de Dependencia**:

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  ADAPTADORES PRIMARIOS (CLI)                       │
│  ↓ Depende de ↓                                    │
│                                                     │
│  CASOS DE USO (Application)                        │
│  ↓ Depende de ↓                                    │
│                                                     │
│  DOMINIO (Entities, Ports, Errors)                 │
│  ↑ Implementado por ↑                              │
│                                                     │
│  ADAPTADORES SECUNDARIOS (API Client, BD)          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Principios Cumplidos

✅ **Domain NO depende de Infrastructure** (regla fundamental)
✅ **Application solo depende de Domain**
✅ **Infrastructure implementa las interfaces del Domain**
✅ **Inversión de Dependencias**: Interfaces definidas por el dominio

---

## Capas y Responsabilidades

### 🔵 Capa de Dominio (`internal/domain/`)

**Responsabilidad**: Contiene la lógica de negocio pura, sin dependencias externas.

#### `entities.go`
- **Qué**: Entidades de dominio (`Visitor`, `Visit`, `Companion`, `Asset`, etc.)
- **Sin**: Tags de ORM, dependencias de frameworks
- **Solo**: Tipos primitivos de Go y otros tipos de dominio

#### `errors.go`
- **Qué**: Errores específicos del dominio
- **Ejemplo**: `ErrVisitorNotFound`, `ErrAuthenticationFailed`

#### `ports.go`
- **Qué**: Interfaces que definen contratos
- **Ports**: `VisitAPIPort`, `AuthPort`, `DatabasePort`
- **Regla**: Usan tipos de dominio, NO tipos de infraestructura

---

### 🟢 Capa de Aplicación (`internal/application/`)

**Responsabilidad**: Orquesta casos de uso del negocio.

#### `dtos.go`
- Data Transfer Objects para comunicación entre capas
- Ejemplo: `CreateVisitorDTO`, `CreateVisitDTO`

#### `usecases/`
- **visitor_usecases.go**: Crear visitante, buscar por DNI
- **visit_usecases.go**: CRUD de visitas, entrada/salida, acompañantes
- **catalog_usecases.go**: Tipos y estados de visita
- **auth_usecases.go**: Login, obtener tokens, listar negocios
- **database_usecases.go**: Consultas directas a BD

**Característica clave**: Solo depende de `domain/`, NO de `infrastructure/`

---

### 🟡 Capa de Infraestructura (`internal/infrastructure/`)

**Responsabilidad**: Implementa adaptadores que conectan el dominio con el mundo exterior.

#### Adaptadores Primarios (Entrada) - `adapters/primary/cli/`

Manejan la interacción con el usuario vía CLI:

- **visitor_handlers.go**: Menús para crear/buscar visitantes
- **visit_handlers.go**: Menús para gestión de visitas
- **catalog_handlers.go**: Menús de catálogos
- **database_handlers.go**: Menús de consultas BD
- **menu_handlers.go**: Orquestador de menús
- **state_manager.go**: Gestión de estado de sesión (IDs)

#### Adaptadores Secundarios (Salida) - `adapters/secondary/`

Implementan los Ports del dominio:

- **visit_api_adapter.go**: Implementa `VisitAPIPort`
  - Usa `shared.HTTPClient` para llamadas a la API REST
  - Convierte respuestas JSON a entidades de dominio

- **auth_adapter.go**: Implementa `AuthPort`
  - Maneja autenticación y tokens
  - Usa funciones de `shared` package

- **database_adapter.go**: Implementa `DatabasePort`
  - Consultas directas a PostgreSQL vía `shared.TestDatabase`
  - Usa GORM SOLO en esta capa

---

## Inyección de Dependencias

El archivo `bundle.go` actúa como **Composition Root** (DI Container):

```go
// 1. Crear adaptadores secundarios (implementan Ports)
visitAPIAdapter := secondary.NewVisitAPIAdapter(client)
authAdapter := secondary.NewAuthAdapter(client)
databaseAdapter := secondary.NewDatabaseAdapter(db)

// 2. Inyectar adaptadores en casos de uso
visitorUC := usecases.NewVisitorUseCases(visitAPIAdapter)
visitUC := usecases.NewVisitUseCases(visitAPIAdapter)
authUC := usecases.NewAuthUseCases(authAdapter)
databaseUC := usecases.NewDatabaseUseCases(databaseAdapter)

// 3. Inyectar casos de uso en handlers CLI
visitorHandlers := cli.NewVisitorHandlers(visitorUC, stateManager)
visitHandlers := cli.NewVisitHandlers(visitUC, stateManager)
```

---

## Ventajas de la Arquitectura Actual

### 1. Testabilidad
- Los casos de uso se pueden testear con mocks de los Ports
- No se requiere servidor HTTP ni BD para tests unitarios

### 2. Mantenibilidad
- Cambios en la API REST solo afectan `visit_api_adapter.go`
- Cambios en CLI solo afectan `adapters/primary/cli/`
- El dominio permanece intacto

### 3. Extensibilidad
- Se puede agregar un adaptador HTTP (REST API) sin modificar casos de uso
- Se puede reemplazar PostgreSQL por MongoDB cambiando solo `database_adapter.go`
- Se puede agregar un adaptador gRPC manteniendo la misma lógica

### 4. Separación de Responsabilidades
- **Domain**: "QUÉ hace el sistema" (reglas de negocio)
- **Application**: "CÓMO se orquestan las operaciones"
- **Infrastructure**: "CON QUÉ tecnologías se implementa"

---

## Ejemplo de Flujo Completo

**Caso de Uso**: Crear un visitante desde CLI

```
1. Usuario interactúa con CLI
   ↓
2. cli/visitor_handlers.go captura entrada
   ↓
3. Crea CreateVisitorDTO
   ↓
4. Llama a visitorUC.CreateVisitor(ctx, dto)
   ↓
5. Caso de uso convierte DTO a entidad domain.Visitor
   ↓
6. Llama a visitAPIPort.CreateVisitor(ctx, visitor)
   ↓
7. visit_api_adapter.go implementa el port
   ↓
8. Hace POST a /horizontal-properties/visits/visitors
   ↓
9. Convierte respuesta JSON a domain.Visitor
   ↓
10. Devuelve entidad de dominio
    ↓
11. Handler CLI actualiza StateManager y muestra mensaje
```

**Flujo de Dependencias**:
```
CLI Handler → Use Case → Domain Port → API Adapter → HTTP Client
     ↑                                        ↓
     └────────── domain.Visitor ──────────────┘
```

---

## Validación de Arquitectura Hexagonal

### ✅ Cumplimientos

1. **Domain no importa Infrastructure** ✓
   - `domain/` solo usa tipos primitivos de Go
   - No hay `import "gorm"`, `import "net/http"`, etc.

2. **Application solo depende de Domain** ✓
   - `application/` solo importa `internal/domain`
   - No conoce detalles de HTTP, BD, CLI

3. **Infrastructure implementa Ports del Domain** ✓
   - `visit_api_adapter.go` implementa `VisitAPIPort`
   - `auth_adapter.go` implementa `AuthPort`
   - `database_adapter.go` implementa `DatabasePort`

4. **Inversión de Dependencias** ✓
   - Las interfaces están en `domain/ports.go`
   - Las implementaciones están en `infrastructure/`

5. **Inyección de Dependencias** ✓
   - `bundle.go` crea e inyecta dependencias
   - No hay singletons globales

---

## Comparación: Antes vs Después

### ❌ ANTES (Arquitectura Monolítica)

```go
// handlers.go
func (b *Bundle) createVisitor() error {
    // 1. Leer input de CLI
    // 2. Hacer POST directo con b.client
    // 3. Parsear JSON inline
    // 4. Actualizar estado
    resp, err := b.client.POST("/api/...", request)
    // Todo mezclado en un solo método
}
```

**Problemas**:
- CLI, lógica de negocio y HTTP mezclados
- Imposible testear sin servidor HTTP
- Difícil de mantener y extender
- Violación de Single Responsibility

### ✅ DESPUÉS (Arquitectura Hexagonal)

```go
// cli/visitor_handlers.go
func (h *VisitorHandlers) CreateVisitor() error {
    // Solo responsabilidad: capturar input CLI
    dto := application.CreateVisitorDTO{...}
    visitor, err := h.visitorUC.CreateVisitor(ctx, dto)
    // Solo responsabilidad: mostrar resultado
}

// usecases/visitor_usecases.go
func (uc *VisitorUseCases) CreateVisitor(ctx, dto) (*Visitor, error) {
    // Solo responsabilidad: orquestar lógica de negocio
    visitor := domain.Visitor{...}
    return uc.visitAPI.CreateVisitor(ctx, visitor)
}

// secondary/visit_api_adapter.go
func (a *VisitAPIAdapter) CreateVisitor(ctx, visitor) (*Visitor, error) {
    // Solo responsabilidad: comunicación HTTP
    resp, err := a.client.POST("/api/...", request)
    // Convertir JSON a domain.Visitor
}
```

**Beneficios**:
- Cada capa tiene una responsabilidad clara
- Testeable con mocks
- Fácil de extender (agregar API REST sin cambiar lógica)

---

## Pruebas Sugeridas

### Tests Unitarios (Use Cases)

```go
func TestCreateVisitor(t *testing.T) {
    // Mock del Port
    mockAPI := &MockVisitAPIPort{
        CreateVisitorFunc: func(ctx, v) (*Visitor, error) {
            return &Visitor{ID: 123}, nil
        },
    }

    // Caso de uso con mock inyectado
    uc := usecases.NewVisitorUseCases(mockAPI)

    // Test sin servidor HTTP
    visitor, err := uc.CreateVisitor(ctx, dto)
    assert.NoError(t, err)
    assert.Equal(t, uint(123), visitor.ID)
}
```

### Tests de Integración (Adapters)

```go
func TestVisitAPIAdapter_CreateVisitor(t *testing.T) {
    // Servidor HTTP de prueba
    server := httptest.NewServer(...)
    client := shared.NewHTTPClient()

    adapter := secondary.NewVisitAPIAdapter(client)

    visitor, err := adapter.CreateVisitor(ctx, domain.Visitor{...})
    assert.NoError(t, err)
}
```

---

## Próximos Pasos Sugeridos

1. **Agregar Tests**
   - Tests unitarios de casos de uso
   - Tests de integración de adaptadores
   - Mocks de Ports para testing

2. **Agregar Validaciones**
   - Validar DTOs en la capa de aplicación
   - Reglas de negocio en entidades de dominio

3. **Mejorar Manejo de Errores**
   - Wrapping de errores con contexto
   - Logging estructurado por capa

4. **Documentación**
   - Documentar cada caso de uso
   - Diagramas de flujo

---

## Referencias

- [Hexagonal Architecture (Alistair Cockburn)](https://alistair.cockburn.us/hexagonal-architecture/)
- [Clean Architecture (Robert C. Martin)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Dependency Inversion Principle](https://en.wikipedia.org/wiki/Dependency_inversion_principle)

---

## Conclusión

Este módulo ahora sigue las mejores prácticas de **Arquitectura Hexagonal**, con:

- ✅ Dominio puro y agnóstico a frameworks
- ✅ Casos de uso reutilizables y testables
- ✅ Adaptadores intercambiables (API, BD, CLI)
- ✅ Inversión de dependencias correcta
- ✅ Inyección de dependencias explícita

**El código es ahora más mantenible, testable y extensible.**
