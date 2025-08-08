# 👥 Módulo de Usuarios - Next.js

Este documento describe la implementación completa del módulo de usuarios en el proyecto Next.js, siguiendo la arquitectura de Clean Architecture y los principios establecidos en el proyecto `reserve_app`.

## 🏗️ Arquitectura Implementada

### **1. Domain Layer (Dominio)**
```
src/internal/domain/
├── entities/
│   └── User.ts                    # Entidades y DTOs
└── ports/
    └── UserRepository.ts          # Interfaces del repositorio
```

### **2. Application Layer (Aplicación)**
```
src/internal/application/usecases/
├── GetUsersUseCase.ts             # Caso de uso para obtener usuarios
└── CreateUserUseCase.ts           # Caso de uso para crear usuarios
```

### **3. Infrastructure Layer (Infraestructura)**
```
src/internal/infrastructure/secondary/
├── UserService.ts                 # Servicio para llamadas a la API
├── UserRepositoryImpl.ts          # Implementación del repositorio
└── BusinessService.ts             # Servicio para negocios
```

### **4. Presentation Layer (Presentación)**
```
src/presentation/
├── hooks/
│   └── useUsers.ts                # Hook personalizado para usuarios
├── components/
│   ├── CreateUserModal.tsx        # Modal para crear usuarios
│   ├── CreateUserModal.css        # Estilos del modal
│   ├── UserProfileModal.tsx       # Modal de perfil de usuario
│   └── UserProfileModal.css       # Estilos del perfil
└── app/users/
    ├── page.tsx                   # Página de gestión de usuarios
    └── users.css                  # Estilos de la página
```

## 🚀 Funcionalidades Implementadas

### **✅ Gestión de Usuarios**
- **Listar usuarios** con paginación y filtros
- **Crear usuarios** con validaciones completas
- **Eliminar usuarios** con confirmación
- **Filtros avanzados** por nombre, email, estado
- **Paginación** con navegación intuitiva

### **✅ Formulario de Creación**
- **Validaciones en tiempo real**
- **Selección múltiple de roles**
- **Selección múltiple de negocios**
- **Carga de avatar** (preparado para S3)
- **Mostrar credenciales** después de crear

### **✅ Interfaz de Usuario**
- **Diseño responsive** para móviles y desktop
- **Animaciones suaves** y transiciones
- **Estados de carga** y manejo de errores
- **Modales elegantes** con overlay
- **Tabla interactiva** con hover effects

### **✅ Integración con Backend**
- **Llamadas a API** con manejo de errores
- **Autenticación** automática con tokens
- **Validación de respuestas** del servidor
- **Logging detallado** para debugging

## 📋 Entidades y Tipos

### **User Entity**
```typescript
interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatarURL?: string;
  isActive: boolean;
  roles: Role[];
  businesses: Business[];
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  deletedAt?: string;
}
```

### **CreateUserDTO**
```typescript
interface CreateUserDTO {
  name: string;
  email: string;
  phone?: string;
  avatarURL?: string;
  avatarFile?: File;
  isActive: boolean;
  roleIds: number[];
  businessIds: number[];
}
```

### **UserFilters**
```typescript
interface UserFilters {
  page?: number;
  pageSize?: number;
  name?: string;
  email?: string;
  phone?: string;
  isActive?: boolean;
  roleId?: number;
  businessId?: number;
  createdAt?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
```

## 🔧 Configuración Requerida

### **Variables de Entorno**
```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3050

# App Configuration
NEXT_PUBLIC_APP_NAME=Rupü
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### **Dependencias del Backend**
El backend debe tener implementados los siguientes endpoints:

- `GET /api/v1/users` - Listar usuarios con filtros
- `POST /api/v1/users` - Crear usuario
- `DELETE /api/v1/users/:id` - Eliminar usuario
- `GET /api/v1/roles` - Listar roles
- `GET /api/v1/businesses` - Listar negocios

## 🎯 Casos de Uso

### **1. Obtener Usuarios**
```typescript
const { users, loading, error, loadUsers } = useUsers();

// Cargar usuarios con filtros
await loadUsers({
  page: 1,
  pageSize: 10,
  name: 'Juan',
  isActive: true
});
```

### **2. Crear Usuario**
```typescript
const { createUser } = useUsers();

const result = await createUser({
  name: 'Juan Pérez',
  email: 'juan@example.com',
  phone: '3001234567',
  roleIds: [1, 2],
  businessIds: [1],
  isActive: true
});
```

### **3. Eliminar Usuario**
```typescript
const { deleteUser } = useUsers();

await deleteUser(123);
```

## 🎨 Componentes Reutilizables

### **CreateUserModal**
- Modal completo para crear usuarios
- Validaciones en tiempo real
- Manejo de archivos para avatar
- Mostrar credenciales generadas

### **UserProfileModal**
- Vista detallada del perfil de usuario
- Información de roles y negocios
- Timestamps de creación y actualización
- Diseño responsive

## 🔄 Flujo de Datos

1. **Usuario interactúa** con la interfaz
2. **Hook useUsers** maneja el estado
3. **Casos de uso** ejecutan la lógica de negocio
4. **Repositorio** hace las llamadas a la API
5. **Servicio** maneja la comunicación HTTP
6. **Respuesta** se procesa y actualiza el estado
7. **UI** se actualiza automáticamente

## 🛠️ Desarrollo y Testing

### **Estructura de Archivos**
```
src/
├── internal/
│   ├── domain/
│   │   ├── entities/User.ts
│   │   └── ports/UserRepository.ts
│   ├── application/
│   │   └── usecases/
│   │       ├── GetUsersUseCase.ts
│   │       └── CreateUserUseCase.ts
│   └── infrastructure/
│       └── secondary/
│           ├── UserService.ts
│           ├── UserRepositoryImpl.ts
│           └── BusinessService.ts
├── presentation/
│   ├── hooks/useUsers.ts
│   ├── components/
│   │   ├── CreateUserModal.tsx
│   │   ├── CreateUserModal.css
│   │   ├── UserProfileModal.tsx
│   │   └── UserProfileModal.css
│   └── app/users/
│       ├── page.tsx
│       └── users.css
└── config/env.ts
```

### **Logging y Debugging**
- Logs detallados en cada capa
- Manejo de errores con contexto
- Validación de respuestas de API
- Estados de carga visibles

## 🚀 Próximos Pasos

### **Funcionalidades Pendientes**
- [ ] **Editar usuarios** - Modal de edición
- [ ] **Cambiar contraseña** - Formulario seguro
- [ ] **Bulk operations** - Operaciones masivas
- [ ] **Exportar usuarios** - CSV/Excel
- [ ] **Audit trail** - Historial de cambios

### **Mejoras Técnicas**
- [ ] **Caching** - React Query/SWR
- [ ] **Optimistic updates** - Actualizaciones optimistas
- [ ] **Real-time updates** - WebSockets
- [ ] **Offline support** - Service Workers
- [ ] **Unit tests** - Jest/Testing Library

## 📚 Referencias

- **Clean Architecture** - Robert C. Martin
- **Next.js Documentation** - Vercel
- **TypeScript Handbook** - Microsoft
- **React Patterns** - Kent C. Dodds

---

**Estado**: ✅ **Completado**  
**Versión**: 1.0.0  
**Última actualización**: Diciembre 2024 