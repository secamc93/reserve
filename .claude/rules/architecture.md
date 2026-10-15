# Reglas de Arquitectura Hexagonal - Proyecto Probability

> **Aplicable a:** Backend (Go) y Frontend (Next.js/TypeScript)

## 🎯 Principio Fundamental

```
Infraestructura → Application → Domain
   (externo)                    (núcleo)
```

**Regla de Oro:** Las dependencias SIEMPRE apuntan hacia adentro. Domain nunca conoce las capas externas.

### Jerarquía de Capas

1. **Domain (Núcleo)** - Entidades, Ports, DTOs, Errores | Pureza absoluta: CERO dependencias externas | Sin tags
2. **Application** - Use Cases | Solo depende de Domain
3. **Infrastructure** - Handlers, Repos, Clientes | Implementa ports de Domain

---

## 📁 Backend (Go)

### Estructura Obligatoria

```
service/
├── bundle.go
└── internal/
    ├── domain/
    │   ├── entities/      # Sin tags
    │   ├── dtos/          # Sin tags
    │   ├── ports/         # Interfaces
    │   └── errors/
    ├── app/
    │   ├── constructor.go
    │   ├── usecase1.go
    │   └── mappers/       # OPCIONAL - Solo cuando se necesiten transformaciones
    └── infra/
        ├── primary/handlers/
        │   ├── constructor.go
        │   ├── routes.go  # OBLIGATORIO
        │   ├── create_handler.go
        │   ├── request/   # OBLIGATORIO
        │   ├── response/  # OBLIGATORIO
        │   └── mappers/   # OBLIGATORIO
        └── secondary/repository/
            ├── constructor.go
            ├── repository.go
            └── mappers/   # OBLIGATORIO
```

### Reglas Críticas

#### 1. Domain: Pureza Absoluta

```go
// ✅ CORRECTO
type User struct {
    ID    uuid.UUID
    Email string
    Name  string
}

// ❌ INCORRECTO - tiene tags
type User struct {
    ID uuid.UUID `json:"id" gorm:"primary_key"`
}
```

**Imports permitidos:** `context`, `time`, `errors`, `fmt`, `github.com/google/uuid`
**Prohibidos:** `gorm`, `gin`, `database/sql`, `net/http`

#### 2. Constructor Único

```go
// ✅ CORRECTO - handlers/constructor.go
type IHandler interface {
    Create(c *gin.Context)
    RegisterRoutes(router *gin.RouterGroup) // OBLIGATORIO
}

func New(useCase app.IUseCase) IHandler { ... }

// ❌ INCORRECTO
func NewUserHandler() { }
func NewOrderHandler() { }
```

**Reglas:**
- UN constructor.go por carpeta
- UNA interfaz pública
- UNA función New()

#### 3. Handlers: Un Método por Archivo

```
handlers/
├── constructor.go
├── routes.go          # OBLIGATORIO
├── create_handler.go
└── list_handler.go
```

#### 4. Rutas Centralizadas

```go
// ✅ handlers/routes.go
func (h *handler) RegisterRoutes(router *gin.RouterGroup) {
    users := router.Group("/users")
    users.POST("", h.Create)
    users.GET("", h.List)
}
```

#### 5. Repositorios: SIEMPRE Modelos GORM

```go
// ❌ INCORRECTO
err := r.db.Table("users").Find(&users).Error

// ✅ CORRECTO
import "github.com/secamc93/probability/back/migration/shared/models"

var users []models.User
err := r.db.Find(&users).Error  // GORM infiere tabla del modelo
```

**OBLIGATORIO:** Importar modelos desde `migration/shared/models`
**PROHIBIDO:** Crear carpeta `models/` en módulos

#### 6. Independencia de Módulos

```go
// ❌ INCORRECTO
import "payments"
type OrdersRepo struct {
    paymentsRepo payments.IRepository  // Dependencia entre módulos
}

// ✅ CORRECTO - Consultar BD directamente
func (r *OrdersRepo) GetOrder(ctx context.Context, id string) (*entities.Order, error) {
    var order models.Order
    err := r.db.WithContext(ctx).Preload("PaymentMethod").First(&order, id).Error
    return order.ToDomain(), err
}
```

**NO crear** `ports.go` en raíz de módulos
**Ports SOLO en** `internal/domain/ports/`

#### 7. Paginación Obligatoria en Métodos GET

**TODOS los métodos GET que retornan listas DEBEN implementar paginación.**

##### Estructura de Request (domain/dtos/)

```go
// ✅ CORRECTO - Parámetros de paginación estándar
type PaginationParams struct {
    Page     int  // Página actual (empezar en 1)
    PageSize int  // Cantidad de registros por página
}

// Validaciones recomendadas en constructor o método de validación
func NewPaginationParams(page, pageSize int) PaginationParams {
    if page < 1 {
        page = 1
    }
    if pageSize < 1 || pageSize > 100 {
        pageSize = 10 // Default
    }
    return PaginationParams{Page: page, PageSize: pageSize}
}

func (p PaginationParams) Offset() int {
    return (p.Page - 1) * p.PageSize
}
```

