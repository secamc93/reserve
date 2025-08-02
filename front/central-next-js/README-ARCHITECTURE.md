# 🏗️ Arquitectura Rupü Next.js

## 📁 Estructura del Proyecto

```
src/
├── internal/               # 🎯 INTERNO (Núcleo de Negocio)
│   ├── domain/             # 🎯 DOMINIO
│   │   ├── entities/       # Entidades del dominio
│   │   └── ports/         # 🚪 PUERTOS (Interfaces)
│   ├── application/        # 📋 APLICACIÓN
│   │   ├── usecases/      # Casos de uso
│   │   └── services/      # Servicios de aplicación
│   └── infrastructure/     # 🔌 INFRAESTRUCTURA
│       ├── primary/        # Adaptadores Primarios
│       └── secondary/      # Adaptadores Secundarios
│
├── presentation/           # 🎨 PRESENTACIÓN (UI/Next.js)
│   ├── components/        # Componentes React
│   └── hooks/            # Hooks personalizados
├── app/                   # 🚀 APP ROUTER (Next.js)
│
├── config/                # ⚙️ CONFIGURACIÓN
└── types/                 # 📝 TIPOS GLOBALES
```

## 🎯 Dos Grandes Bloques

### **Internal → Negocio**
- **Independiente de frameworks**
- **Lógica de negocio pura**
- **Reutilizable y testeable**

### **Presentation → UI**
- **Todo lo relacionado con Next.js**
- **Componentes React**
- **Hooks y páginas**

## 🚀 Ventajas

✅ **Separación clara de responsabilidades**  
✅ **Fácil de testear**  
✅ **Independiente de frameworks**  
✅ **Escalable y mantenible**  
✅ **Migración fácil del proyecto original**

## 📈 Agregar Nuevos Módulos

1. **Entidades** → `internal/domain/entities/`
2. **Puertos** → `internal/domain/ports/`
3. **Casos de uso** → `internal/application/usecases/`
4. **Adaptadores** → `internal/infrastructure/`
5. **Servicios** → `internal/application/services/`
6. **Componentes** → `presentation/`

## 🔄 Flujo de Datos

```
Presentation → Internal → Infrastructure
     ↓              ↓           ↓
   Hook → Service → UseCase → Repository
```

Esta arquitectura garantiza que el proyecto Rupü sea **mantenible**, **escalable** y **testeable** a largo plazo. 