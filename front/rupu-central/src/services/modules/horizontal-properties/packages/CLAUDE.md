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
├── ui/                           # Componentes React ("PH - Visitas y Paquetes", P1–P4)
│   ├── packages-table.tsx        # P1/P4: lista (por entregar primero), chips, buscador, tarjetas móviles
│   ├── receive-package-modal.tsx # P2: recibir (modal 560 px)
│   ├── package-detail-panel.tsx  # P3: detalle + entregar / devolver (panel lateral 420 px)
│   ├── package-state.ts          # Lógica pura: grupo, antigüedad (+3 días), acciones, línea de tiempo
│   ├── packages-filters.ts       # Pestañas y búsqueda en la URL (?tab=&q=)
│   ├── unit-picker.tsx           # Buscador de unidad ("Casa 126")
│   ├── side-panel.tsx            # Panel lateral + línea de tiempo (candidato a shared/ui/ds)
│   └── index.ts
└── index.ts
```

## Componentes UI ("PH - Visitas y Paquetes", P1–P4)

### PackagesTable (P1 / P4)
- Pestañas Por entregar (por defecto, del más antiguo al más reciente) · Entregados hoy · Todos,
  con conteos (`GET /packages/summary`); filtros y paginación en la URL (`?tab=&q=`).
- Columnas unidad, residente (+ descripción), transportadora, guía, días en portería ("hoy",
  "1 día", "6 días": terracota desde 5, gris oscuro desde 2) y "Entregar" + ⋮ (detalle, devolver).
- "Recordar a residentes" deshabilitado: no hay servicio de notificaciones.
- Teléfono: buscador grande por unidad, tarjetas con "Entregar" y "+ Recibir paquete" fijo.

### ReceivePackageModal (P2)
Un paso: unidad y "Para", transportadora en chips (Otra → campo), guía opcional, foto
(deshabilitada hasta que haya subida de archivos), descripción y aviso al residente.

### PackageDetailPanel (P3)
Panel de 460 px: unidad en grande, guía y días en portería, descripción y quién recibió,
"Entregar a" (residentes de la unidad u otra persona: queda en la nota de la entrega), nota,
"Confirmar entrega · HH:MM" y "Devolver". "Notificado" no se entrega directo (regla del back).

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
