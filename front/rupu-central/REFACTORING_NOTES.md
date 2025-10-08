# 📝 Notas de Refactorización - Actions dentro de Infrastructure

## 🎯 Motivación del Cambio

Las **Server Actions** fueron movidas de carpetas independientes (`actions/`) al interior de `infrastructure/actions/` por las siguientes razones arquitecturales:

### 1. **Son Adaptadores Técnicos**
- Las actions son específicas de Next.js (framework)
- No son parte del dominio de negocio puro
- Son "puntos de entrada" técnicos, como los controllers en arquitecturas tradicionales

### 2. **Alineación con Arquitectura Hexagonal**
En Clean Architecture/Hexagonal:
- **Domain**: Lógica de negocio pura (entidades, value objects)
- **Application**: Casos de uso (orquestación)
- **Infrastructure**: Adaptadores técnicos (DB, HTTP, Framework-specific)

Las actions son **adaptadores de entrada** (input adapters), por lo tanto pertenecen a infrastructure.

### 3. **Organización por Responsabilidad**
La carpeta `infrastructure/` ahora contiene toda la implementación técnica:
- `actions/` - Adaptadores de entrada (Server Actions)
- `repositories/` - Adaptadores de salida (DB)
- `services/` - Servicios externos (Email, Storage, APIs)

## 📊 Estructura Anterior vs Nueva

### ❌ Estructura Anterior
```
/modules/auth
  /actions              ← Separado, mismo nivel que domain
  /domain
  /application
  /infrastructure
  /ui
```

### ✅ Estructura Nueva (Refactorizada)
```
/modules/auth
  /domain
  /application
  /infrastructure       ← Toda la capa técnica junta
    /actions            ← Server Actions aquí
    /repositories       ← Repositorios aquí
    /services           ← Servicios aquí
  /ui
```

## 🔄 Cambios Realizados

### 1. Movimiento de Archivos

**Módulo Auth:**
- `modules/auth/actions/` → `modules/auth/infrastructure/actions/`
- `modules/auth/infrastructure/user.repository.impl.ts` → `modules/auth/infrastructure/repositories/user.repository.impl.ts`

**Módulo Property Horizontal:**
- `modules/property-horizontal/actions/` → `modules/property-horizontal/infrastructure/actions/`

### 2. Actualización de Imports

Todos los archivos que importaban actions fueron actualizados:

```typescript
// ❌ Antes
import { loginAction } from '@modules/auth/actions';

// ✅ Después
import { loginAction } from '@modules/auth/infrastructure/actions';
```

**Archivos actualizados:**
- `app/(auth)/login/page.tsx`
- `app/api/auth/login/route.ts`
- `app/(property-horizontal)/dashboard/page.tsx`
- `app/api/property-horizontal/dashboard/route.ts`
- `modules/auth/index.ts`
- `modules/property-horizontal/index.ts`

### 3. Actualización de Documentación

- `ARCHITECTURE.md` - Documentación completa actualizada
- Agregadas explicaciones sobre la nueva estructura de infrastructure

## 💡 Ventajas de este Enfoque

### 1. **Mayor Cohesión**
Toda la capa de infraestructura está junta, facilitando:
- Encontrar código relacionado
- Entender las dependencias técnicas
- Refactorizar implementaciones

### 2. **Separación Clara de Responsabilidades**
```
domain/       → QUÉ es el negocio (entidades, reglas)
application/  → CÓMO se orquesta (casos de uso)
infrastructure/ → DÓNDE se implementa (técnico)
ui/           → CÓMO se presenta (interfaz)
```

### 3. **Facilita Testing**
- Mock de toda la capa de infrastructure más sencillo
- Tests unitarios de domain/application sin dependencias técnicas
- Tests de integración enfocados en infrastructure

### 4. **Portabilidad**
Si cambias de framework (Next.js → Remix, etc.):
- Solo cambias `infrastructure/actions/`
- `domain/` y `application/` permanecen intactos

## 🎓 Conceptos DDD Aplicados

### Puerto vs Adaptador

**Puerto (Domain):**
```typescript
// domain/ports/user.repository.ts
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  // ...
}
```

**Adaptador (Infrastructure):**
```typescript
// infrastructure/repositories/user.repository.impl.ts
export class UserRepositoryImpl implements IUserRepository {
  async findById(id: string) {
    // Implementación con Prisma, Drizzle, etc.
  }
}
```

**Action como Adaptador de Entrada:**
```typescript
// infrastructure/actions/login.action.ts
'use server';
export async function loginAction(input) {
  // Adaptador que conecta UI con casos de uso
  const repo = new UserRepositoryImpl();
  const useCase = new LoginUseCase(repo);
  return useCase.execute(input);
}
```

## 📚 Comparación con Otras Arquitecturas

### Controller en MVC/REST
```
Controller (Infrastructure)
  ↓
UseCase (Application)
  ↓
Repository (Infrastructure)
```

### Server Action en Next.js (Nuestro Enfoque)
```
Action (Infrastructure)
  ↓
UseCase (Application)
  ↓
Repository (Infrastructure)
```

Las actions son el equivalente de controllers en frameworks tradicionales.

## ✅ Validación del Cambio

### Build Exitoso ✓
```bash
npm run build
# ✓ Compiled successfully
# ✓ Linting and checking validity of types
```

### Todas las Rutas Funcionando ✓
- `/` - Home
- `/login` - Login page
- `/dashboard` - Dashboard
- `/roles`, `/permissions`, `/units`, `/fees` - Páginas adicionales
- `/api/auth/login` - API endpoint
- `/api/property-horizontal/dashboard` - API endpoint

## 🔮 Próximas Mejoras Sugeridas

1. **Agregar subcarpeta `services/`**
   - Email service
   - Storage service
   - External APIs

2. **Considerar `infrastructure/http/`**
   - Si necesitas controladores REST adicionales
   - Separar concerns HTTP de actions

3. **Agregar `infrastructure/database/`**
   - Configuración de Prisma/Drizzle
   - Migraciones
   - Seeds

## 📖 Referencias

- **Clean Architecture** - Robert C. Martin
- **Hexagonal Architecture** - Alistair Cockburn
- **Domain-Driven Design** - Eric Evans
- **Next.js Server Actions** - Documentación oficial

---

**Refactorización completada:** ✅  
**Build verificado:** ✅  
**Documentación actualizada:** ✅  
**Sin errores de TypeScript:** ✅

