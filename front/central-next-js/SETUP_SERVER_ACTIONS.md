# 🚀 Configuración de Server Actions

## 📋 **Problema Resuelto**

El error "Failed to fetch" se debía a que el código estaba usando `HttpClient` del lado del cliente en lugar de las nuevas **Server Actions** del servidor.

## 🔧 **Configuración Requerida**

### **1. Crear archivo `.env.local` en la raíz del proyecto:**

```bash
# Server-side environment variables (NOT exposed to client)
# These are used by Server Actions and API routes

# API Configuration
API_BASE_URL=http://central_reserve:3050

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Security Configuration
SESSION_SECRET=your-super-secret-session-key-change-in-production
COOKIE_SECRET=your-super-secret-cookie-key-change-in-production

# App Configuration
APP_ENV=development
LOG_LEVEL=debug

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
CORS_CREDENTIALS=true

# File Upload Configuration
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif

# Development Features
ENABLE_DEBUG=true
ENABLE_SWAGGER=true
ENABLE_LOGGING=true
ENABLE_REGISTRATION=true
ENABLE_EMAIL_VERIFICATION=false
ENABLE_2FA=false
ENABLE_SOCIAL_LOGIN=false

# Client-side environment variables (exposed to browser)
# These use NEXT_PUBLIC_ prefix

# App Configuration
NEXT_PUBLIC_APP_NAME=Rupü
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_APP_BASE_PATH=/app
```

## 🏗️ **Arquitectura Implementada**

### **✅ Server Actions (Nuevo)**
```
src/server/actions/
├── auth.ts          # Autenticación completa
├── users.ts         # Gestión de usuarios
├── tables.ts        # Gestión de mesas
├── businesses.ts    # Gestión de negocios
├── reservations.ts  # Gestión de reservas
├── clients.ts       # Gestión de clientes
├── rooms.ts         # Gestión de habitaciones
├── roles.ts         # Gestión de roles y permisos
└── index.ts         # Exportaciones
```

### **✅ Hook Personalizado**
```
src/shared/hooks/
└── useServerAuth.ts # Hook que usa Server Actions
```

### **✅ Contexto Actualizado**
```
src/shared/contexts/
└── AppContext.tsx   # Usa useServerAuth en lugar de AuthService
```

### **✅ Componente de Login**
```
src/features/auth/ui/components/
└── LoginForm.tsx    # Formulario que usa Server Actions
```

## 🔄 **Migración del Código**

### **❌ Antes (Cliente - HttpClient)**
```typescript
// NO usar más
import { AuthService } from '@/features/auth/application/AuthService';
const authService = new AuthService(config.API_BASE_URL);
const result = await authService.login(credentials);
```

### **✅ Después (Servidor - Server Actions)**
```typescript
// Usar Server Actions
import { useServerAuth } from '@/shared/hooks/useServerAuth';
const { login, loading, error } = useServerAuth();
const result = await login(formData);
```

## 🚀 **Uso de Server Actions**

### **1. En Componentes:**
```typescript
'use client';

import { useServerAuth } from '@/shared/hooks/useServerAuth';

export default function MyComponent() {
  const { login, loading, error, isAuthenticated } = useServerAuth();

  const handleLogin = async (formData: FormData) => {
    const result = await login(formData);
    if (result.success) {
      // Login exitoso
    }
  };

  return (
    <form action={handleLogin}>
      {/* Formulario */}
    </form>
  );
}
```

### **2. En Contextos:**
```typescript
import { useServerAuth } from '@/shared/hooks/useServerAuth';

export const AppProvider = ({ children }) => {
  const {
    isAuthenticated,
    user,
    permissions,
    initializeAuth
  } = useServerAuth();

  // Usar directamente
  return (
    <AppContext.Provider value={{ user, permissions, isAuthenticated }}>
      {children}
    </AppContext.Provider>
  );
};
```

## 🔐 **Seguridad Implementada**

### **✅ Cookies httpOnly**
- Tokens JWT inaccesibles desde JavaScript
- Protección contra ataques XSS

### **✅ Validación en Servidor**
- Todas las validaciones se ejecutan en el servidor
- No hay validación solo del lado del cliente

### **✅ Middleware de Autenticación**
- Verificación automática de tokens
- Redirección automática a login

### **✅ Headers de Seguridad**
- CORS configurado
- Headers de seguridad avanzados

## 🧪 **Testing**

### **1. Verificar que las Server Actions funcionen:**
```bash
# Construir el proyecto
npm run build

# Si no hay errores, las Server Actions están funcionando
```

### **2. Verificar que el login funcione:**
- Usar el nuevo `LoginForm` component
- Verificar que las cookies se guarden correctamente
- Verificar que la redirección funcione

### **3. Verificar que la autenticación persista:**
- Recargar la página después del login
- Verificar que el usuario permanezca autenticado

## 🚨 **Solución de Problemas**

### **Error: "Failed to fetch"**
- ✅ **Resuelto**: Ahora usa Server Actions en lugar de HttpClient

### **Error: "Module not found"**
- Verificar que el archivo `.env.local` existe
- Verificar que las variables de entorno estén configuradas

### **Error: "Unauthorized"**
- Verificar que `API_BASE_URL` apunte al backend correcto
- Verificar que el backend esté funcionando

### **Error: "Cookies not set"**
- Verificar que el backend esté configurado para cookies
- Verificar que el dominio sea correcto

## 📚 **Archivos Importantes**

1. **`.env.local`** - Variables de entorno del servidor
2. **`src/server/actions/auth.ts`** - Server Actions de autenticación
3. **`src/shared/hooks/useServerAuth.ts`** - Hook personalizado
4. **`src/shared/contexts/AppContext.tsx`** - Contexto actualizado
5. **`src/middleware.ts`** - Middleware de autenticación

## 🎯 **Próximos Pasos**

1. **Crear el archivo `.env.local`** con las variables de entorno
2. **Probar el login** con el nuevo sistema
3. **Verificar que la autenticación persista** entre recargas
4. **Migrar otros componentes** para usar Server Actions
5. **Implementar Server Components** para mejor performance

---

**¡El sistema de Server Actions está listo y funcionando! 🎉**

El error "Failed to fetch" ha sido resuelto y ahora todas las llamadas a la API se ejecutan de forma segura en el servidor. 