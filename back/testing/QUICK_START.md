# Quick Start - Módulo Visit

## 🚀 Inicio Rápido

### 1. Configurar el archivo .env

El archivo `.env` ya está creado. Verifica que tenga las siguientes variables:

```bash
# API Configuration
API_BASE_URL=http://localhost:8081/api/v1

# Database Configuration
DB_HOST=3.220.183.29
DB_USER=postgres
DB_PASS=LnyJdPXOahoaMuuD7b0tG8JG
DB_PORT=5433
DB_NAME=postgres
PGSSLMODE=disable
DB_LOG_LEVEL=info

# Logging
LOG_LEVEL=info

# Test Users (configura al menos uno)
TEST_USER1_EMAIL=admin@horizontalproperty.com
TEST_USER1_PASSWORD=admin123
TEST_USER1_NAME=Admin Principal

TEST_USER2_EMAIL=security@horizontalproperty.com
TEST_USER2_PASSWORD=security123
TEST_USER2_NAME=Guardia Seguridad

TEST_USER3_EMAIL=resident@horizontalproperty.com
TEST_USER3_PASSWORD=resident123
TEST_USER3_NAME=Residente Test

# Business Configuration
HORIZONTAL_PROPERTY_BUSINESS_TYPE_ID=2
```

### 2. Ejecutar el módulo

```bash
# Opción 1: Ejecutar binario compilado
./bin/testing -module visit

# Opción 2: Ejecutar con go run
go run cmd/main.go -module visit
```

### 3. Flujo de uso

#### Paso 1: Lista de Usuarios
```
════════════════════════════════════════════════════════════
👤 USUARIOS DISPONIBLES
════════════════════════════════════════════════════════════

  [1] Admin Principal
      Email: admin@horizontalproperty.com

  [2] Guardia Seguridad
      Email: security@horizontalproperty.com

  [3] Residente Test
      Email: resident@horizontalproperty.com

➤ Seleccione un usuario (1-3) o 0 para salir: _
```

#### Paso 2: Autenticación
```
════════════════════════════════════════════════════════════
🔐 AUTENTICACIÓN
════════════════════════════════════════════════════════════

Intentando autenticar como: admin@horizontalproperty.com
Esperando respuesta del servidor...

✅ Autenticación exitosa
   Usuario: admin@horizontalproperty.com
   Nombre: Admin Principal
```

#### Paso 3: Selección de Propiedad
```
🏢 Propiedades Horizontales disponibles:
=========================================
1. Torres del Norte (ID: 1)
2. Edificio Central (ID: 5)

Seleccione propiedad (1-N): 1

✓ Propiedad seleccionada: Torres del Norte (ID: 1)
```

#### Paso 4: Menú Principal
```
════════════════════════════════════════════════════════════
🚪 MENÚ PRINCIPAL - MÓDULO VISIT
════════════════════════════════════════════════════════════

[1] Gestión de Visitantes
[2] Gestión de Visitas
[3] Registro de Entradas/Salidas
[4] Acompañantes y Activos
[5] Catálogos (Tipos, Estados)
[6] Flujo Completo de Visita
[7] Consultas a Base de Datos
[8] Ver Estado Actual
[0] Salir

➤ Seleccione una opción: _
```

## 🐛 Solución de Problemas Comunes

### Error: "No hay usuarios configurados"

**Problema:**
```
❌ No hay usuarios configurados en .env
```

**Solución:**
Asegúrate de tener al menos un usuario configurado en `.env`:
```bash
TEST_USER1_EMAIL=tu@email.com
TEST_USER1_PASSWORD=tupassword
TEST_USER1_NAME=Tu Nombre
```

### Error: "Error en autenticación"

**Problema:**
```
❌ Error en autenticación: login falló con status 401
   Usuario: admin@example.com

Posibles causas:
  • Las credenciales son incorrectas
  • El usuario no existe en la base de datos
  • La API no está disponible
  • API actual: http://localhost:8081/api/v1
```

**Soluciones:**
1. Verifica que la API esté corriendo: `curl http://localhost:8081/api/v1/health`
2. Verifica las credenciales del usuario
3. Verifica que el usuario exista en la base de datos
4. Verifica que `API_BASE_URL` en `.env` sea correcta

### Error: "No se pudo conectar a la BD"

**Problema:**
```
⚠️  Advertencia: No se pudo conectar a la BD: error conectando...
   El módulo funcionará en modo API únicamente
```

**Solución:**
1. Verifica que PostgreSQL esté accesible
2. Verifica las variables `DB_*` en `.env`
3. El módulo puede funcionar sin BD (solo usará APIs)

### Error: "No hay propiedades horizontales disponibles"

**Problema:**
```
❌ Error seleccionando propiedad: no hay propiedades horizontales disponibles

Posibles causas:
  • El usuario no tiene acceso a ningún negocio
  • No hay propiedades horizontales asignadas
  • Business Type ID incorrecto: 2
```

**Soluciones:**
1. Verifica que el usuario tenga asignado al menos un business
2. Verifica que el business sea de tipo "Propiedad Horizontal"
3. Ajusta `HORIZONTAL_PROPERTY_BUSINESS_TYPE_ID` en `.env` si es necesario

## 📚 Comandos Útiles

```bash
# Ver logs en tiempo real
tail -f logs/app.log

# Compilar de nuevo
go build -o bin/testing cmd/main.go

# Actualizar dependencias
go mod tidy

# Ver ayuda
./bin/testing --help

# Ejecutar en modo verbose
./bin/testing -module visit -v
```

## 🎯 Ejemplos de Uso

### Probar el flujo completo de visita

1. Ejecutar: `./bin/testing -module visit`
2. Seleccionar usuario
3. Autenticar
4. Seleccionar propiedad
5. En el menú principal, seleccionar opción `[6] Flujo Completo de Visita`
6. El sistema ejecutará automáticamente:
   - Crear visitante
   - Crear visita
   - Registrar entrada
   - Registrar salida

### Consultar la base de datos

1. Ejecutar: `./bin/testing -module visit`
2. Completar login y selección de propiedad
3. En el menú principal, seleccionar opción `[7] Consultas a Base de Datos`
4. Opciones disponibles:
   - `[1]` Listar visitantes
   - `[2]` Listar visitas
   - `[3]` Ejecutar SQL personalizado
   - `[4]` Ver estadísticas
   - `[5]` Verificar conexión

### Ejecutar consulta SQL personalizada

1. Navegar a `[7] Consultas a Base de Datos`
2. Seleccionar `[3] Consulta SQL Personalizada`
3. Escribir la consulta (solo SELECT):

```sql
SELECT v.dni, v.full_name, COUNT(vi.id) as total_visits
FROM visitor v
LEFT JOIN visit vi ON vi.visitor_id = v.id
GROUP BY v.id
ORDER BY total_visits DESC
LIMIT 10;
```

## 💡 Tips

- Usa la opción `0` para cancelar en cualquier momento
- El módulo guarda los últimos IDs utilizados para facilitar el testing
- Puedes ejecutar sin conexión a BD (solo funcionará con APIs)
- Los logs se guardan en `logs/app.log` si la carpeta existe
- Presiona CTRL+C en cualquier momento para salir

---

¿Tienes preguntas? Revisa la [documentación completa](modules/visit/README.md)
