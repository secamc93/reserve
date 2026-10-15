# Regla de Aislamiento de Repositorios

> **Aplicable a:** Backend (Go) - Todos los módulos

## 🎯 Principio Fundamental

**Los repositorios NO se comparten entre módulos.**

Si un módulo necesita consultar datos de tablas gestionadas por otro módulo, debe **replicar los métodos de consulta** en su propio repositorio.

---

## ❌ Incorrecto: Compartir Repositorios

```go
// ❌ MAL - bundle.go importando repositorios de otros módulos
import (
    "github.com/.../orderstatus"
    paymentstatusrepo "github.com/.../paymentstatus/infra/secondary/repository"
    fulfillmentstatusrepo "github.com/.../fulfillmentstatus/infra/secondary/repository"
)

func New(...) {
    // ❌ Instanciando repositorios externos
    orderStatusRepo := orderstatus.NewRepository(database, logger)
    paymentStatusRepo := paymentstatusrepo.New(database, logger)
    fulfillmentStatusRepo := fulfillmentstatusrepo.New(database, logger)

    // ❌ Pasando repositorios externos al use case
    orderMapping := usecaseordermapping.New(repo, logger, eventPublisher,
        orderStatusRepo, paymentStatusRepo, fulfillmentStatusRepo)
}
```

```go
// ❌ MAL - Use case dependiendo de interfaces de otros módulos
import (
    fulfillmentstatusports "github.com/.../fulfillmentstatus/domain"
    "github.com/.../orderstatus"
    paymentstatusports "github.com/.../paymentstatus/domain"
)

type UseCaseOrderMapping struct {
    repo                        ports.IRepository
    orderStatusRepository       orderstatus.IRepository         // ❌ Externo
    paymentStatusRepository     paymentstatusports.IRepository   // ❌ Externo
    fulfillmentStatusRepository fulfillmentstatusports.IRepository // ❌ Externo
}
```

---

## ✅ Correcto: Replicar Métodos de Consulta

### 1. Agregar Métodos a la Interfaz Local

```go
// ✅ CORRECTO - domain/ports/ports.go
type IRepository interface {
    // ... métodos existentes ...

    // ============================================
    // MÉTODOS DE CONSULTA A TABLAS DE ESTADOS
    // (Replicados localmente - no compartir repos)
    // ============================================

    // OrderStatuses - Consultas a la tabla order_statuses
    GetOrderStatusIDByIntegrationTypeAndOriginalStatus(ctx context.Context, integrationTypeID uint, originalStatus string) (*uint, error)

    // PaymentStatuses - Consultas a la tabla payment_statuses
    GetPaymentStatusIDByCode(ctx context.Context, code string) (*uint, error)

    // FulfillmentStatuses - Consultas a la tabla fulfillment_statuses
    GetFulfillmentStatusIDByCode(ctx context.Context, code string) (*uint, error)
}
```

### 2. Implementar en el Repositorio Local

```go
// ✅ CORRECTO - infra/secondary/repository/status_queries.go
package repository

func (r *Repository) GetOrderStatusIDByIntegrationTypeAndOriginalStatus(
    ctx context.Context,
    integrationTypeID uint,
    originalStatus string,
) (*uint, error) {
    var statusID *uint

    err := r.db.Conn(ctx).
        Table("order_statuses os").
        Select("os.id").
        Joins("INNER JOIN order_status_mappings osm ON os.id = osm.order_status_id").
        Where("osm.integration_type_id = ?", integrationTypeID).
        Where("osm.original_status = ?", originalStatus).
        Where("osm.deleted_at IS NULL").
        Limit(1).
        Scan(&statusID).Error

    if err == gorm.ErrRecordNotFound {
        return nil, nil // No encontrado, retornar nil sin error
    }

    return statusID, err
}

func (r *Repository) GetPaymentStatusIDByCode(ctx context.Context, code string) (*uint, error) {
    var result struct { ID uint }

    err := r.db.Conn(ctx).
        Table("payment_statuses").
        Select("id").
        Where("code = ?", code).
        Where("deleted_at IS NULL").
        Limit(1).
        First(&result).Error

    if err == gorm.ErrRecordNotFound {
        return nil, nil
    }

    return &result.ID, err
}
```

### 3. Usar Solo el Repositorio Local

```go
// ✅ CORRECTO - constructor.go
type UseCaseOrderMapping struct {
    repo           ports.IRepository  // ✅ Solo repositorio local
    logger         log.ILogger
    eventPublisher ports.IOrderEventPublisher
    scoreUseCase   ports.IOrderScoreUseCase
}

func New(repo ports.IRepository, logger log.ILogger, eventPublisher ports.IOrderEventPublisher) ports.IOrderMappingUseCase {
    return &UseCaseOrderMapping{
        repo:           repo,  // ✅ Solo repositorio local
        logger:         logger,
        eventPublisher: eventPublisher,
        scoreUseCase:   usecaseorderscore.New(repo),
    }
}
```