##### Estructura de Response (domain/dtos/)

```go
// ✅ CORRECTO - Response paginado genérico
type PaginatedResponse[T any] struct {
    Data       []T
    Total      int64
    Page       int
    PageSize   int
    TotalPages int
}

func NewPaginatedResponse[T any](data []T, total int64, page, pageSize int) PaginatedResponse[T] {
    totalPages := int(total) / pageSize
    if int(total)%pageSize != 0 {
        totalPages++
    }
    return PaginatedResponse[T]{
        Data:       data,
        Total:      total,
        Page:       page,
        PageSize:   pageSize,
        TotalPages: totalPages,
    }
}
```

##### Implementación en Repository

```go
// ✅ CORRECTO - Repositorio con paginación
import "github.com/secamc93/probability/back/migration/shared/models"

func (r *Repository) List(ctx context.Context, params dtos.PaginationParams) ([]models.User, int64, error) {
    var users []models.User
    var total int64

    // Contar total de registros
    if err := r.db.WithContext(ctx).Model(&models.User{}).Count(&total).Error; err != nil {
        return nil, 0, err
    }

    // Obtener página de registros
    err := r.db.WithContext(ctx).
        Offset(params.Offset()).
        Limit(params.PageSize).
        Find(&users).Error

    return users, total, err
}

// ❌ INCORRECTO - Sin paginación
func (r *Repository) List(ctx context.Context) ([]models.User, error) {
    var users []models.User
    err := r.db.Find(&users).Error // Trae TODOS los registros
    return users, err
}
```

##### Implementación en Use Case

```go
// ✅ CORRECTO - Use case con paginación
func (uc *UseCaseUser) List(ctx context.Context, params dtos.PaginationParams) (dtos.PaginatedResponse[*entities.User], error) {
    // Validar parámetros
    params = dtos.NewPaginationParams(params.Page, params.PageSize)

    // Obtener datos del repositorio
    users, total, err := uc.repo.List(ctx, params)
    if err != nil {
        return dtos.PaginatedResponse[*entities.User]{}, err
    }

    // Mapear a entidades de dominio
    userEntities := make([]*entities.User, len(users))
    for i, user := range users {
        userEntities[i] = mapper.ToDomain(&user)
    }

    // Retornar respuesta paginada
    return dtos.NewPaginatedResponse(userEntities, total, params.Page, params.PageSize), nil
}
```

##### Implementación en Handler (infra/primary/handlers/)

```go
// ✅ CORRECTO - Handler con query params de paginación
import (
    "strconv"
    "github.com/gin-gonic/gin"
)

type ListRequest struct {
    Page     int `form:"page"`
    PageSize int `form:"page_size"`
}

func (h *handler) List(c *gin.Context) {
    // 1. Parsear query params
    var req ListRequest
    if err := c.ShouldBindQuery(&req); err != nil {
        c.JSON(400, gin.H{"error": "Invalid parameters"})
        return
    }

    // 2. Convertir a DTO de dominio
    params := dtos.NewPaginationParams(req.Page, req.PageSize)

    // 3. Ejecutar use case
    result, err := h.useCase.List(c.Request.Context(), params)
    if err != nil {
        c.JSON(500, gin.H{"error": err.Error()})
        return
    }

    // 4. Mapear a response HTTP
    c.JSON(200, response.ToPaginatedResponse(result))
}
```

##### Ejemplo de Response HTTP

```json
{
    "data": [
        {"id": "1", "name": "User 1"},
        {"id": "2", "name": "User 2"}
    ],
    "total": 150,
    "page": 1,
    "page_size": 10,
    "total_pages": 15
}
```

##### Reglas de Paginación

- **Default Page:** 1
- **Default PageSize:** 10
- **Max PageSize:** 100 (validar en constructor)
- **Min PageSize:** 1
- **Siempre retornar:** Total de registros y total de páginas
- **Count query:** Usar `Model()` sin `Offset/Limit` para contar total

##### Excepciones (Sin Paginación)

✅ **Permitido** para:
- Endpoints de búsqueda por ID único (`GET /users/:id`)
- Catálogos pequeños fijos (`GET /countries`, `GET /currencies`)
- Datos maestros con < 50 registros garantizados
- Endpoints específicos de lookup (`GET /users/by-email`)

❌ **Obligatorio** para:
- Listados de usuarios, órdenes, productos, etc.
- Cualquier consulta que pueda retornar > 100 registros
- Endpoints de búsqueda con filtros (`GET /orders?status=pending`)

---

