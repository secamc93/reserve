# Módulo Visit - Testing Interactivo con Base de Datos

Módulo de testing interactivo para probar las APIs del servicio de visitas de propiedades horizontales con soporte completo de consultas directas a la base de datos.

## Características

- ✅ Login con 3 usuarios configurables (selección interactiva)
- ✅ Autenticación en dos pasos: main token → business token
- ✅ Selección de propiedad horizontal por business type
- ✅ Menú interactivo por consola
- ✅ StateManager para reutilizar IDs entre operaciones
- ✅ Flujo completo de visita: crear visitante → crear visita → entrada → salida
- ✅ **Conexión directa a base de datos PostgreSQL**
- ✅ **Consultas SQL personalizadas**
- ✅ **Estadísticas y reportes**
- ✅ **Logging estructurado con zerolog**

## Endpoints Implementados

### Gestión de Visitantes
- `POST /horizontal-properties/visits/visitors` - Crear visitante
- `GET /horizontal-properties/visits/search-visitor?dni=XXX` - Buscar visitante por DNI

### Gestión de Visitas
- `POST /horizontal-properties/visits` - Crear visita
- `GET /horizontal-properties/visits` - Listar visitas
- `GET /horizontal-properties/visits/{id}` - Obtener visita por ID
- `GET /horizontal-properties/visits/qr/{qr_code}` - Obtener visita por QR

### Entrada/Salida
- `POST /horizontal-properties/visits/{id}/register-entry` - Registrar entrada
- `POST /horizontal-properties/visits/{id}/register-exit` - Registrar salida

### Acompañantes y Activos
- `GET /horizontal-properties/visits/{id}/companions` - Listar acompañantes
- `POST /horizontal-properties/visits/{id}/companions` - Crear acompañante
- `POST /horizontal-properties/visits/{id}/assets` - Registrar activos

### Catálogos
- `GET /horizontal-properties/visits/types` - Tipos de visita
- `GET /horizontal-properties/visits/statuses` - Estados de visita

## Funcionalidades de Base de Datos

### Consultas Directas
- **Listar Visitantes**: Consulta directa a la tabla `visitor`
- **Listar Visitas**: Consulta directa a la tabla `visit` filtrando por business_id
- **Consultas SQL Personalizadas**: Ejecuta cualquier consulta SELECT
- **Estadísticas de Visitas**: Reportes agregados (total, pendientes, activas, completadas, hoy)
- **Verificar Conexión**: Diagnóstico de la conexión a BD y pool de conexiones

## Uso

### Ejecutar el módulo
```bash
cd /home/cam/Desktop/reserve/back/testing

# Cargar variables de entorno
export $(cat .env | xargs)

# Ejecutar módulo visit
./bin/testing -module visit

# Modo verbose
./bin/testing -module visit -v
```

### Configurar Base de Datos

Edita el archivo `.env` con las credenciales de la base de datos:

```bash
# Database Configuration
DB_HOST=localhost
DB_USER=postgres
DB_PASS=postgres
DB_NAME=central_reserve
DB_PORT=5432
PGSSLMODE=disable
DB_LOG_LEVEL=info

# Logging
LOG_LEVEL=info
```

### Configurar usuarios

Edita el archivo `.env` con las credenciales de 3 usuarios:

```bash
TEST_USER1_EMAIL=admin@horizontalproperty.com
TEST_USER1_PASSWORD=admin123
TEST_USER1_NAME=Admin Principal

TEST_USER2_EMAIL=security@horizontalproperty.com
TEST_USER2_PASSWORD=security123
TEST_USER2_NAME=Guardia Seguridad

TEST_USER3_EMAIL=resident@horizontalproperty.com
TEST_USER3_PASSWORD=resident123
TEST_USER3_NAME=Residente Test
```

## Flujo de Prueba

1. **Iniciar el módulo**: El programa carga automáticamente las variables de .env
2. **Listar usuarios**: Se muestran TODOS los usuarios disponibles sin autenticar
3. **Seleccionar usuario**: Elegir entre los usuarios configurados (1-3) o cancelar (0)
4. **Intentar autenticación**: El sistema intenta login con el usuario seleccionado
   - Si falla, muestra causas posibles y termina
   - Si tiene éxito, continúa con el flujo
