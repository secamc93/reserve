# Testing Suite - Central Reserve

Suite de testing interactivo para los servicios de Central Reserve con soporte de API y consultas directas a base de datos.

## 📦 Módulos Disponibles

### 1. Module: Unit
Módulo de pruebas unitarias básicas.

```bash
./bin/testing -module unit
```

### 2. Module: Residents
Módulo de testing para el servicio de residentes.

```bash
./bin/testing -module residents
```

### 3. Module: Visit ⭐ **NUEVO CON BD**
Módulo completo de testing para el servicio de visitas con:
- Testing de APIs (15 endpoints)
- Consultas directas a base de datos (5 funcionalidades)
- Autenticación en dos pasos
- Logging estructurado
- Estadísticas y reportes

```bash
./bin/testing -module visit
```

Ver documentación completa: [modules/visit/README.md](modules/visit/README.md)

## 🚀 Instalación y Uso

### Prerrequisitos

- Go 1.23.0 o superior
- PostgreSQL (para funcionalidades de BD)
- Acceso a la API de Central Reserve

### Configuración

1. **Configurar variables de entorno**:

```bash
# Editar .env con tus credenciales
```

2. **Variables clave en .env**:

```bash
# API
API_BASE_URL=http://localhost:8081/api/v1

# Database (para módulo visit)
DB_HOST=localhost
DB_USER=postgres
DB_PASS=postgres
DB_NAME=central_reserve
DB_PORT=5432
PGSSLMODE=disable
DB_LOG_LEVEL=info

# Logging
LOG_LEVEL=info

# Test Users (3 usuarios configurables)
TEST_USER1_EMAIL=admin@horizontalproperty.com
TEST_USER1_PASSWORD=admin123
TEST_USER1_NAME=Admin Principal
```

### Compilación

```bash
# Actualizar dependencias
go mod tidy

# Compilar
go build -o bin/testing cmd/main.go
```

### Ejecución

```bash
# Cargar variables de entorno
export $(cat .env | xargs)

# Ejecutar módulo específico
./bin/testing -module visit

# Modo verbose
./bin/testing -module visit -v
```

## 🏗️ Arquitectura del Proyecto

```
testing/
├── cmd/
│   └── main.go              # Punto de entrada
├── shared/                  # Utilidades compartidas
│   ├── auth.go              # Autenticación
│   ├── config.go            # Configuración
│   ├── http_client.go       # Cliente HTTP
│   ├── testing_db.go        # Cliente de BD (GORM)
│   └── testing_logger.go    # Logger (zerolog)
├── modules/
│   └── visit/               # Módulo de visitas
│       ├── bundle.go
│       ├── state_manager.go
│       ├── menu.go
│       ├── handlers.go
│       └── README.md
├── .env                    # Variables de entorno
└── bin/testing             # Binario compilado
```

## 📚 Documentación

- [Módulo Visit - Completo](modules/visit/README.md)
- [Changelog - BD](CHANGELOG_VISIT.md)

---

**Versión**: 1.0.0 | **Fecha**: 2026-01-24
