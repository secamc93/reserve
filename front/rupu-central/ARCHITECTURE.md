# 📐 Arquitectura del Proyecto Rupu Central

## Visión General

Este proyecto implementa una **arquitectura modular basada en Domain-Driven Design (DDD)** para Next.js 15 con TypeScript. La estructura permite que cada módulo sea autónomo, reutilizable y fácil de mantener.

## 🎯 Principios Fundamentales

1. **Separación por módulos**: Cada dominio de negocio es un módulo independiente
2. **Domain-Driven Design**: Capas bien definidas por cada módulo
3. **Server Actions encapsuladas**: Cada módulo tiene su carpeta `actions/`
4. **App Router delgado**: `app/` solo orquesta UI y rutas
5. **RBAC centralizado**: Permisos gestionados desde `config/rbac.ts`

## 📁 Estructura de Directorios

```
/src
  /app                           # ← Solo rutas y páginas (muy delgada)
    (auth)                       # ← Route group
      login/
        page.tsx                 # importa desde @modules/auth
      roles/
        page.tsx
      permissions/
        page.tsx
    (property-horizontal)        # ← Route group
      dashboard/
        page.tsx
      units/
        page.tsx
      fees/
        page.tsx
    api/                         # ← Route handlers para APIs REST
      auth/
        login/
          route.ts               # llama al módulo auth
      property-horizontal/
        dashboard/
          route.ts               # llama al módulo PH
    layout.tsx
    page.tsx
    globals.css

  /modules                       # ← Módulos de negocio
    /auth                        # ← Módulo de autenticación
      domain/                    # ← Entidades, Value Objects, Puertos
        entities/
          user.entity.ts
        ports/
          user.repository.ts
        index.ts
      application/               # ← Casos de uso (lógica de negocio)
        login.use-case.ts
        get-user.use-case.ts
        index.ts
      infrastructure/            # ← Capa de infraestructura (server-only)
        actions/                 # ← Server Actions (punto de entrada)
          login.action.ts
          get-user.action.ts
          index.ts
        repositories/            # ← Implementaciones de repositorios
          user.repository.impl.ts
        index.ts
      ui/                        # ← Componentes del módulo
        login-form.tsx
        user-card.tsx
        index.ts
      index.ts                   # ← Barrel: exporta lo público del módulo

    /property-horizontal         # ← Módulo de propiedad horizontal
      domain/
        entities/
          unit.entity.ts
          fee.entity.ts
        index.ts
      application/
        get-dashboard-stats.use-case.ts
        index.ts
      infrastructure/
        actions/                 # ← Server Actions
          get-dashboard-stats.action.ts
          index.ts
        repositories/            # ← (para futuras implementaciones)
      ui/
        dashboard-stats.tsx
        index.ts
      index.ts

  /shared                        # ← Código compartido entre módulos
    domain/                      # (vacío por ahora)
    infrastructure/
      logger.ts
      index.ts
    ui/
      button.tsx
      index.ts

  /config                        # ← Configuración central
    env.ts                       # variables de entorno
    rbac.ts                      # roles y permisos
    index.ts
```

## 🏗️ Capas de Cada Módulo

### 1. **Domain** (Dominio)
- **Entidades**: Objetos de negocio con identidad (User, Unit, Fee)
- **Value Objects**: Objetos sin identidad (Email, Money)
- **Puertos**: Interfaces que definen contratos (IUserRepository)
- **Eventos de Dominio**: (opcional) Eventos del negocio

**Características**:
- No depende de nada externo
- Solo lógica de negocio pura
- TypeScript puro, sin dependencias de frameworks

### 2. **Application** (Aplicación)
- **Casos de Uso**: Orquestan el flujo de negocio
- Llaman a los repositorios (puertos)
- Coordinan operaciones complejas

**Ejemplo**: `LoginUseCase`, `GetDashboardStatsUseCase`

### 3. **Infrastructure** (Infraestructura)
Esta capa contiene toda la implementación técnica específica del framework y adaptadores externos.

#### 3.1 **Actions** (Server Actions)
- **Server-only**: Directiva `'use server'`
- Punto de entrada desde UI
- Valida permisos (RBAC)
- Instancia casos de uso
- Maneja errores
- **Ubicación**: `infrastructure/actions/`

**Regla clave**: ⚠️ **NUNCA** importar en Client Components

#### 3.2 **Repositories** (Repositorios)
- Implementan los puertos del dominio
- Conectan con base de datos (Prisma, Drizzle, etc.)
- **Ubicación**: `infrastructure/repositories/`

**Ejemplo**: `UserRepositoryImpl` que usa Prisma/Drizzle

#### 3.3 **Services** (Servicios)
- APIs externas
- Email, Storage, etc.
- **Ubicación**: `infrastructure/services/`

### 4. **UI** (Interfaz de Usuario)
- Componentes React del módulo
- Pueden ser Server o Client Components
- Reutilizables dentro y fuera del módulo

