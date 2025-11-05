# 🏢 Rupu Central

Sistema de gestión de propiedades horizontales construido con **Next.js 15**, **TypeScript** y **arquitectura modular DDD**.

## 🚀 Inicio Rápido

### Instalación

```bash
npm install
```

### Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### Build para Producción

```bash
npm run build
npm start
```

## 📐 Arquitectura

Este proyecto implementa una **arquitectura modular basada en Domain-Driven Design (DDD)**. Para entender la estructura completa, consulta **[ARCHITECTURE.md](./ARCHITECTURE.md)**.

### Estructura Resumida

```
/src
  /app              # Rutas y páginas (App Router)
  /modules          # Módulos de negocio (DDD)
    /auth           # Autenticación y usuarios
    /property-horizontal  # Gestión de PH
  /shared           # Código compartido
  /config           # Configuración central
```

### Módulos Disponibles

- **Auth**: Autenticación, usuarios, roles y permisos
- **Property Horizontal**: Unidades, expensas, dashboard

## 🎯 Características

- ✅ **Arquitectura Modular**: Cada módulo es autónomo y reutilizable
- ✅ **Domain-Driven Design**: Separación clara de capas
- ✅ **TypeScript**: Type-safety en toda la aplicación
- ✅ **Server Actions**: Optimizadas para Next.js 15
- ✅ **RBAC**: Control de acceso basado en roles
- ✅ **Tailwind CSS**: UI moderna y responsive
- ✅ **API REST**: Endpoints para integración externa

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 15 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Linting**: ESLint
- **Package Manager**: npm

## 📚 Documentación

- **[ARCHITECTURE.md](./ARCHITECTURE.md)**: Documentación completa de la arquitectura
- **Componentes**: Cada módulo tiene su propia carpeta `ui/`
- **API**: Route handlers en `app/api/`

## 🔐 Roles y Permisos

El sistema incluye un RBAC centralizado en `src/config/rbac.ts`:

- **ADMIN**: Acceso total
- **MANAGER**: Gestión de PH
- **USER**: Vista limitada
- **GUEST**: Solo login

## 🌐 API Endpoints

- `POST /api/auth/login` - Login de usuarios
- `GET /api/property-horizontal/dashboard` - Estadísticas del dashboard

## 📝 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Producción
npm start

# Linting
npm run lint
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y propietario.

---

**Desarrollado con ❤️ usando Next.js 15 y TypeScript**
