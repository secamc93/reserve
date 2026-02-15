# Modulo de Paqueteria - Frontend

## Descripcion
Interfaz de usuario para gestion de paqueteria en propiedades horizontales. Implementa Clean Architecture con patron de repositorio.

## Estructura de Archivos

```
packages/
├── domain/
│   ├── entities/
│   │   ├── package.entity.ts    # Package, PackageListDTO, PackageStatus
│   │   └── index.ts
│   ├── ports/
│   │   ├── package.repository.ts # IPackagesRepository interface
│   │   └── index.ts
│   └── index.ts
├── application/                  # Casos de uso
│   ├── get-packages.use-case.ts
│   ├── receive-package.use-case.ts
│   ├── deliver-package.use-case.ts
│   ├── get-package-statuses.use-case.ts
│   ├── delete-package.use-case.ts
│   ├── get-package-by-id.use-case.ts
│   └── index.ts
├── infrastructure/
│   ├── repositories/
│   │   ├── packages.repository.ts  # Implementacion
│   │   ├── response/               # Tipos de respuesta backend
│   │   └── index.ts
│   ├── actions/                    # Server actions (Next.js)
│   │   ├── get-packages.action.ts
│   │   ├── receive-package.action.ts
│   │   ├── deliver-package.action.ts
│   │   ├── get-package-statuses.action.ts
│   │   ├── delete-package.action.ts
│   │   ├── get-package-by-id.action.ts
│   │   └── index.ts
│   └── index.ts
├── ui/                           # Componentes React
│   ├── packages-table.tsx        # Tabla principal con filtros
│   ├── receive-package-modal.tsx # Modal para recibir
│   ├── deliver-package-modal.tsx # Modal para entregar
│   ├── package-detail-modal.tsx  # Modal de detalles
│   └── index.ts
└── index.ts
```

## Componentes UI

### PackagesTable
Tabla principal de paquetes con:
- Paginacion
- Filtros por estado, fecha
- Acciones: ver detalles, entregar, eliminar

### ReceivePackageModal
Formulario para registrar nuevo paquete:
- Unidad destino
- Transportadora
- Numero de tracking
- Descripcion/notas

### DeliverPackageModal
Confirmacion de entrega:
- Notas opcionales
- Registro de usuario

### PackageDetailModal
Vista detallada del paquete:
- Informacion de envio
- Destino
- Timeline de eventos

## Flujo de Datos

```
UI Component
    ↓ (llamada)
Server Action ('use server')
    ↓ (instancia)
Use Case
    ↓ (metodo)
Repository (fetch API)
    ↓ (HTTP)
Backend API
```

## Patrones Utilizados

- **Clean Architecture**: Separacion domain/application/infrastructure/ui
- **Repository Pattern**: Abstraccion de acceso a datos
- **Server Actions**: Next.js server-side execution
- **Token Management**: TokenStorage para JWT

## Dependencias

- `@shared/ui` - Componentes UI compartidos
- `@shared/config` - Configuracion, env, TokenStorage
- `@heroicons/react` - Iconos