## 📁 Frontend (Next.js)

### Estructura Obligatoria

```
services/[module]/
├── domain/
│   ├── types.ts
│   └── ports.ts
├── app/
│   └── use-cases.ts
├── infra/
│   ├── repository/
│   └── actions/       # OBLIGATORIO
└── ui/
    ├── components/
    └── hooks/
```

### Regla de Oro: Server-First HTTP

**TODAS las peticiones HTTP en servidor (Server Components o Server Actions)**

Excepciones: WebSockets, SSE

### Reglas Críticas

#### 1. Domain Sin Side Effects

```typescript
// ✅ CORRECTO
export interface User {
    id: string;
    email: string;
}

// ❌ INCORRECTO
export async function getUsers() {
    const res = await fetch('/api/users'); // ❌
}
```

#### 2. Server Components para Lectura

```typescript
// ✅ app/users/page.tsx
export default async function UsersPage() {
    const repo = new UsersRepository();
    const users = await repo.getUsers();
    return <UserList users={users} />;
}
```

#### 3. Server Actions para Mutaciones

```typescript
// ✅ infra/actions/index.ts
'use server';

import { revalidatePath } from 'next/cache';

export async function createUserAction(formData: FormData) {
    const repo = new UsersRepository();
    const user = await repo.createUser({
        email: formData.get('email') as string,
    });
    revalidatePath('/users');
    return { success: true, user };
}
```

#### 4. Client Components Solo para Interactividad

```typescript
// ✅ ui/components/UserList.tsx
'use client';

export function UserList({ users }: { users: User[] }) {
    const handleDelete = async (id: string) => {
        await deleteUserAction(id);
    };
    return <div>...</div>;
}
```

**Cuando usar:**
- ✅ onClick, useState, useEffect
- ✅ WebSocket/SSE
- ❌ Fetch de datos iniciales
- ❌ Instanciar repositorios

### Diagrama de Decisión

```
¿Fetch datos? → Server Component
¿Mutación? → Server Action
¿Interactividad? → Client Component
¿Tiempo real? → Client Component + WebSocket/SSE
```

#### 5. Paginación Obligatoria en Métodos GET

**TODOS los métodos del repositorio que retornan listas DEBEN implementar paginación.**

##### Types en Domain (domain/types.ts)

```typescript
// ✅ CORRECTO - Tipos de paginación estándar
export interface PaginationParams {
    page: number;      // Página actual (empezar en 1)
    pageSize: number;  // Cantidad de registros por página
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// Helper para crear params con defaults
export function createPaginationParams(
    page: number = 1,
    pageSize: number = 10
): PaginationParams {
    return {
        page: Math.max(1, page),
        pageSize: Math.min(Math.max(1, pageSize), 100) // Max 100
    };
}
```

##### Implementación en Repository (infra/repository/)

```typescript
// ✅ CORRECTO - Repository con paginación
export class UsersRepository implements IUsersRepository {
    async list(params: PaginationParams): Promise<PaginatedResponse<User>> {
        const queryParams = new URLSearchParams({
            page: params.page.toString(),
            page_size: params.pageSize.toString()
        });

        const response = await fetch(
            `${this.baseUrl}/users?${queryParams}`,
            { cache: 'no-store' }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }

        return response.json();
    }
}

// ❌ INCORRECTO - Sin paginación
async list(): Promise<User[]> {
    const response = await fetch(`${this.baseUrl}/users`);
    return response.json(); // Trae TODOS los registros
}
```

##### Server Component con Paginación

```typescript
// ✅ CORRECTO - Server Component con searchParams
interface PageProps {
    searchParams: Promise<{ page?: string; page_size?: string }>;
}

export default async function UsersPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const page = parseInt(params.page || '1');
    const pageSize = parseInt(params.page_size || '10');

    const repo = new UsersRepository();
    const result = await repo.list(createPaginationParams(page, pageSize));

    return (
        <div>
            <UserList users={result.data} />
            <Pagination
                currentPage={result.page}
                totalPages={result.totalPages}
                total={result.total}
            />
        </div>
    );
}
```

##### Client Component para Paginación

```typescript
// ✅ CORRECTO - Client Component solo para UI de paginación
'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    total: number;
}

export function Pagination({ currentPage, totalPages, total }: PaginationProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', newPage.toString());
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="flex gap-2">
            <button
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
            >
                Previous
            </button>
            <span>Page {currentPage} of {totalPages} ({total} total)</span>
            <button
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
            >
                Next
            </button>
        </div>
    );
}
```

##### Reglas de Paginación Frontend

- **Default Page:** 1
- **Default PageSize:** 10
- **Max PageSize:** 100
- **URL params:** `?page=1&page_size=10`
- **Navegación:** Usar `router.push` con query params
- **Caching:** `cache: 'no-store'` en fetch paginado
- **Revalidación:** `revalidatePath()` después de mutaciones