## 🔐 Control de Acceso (RBAC)

```typescript
// src/config/rbac.ts
export enum Role {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  USER = 'USER',
}

export enum Permission {
  AUTH_LOGIN = 'auth:login',
  PH_VIEW_DASHBOARD = 'ph:view_dashboard',
  // ...
}

export function hasPermission(role: Role, permission: Permission): boolean {
  // ...
}
```

Las **actions** y **route handlers** validan permisos antes de ejecutar casos de uso.

## 🔄 Flujo de Datos

### Ejemplo: Login

```
1. Usuario llena formulario en LoginForm (Client Component)
2. LoginForm recibe loginAction como prop desde el Server Component
3. loginAction valida entrada y permisos
4. Instancia LoginUseCase con UserRepositoryImpl
5. LoginUseCase orquesta la lógica de negocio
6. UserRepositoryImpl consulta la BD
7. Respuesta vuelve a través de las capas
8. LoginForm muestra resultado al usuario
```

### Código de ejemplo:

```tsx
// ✅ app/(auth)/login/page.tsx (Server Component)
import { LoginForm } from '@modules/auth';
import { loginAction } from '@modules/auth/infrastructure/actions';

export default function LoginPage() {
  return <LoginForm onLogin={loginAction} />;
}
```

```tsx
// ✅ modules/auth/ui/login-form.tsx (Client Component)
'use client';

export function LoginForm({ onLogin }) {
  const handleSubmit = async (e) => {
    const result = await onLogin({ email, password });
    // ...
  };
  // ...
}
```

```tsx
// ✅ modules/auth/infrastructure/actions/login.action.ts (Server Action)
'use server';

export async function loginAction(input) {
  const userRepo = new UserRepositoryImpl();
  const useCase = new LoginUseCase(userRepo);
  return await useCase.execute(input);
}
```

## 📦 Barrel Exports (index.ts)

Cada módulo tiene un `index.ts` que exporta solo lo **público**:

```typescript
// modules/auth/index.ts

// ✅ Exportar tipos (útiles en otros módulos)
export type { User, CreateUserDTO } from './domain/entities/user.entity';

// ✅ Exportar componentes UI
export * from './ui';

// ❌ NO exportar actions (importar directamente donde se necesiten)
// import { loginAction } from '@modules/auth/actions';
```

## 🛣️ Importaciones con Path Aliases

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@modules/*": ["./src/modules/*"],
      "@shared/*": ["./src/shared/*"],
      "@config/*": ["./src/config/*"],
      "@app/*": ["./src/app/*"]
    }
  }
}
```

**Ejemplos de uso**:

```typescript
import { LoginForm } from '@modules/auth';
import { loginAction } from '@modules/auth/infrastructure/actions';
import { Button } from '@shared/ui';
import { Role, Permission } from '@config/rbac';
```

## 🌐 API Routes

Los route handlers en `app/api/` exponen endpoints REST para consumo externo:

```typescript
// app/api/auth/login/route.ts
import { loginAction } from '@modules/auth/infrastructure/actions';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = await loginAction(body);
  return NextResponse.json(result);
}
```

## ✅ Reglas de Oro

1. **`app/` solo orquesta**: No pongas lógica de negocio aquí
2. **Actions dentro de infrastructure**: Son adaptadores técnicos específicos de Next.js
3. **Actions son server-only**: Nunca importes en Client Components
4. **Pasa actions como props**: Desde Server Components a Client Components
5. **Cada módulo es autónomo**: Puede moverse a otro proyecto
6. **RBAC centralizado**: Valida permisos en actions/handlers
7. **Barrels consistentes**: Exporta solo lo público del módulo
8. **Path aliases**: Usa `@modules/`, `@shared/`, etc.
9. **Infraestructura server-only**: No expongas detalles de implementación
10. **Organización por tipo**: `actions/`, `repositories/`, `services/` dentro de `infrastructure/`

## 🚀 Ventajas de esta Arquitectura

- ✅ **Escalable**: Agregar módulos sin afectar existentes
- ✅ **Mantenible**: Código organizado y fácil de encontrar
- ✅ **Testeable**: Capas desacopladas facilitan testing
- ✅ **Reutilizable**: Módulos portables entre proyectos
- ✅ **Type-safe**: TypeScript en toda la stack
- ✅ **Performance**: Server Actions optimizadas
- ✅ **Seguridad**: RBAC centralizado y validado

## 📚 Próximos Pasos

1. Implementar Prisma/Drizzle en `infrastructure/`
2. Agregar autenticación real (NextAuth.js)
3. Implementar más casos de uso
4. Agregar tests unitarios por capa
5. Agregar tests de integración
6. Implementar eventos de dominio
7. Agregar monitoreo y logging
8. Configurar CI/CD

## 🎓 Referencias

- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)

---

**Desarrollado con ❤️ usando Next.js 15, TypeScript y DDD**

