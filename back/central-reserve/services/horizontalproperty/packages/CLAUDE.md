# Modulo de Paqueteria - Backend

## Descripcion
Sistema de gestion de paqueteria para propiedades horizontales (condominios, edificios). Permite registrar, rastrear y entregar paquetes a los residentes.

## Estructura de Archivos

```
packages/
├── bundle.go                    # Entry point del modulo
└── internal/
    ├── app/                     # Casos de uso
    │   ├── constructor.go       # Constructor del use case
    │   ├── receive-package.use-case.go
    │   ├── list-packages.use-case.go
    │   ├── get-package-by-id.use-case.go
    │   ├── deliver-package.use-case.go
    │   ├── get-package-statuses.use-case.go
    │   └── delete-package.use-case.go
    ├── domain/                  # Entidades y puertos
    │   ├── entities.go          # Package, PackageStatus, etc.
    │   ├── dtos.go              # DTOs para operaciones
    │   ├── ports.go             # Interfaces Repository y UseCase
    │   └── errors.go            # Errores de dominio
    └── infra/
        ├── primary/handlers/    # Endpoints HTTP
        │   ├── constructor.go
        │   ├── router.go
        │   ├── receive-package.go
        │   ├── list-packages.go
        │   ├── get-package-by-id.go
        │   ├── deliver-package.go
        │   ├── list-package-statuses.go
        │   ├── delete-package.go
        │   ├── request/         # Request DTOs
        │   └── response/        # Response DTOs
        └── secondary/repository/
            └── package_repository.go
```

## Endpoints API

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | /packages/statuses | Listar estados de paquete |
| POST | /packages | Recibir nuevo paquete |
| GET | /packages | Listar paquetes (paginado) |
| GET | /packages/:id | Obtener paquete por ID |
| GET | /packages/qr/:qr_code | Obtener paquete por QR |
| POST | /packages/:id/deliver | Entregar paquete |
| PUT | /packages/:id/status | Actualizar estado |
| DELETE | /packages/:id | Eliminar (marcar como retornado) |

## Estados de Paquete

- `received` - Recibido en porteria
- `in_storage` - En almacen
- `notified` - Residente notificado
- `delivered` - Entregado (final)
- `returned` - Retornado al remitente (final)
- `lost` - Perdido (final)

## Flujo de Estados

```
received → in_storage → notified → delivered
    ↓          ↓            ↓
    └──────────┴────────────┴──→ returned
                                      ↓
                                    lost
```

## Dependencias

- `shared/db` - Conexion a base de datos
- `shared/log` - Logger contextual
- `auth/middleware` - JWT middleware
- `dbpostgres/app/infra/models` - Modelos GORM

## Migraciones

Los modelos `PackageStatus` y `Package` estan registrados en:
- `dbpostgres/app/app/usecases/migration_usecase.go`
- `dbpostgres/migrations/003_packages_tables.sql`