### 4. Bundle Limpio

```go
// ✅ CORRECTO - bundle.go
func New(router *gin.RouterGroup, database db.IDatabase, logger log.ILogger, ...) ports.IOrderMappingUseCase {
    // 1. Inicializar Repository
    // El repositorio incluye métodos de consulta a otras tablas replicados localmente
    repo := repository.New(database, environment)
    logger.Info(context.Background()).Msg("Order repository initialized")

    // 2. Inicializar Use Cases
    orderMapping := usecaseordermapping.New(repo, logger, eventPublisher)

    return orderMapping
}
```

---

## 📋 Tipos de Métodos a Replicar

### ✅ Sí Replicar (Solo CONSULTAS)

- `GetXXXByID()` - Obtener por ID
- `GetXXXByCode()` - Obtener por código
- `GetXXXByName()` - Obtener por nombre
- `FindXXXBy...()` - Búsquedas simples
- Consultas SELECT de solo lectura

**Características:**
- Solo lectura (SELECT)
- Devuelven datos existentes
- No modifican estado
- Queries simples y directas

### ❌ No Replicar (CRUD Fuerte)

- `CreateXXX()` - Crear registros
- `UpdateXXX()` - Actualizar registros
- `DeleteXXX()` - Eliminar registros
- Lógica de negocio compleja
- Validaciones específicas del módulo

**Razón:** La administración fuerte (CRUD) debe permanecer en el módulo dueño de esa tabla.

---

## 🎯 Beneficios

### 1. Módulos Independientes
- Cada módulo puede evolucionar sin afectar a otros
- No hay acoplamiento de interfaces entre módulos

### 2. Testeo Más Fácil
- Mock de un solo repositorio en lugar de múltiples
- Tests unitarios más simples

### 3. Compilación Independiente
- Los módulos no se rompen si otro módulo cambia su interfaz
- Menos dependencias en go.mod

### 4. Claridad de Responsabilidades
- Queda claro qué módulo es dueño de qué tabla
- Las consultas son explícitas y visibles

---

## 📝 Convenciones de Implementación

### Archivo Dedicado

Crear un archivo específico para métodos de consulta:

```
infra/secondary/repository/
├── repository.go           # Métodos principales
├── catalog_queries.go      # Consultas a catálogo (productos, clientes)
├── status_queries.go       # Consultas a estados (order_statuses, payment_statuses)
└── mappers/
    └── mapper.go
```

### Documentación Clara

```go
// ============================================
// MÉTODOS DE CONSULTA A TABLAS DE ESTADOS
// (Replicados localmente - no compartir repos)
// ============================================

// GetOrderStatusIDByIntegrationTypeAndOriginalStatus obtiene el ID de un estado de orden
// basado en el tipo de integración y el estado original de la plataforma.
//
// Tabla consultada: order_statuses (gestionada por módulo orderstatus)
// Replicado localmente para evitar compartir repositorios entre módulos
func (r *Repository) GetOrderStatusIDByIntegrationTypeAndOriginalStatus(...)
```

### Manejo de Errores

```go
// Retornar nil sin error cuando no se encuentra (no es error de negocio)
if err == gorm.ErrRecordNotFound {
    return nil, nil
}

// Retornar error solo para problemas reales (DB down, query inválida)
return nil, err
```

---

## ⚠️ Casos Especiales

### Si Necesitas Lógica Compleja de Otro Módulo

**Opción 1: Evento (Recomendado)**
```go
// Publicar evento y dejar que el otro módulo lo procese
eventPublisher.PublishEvent(ctx, &Event{
    Type: "order.created",
    Data: orderData,
})
```

**Opción 2: HTTP/gRPC (Para Módulos Separados)**
```go
// Cliente HTTP al API del otro módulo
client := http.NewClient()
resp, err := client.Get("/api/statuses/by-code?code=paid")
```

**❌ NO: Compartir Repositorio**
```go
// ❌ NUNCA hacer esto
statusRepo := othermodule.NewRepository()
status, err := statusRepo.GetByCode(ctx, "paid")
```

---

## 🔍 Checklist de Validación

Al finalizar, verificar:

- [ ] No hay imports de `*/infra/secondary/repository` de otros módulos
- [ ] No hay imports de `*/domain` de otros módulos (excepto shared)
- [ ] Use case solo recibe su propio repositorio
- [ ] Constructor del use case no tiene parámetros de repositorios externos
- [ ] Bundle no instancia repositorios de otros módulos
- [ ] Métodos replicados están documentados
- [ ] Métodos replicados solo hacen consultas (SELECT)

---

**Última actualización:** 2026-01-31
**Aplicado en módulo:** orders