##### Excepciones (Sin Paginación)

✅ **Permitido** para:
- Búsqueda por ID único
- Catálogos pequeños (países, monedas)
- Dropdowns con < 50 opciones
- Lookups específicos

❌ **Obligatorio** para:
- Listados de entidades principales
- Tablas con datos dinámicos
- Búsquedas con filtros

---

## 🚨 Violaciones Críticas

### Backend

❌ **Domain con tags**
❌ **Domain importando gorm/gin**
❌ **Múltiples constructores (NewFoo, NewBar)**
❌ **DTOs en handlers (debe estar en request/response/)**
❌ **`.Table("users")` en vez de modelos GORM**
❌ **Modelos GORM locales en módulos**
❌ **`ports.go` en raíz de módulo**
❌ **Métodos GET sin paginación (excepto lookups únicos)**
❌ **Paginación sin validación de límites (max 100)**

### Frontend

❌ **Fetch en domain**
❌ **Client Component con fetch** (excepto WS/SSE)
❌ **useEffect para fetch inicial**
❌ **Repositorios en Client Components**
❌ **Mutaciones sin Server Actions**
❌ **Listados sin paginación**
❌ **Paginación sin searchParams en URL**

---

## ✅ Checklist de Validación

### Backend
- [ ] Domain sin tags ni imports de frameworks
- [ ] Un constructor.go por carpeta con función New()
- [ ] routes.go con RegisterRoutes()
- [ ] Carpetas request/, response/, mappers/ OBLIGATORIAS en handlers/
- [ ] Carpeta mappers/ OBLIGATORIA en repository/
- [ ] Carpeta mappers/ OPCIONAL en app/ (solo si se necesita)
- [ ] Modelos GORM desde migration/shared/models
- [ ] Sin carpeta models/ en módulos
- [ ] ports.go solo en internal/domain/ports/
- [ ] Métodos List/Get con paginación obligatoria
- [ ] PaginationParams y PaginatedResponse en domain/dtos/
- [ ] Validación de PageSize (max 100, default 10)
- [ ] Count query antes de Offset/Limit en repositorios

### Frontend
- [ ] Domain sin fetch/axios/react/next
- [ ] Server Actions con 'use server' y revalidatePath()
- [ ] Server Components para fetch de datos
- [ ] Client Components sin repositorios ni fetch
- [ ] useFormState para mutaciones con estado
- [ ] PaginationParams y PaginatedResponse en domain/types.ts
- [ ] Paginación con searchParams en URL (?page=1&page_size=10)
- [ ] Componente Pagination como Client Component
- [ ] createPaginationParams con validación de límites

---

## 🎯 Comandos de Verificación

### Backend

```bash
# Buscar tags en domain (DEBE retornar vacío)
grep -r 'json:"' internal/domain/

# Buscar imports prohibidos
grep -r "gorm\|gin" internal/domain/

# Buscar Table() en repositorios (VIOLACIÓN)
grep -r '\.Table(' internal/infra/secondary/repository/

# Verificar modelos locales (DEBE retornar 0)
find services -path "*/repository/models" -type d | wc -l

# Verificar ports.go en raíz (DEBE retornar 0)
find services/modules/*/ports.go 2>/dev/null | wc -l

# Buscar métodos List sin paginación (VIOLACIÓN)
grep -r "func.*List.*context.Context.*\[\]" internal/domain/ports/

# Buscar repositorios sin Count() antes de Offset/Limit
grep -A5 "\.Offset(" internal/infra/secondary/repository/ | grep -B5 "\.Limit(" | grep -v "Count()"

# Verificar PaginationParams en domain/dtos
find services -path "*/internal/domain/dtos/*pagination*" -type f
```

### Frontend

```bash
# Buscar fetch en domain (CRÍTICO)
grep -r "fetch\|axios" src/services/*/domain/

# Buscar 'use client' con fetch (VIOLACIÓN)
grep -l "'use client'" src/**/*.tsx | xargs grep -l "fetch("

# Buscar repositorios en Client Components
grep -l "'use client'" src/**/*.tsx | xargs grep "new.*Repository"

# Verificar Server Actions sin 'use server'
grep -L "'use server'" src/services/*/infra/actions/*.ts

# Buscar métodos list sin PaginationParams (VIOLACIÓN)
grep -r "async list()" src/services/*/infra/repository/

# Verificar PaginatedResponse en domain/types
grep -r "PaginatedResponse" src/services/*/domain/types.ts

# Buscar listados sin searchParams
grep -l "Page.*Props" src/app/**/*.tsx | xargs grep -L "searchParams"
```

---

**Última actualización:** 2026-02-01
**Cambio:** Agregada regla obligatoria de paginación para todos los métodos GET (Backend #7, Frontend #5)