5. **Obtener business token**: Automático después del login exitoso
6. **Seleccionar propiedad**: De la lista filtrada por business type
7. **Menú principal**: Navegar por las opciones disponibles

### Menú Principal

```
[1] Gestión de Visitantes
[2] Gestión de Visitas
[3] Registro de Entradas/Salidas
[4] Acompañantes y Activos
[5] Catálogos (Tipos, Estados)
[6] Flujo Completo de Visita
[7] Consultas a Base de Datos ⭐ NUEVO
[8] Ver Estado Actual
[0] Salir

### Menú de Base de Datos (Opción 7)

```
[1] Listar Visitantes (Tabla visitor)
[2] Listar Visitas (Tabla visit)
[3] Consulta SQL Personalizada
[4] Estadísticas de Visitas
[5] Verificar Conexión a BD
[0] Volver
```

### Flujo Completo (Opción 6)

Ejecuta automáticamente:
1. Crear visitante (con DNI, nombre, teléfono)
2. Crear visita (asociada al visitante)
3. Registrar entrada (con gate y método)
4. Registrar salida (con gate)

## StateManager

El StateManager guarda automáticamente los últimos IDs utilizados:
- `business_id`: ID del negocio seleccionado
- `last_visitor_id`: Último visitante creado/encontrado
- `last_visit_id`: Última visita creada
- `last_property_unit_id`: Última unidad de propiedad utilizada

Estos IDs se reutilizan automáticamente en operaciones subsecuentes para facilitar el testing.

## Arquitectura

```
modules/visit/
├── bundle.go          # Punto de entrada, login y selección de propiedad
│                      # Incluye inicialización de BD y logger
├── state_manager.go   # Gestión de IDs reutilizables
├── menu.go            # Sistema de menús interactivos
│                      # Incluye menú de base de datos
├── handlers.go        # Implementación de llamadas a endpoints
│                      # Incluye handlers de consultas a BD
├── go.mod             # Configuración del módulo
└── README.md          # Esta documentación

shared/
├── testing_db.go      # Cliente de base de datos con GORM
├── testing_logger.go  # Logger estructurado con zerolog
├── auth.go            # Autenticación (main token + business token)
├── config.go          # Configuración de usuarios y parámetros
└── http_client.go     # Cliente HTTP para APIs
```

## Dependencias

- `github.com/rs/zerolog` - Logging estructurado
- `gorm.io/gorm` - ORM para Go
- `gorm.io/driver/postgres` - Driver de PostgreSQL para GORM
- `github.com/joho/godotenv` - Carga de variables de entorno

## Ejemplos de Uso

### Consulta SQL Personalizada

```sql
SELECT v.id, v.dni, v.full_name, vi.purpose, vi.scheduled_date
FROM visitor v
INNER JOIN visit vi ON vi.visitor_id = v.id
WHERE vi.business_id = 1
ORDER BY vi.scheduled_date DESC
LIMIT 10;
```

### Estadísticas

El módulo proporciona estadísticas agregadas automáticamente:
- Total de visitas del negocio
- Visitas por estado (pendientes, activas, completadas)
- Visitas del día actual

### Verificación de Conexión

Muestra información del pool de conexiones:
- Conexiones abiertas
- Conexiones en uso
- Conexiones idle
- Conexiones esperando

## Notas Importantes

1. **Modo Resiliente**: Si la BD no está disponible, el módulo funciona en modo API únicamente
2. **Seguridad**: Las consultas SQL personalizadas solo permiten SELECT
3. **Logging**: Todas las consultas SQL se loguean con duración y detalles
4. **Pool de Conexiones**: Configurado con límites razonables (10 idle, 10 max)

## Troubleshooting

### Error de conexión a BD

```bash
⚠️  Advertencia: No se pudo conectar a la BD
```

**Solución**: Verifica las variables de entorno DB_* en .env

### Consultas lentas

Si ves warnings de "slow query", considera agregar índices a la BD o revisar la consulta.
