# 🚀 Central Reserve - Backend API
<!-- Build trigger: 2025-01-13 -->

## 📋 Resumen

**Central Reserve** es una API backend para gestión de reservas, desplegada en **AWS ECR Público** y lista para usar en cualquier entorno.

- **📦 Imagen**: `public.ecr.aws/d3a6d4r1/cam/reserve`
- **📏 Tamaño**: 55.4MB (optimizada con Alpine Linux)
- **🔒 Seguridad**: Usuario no-root, imagen minimalista
- **🌐 Galería**: https://gallery.ecr.aws/d3a6d4r1/cam/reserve

---

## 🚀 Inicio Rápido

### Opción 1: Script Automatizado (Recomendado)
```bash
# Desarrollo completo con todos los servicios
./scripts/build-podman.sh dev

# Solo build para producción
./scripts/build-podman.sh prod
```

### Opción 2: Ejecutar directamente desde ECR
```bash
# Crear archivo .env con tus variables
touch .env

# Ejecutar la aplicación
podman run --env-file .env -p 3050:3050 public.ecr.aws/d3a6d4r1/cam/reserve:backend-latest
```

### Opción 3: Usando podman-compose
```bash
# Desarrollo
cd docker
podman-compose -f docker-compose.dev.yml up -d

# Producción
podman-compose -f docker-compose.prod.yml up -d

# Verificar que esté funcionando
curl http://localhost:3050/health
```

### Opción 4: Makefile
```bash
# Ver todos los comandos disponibles
make help

# Entorno de desarrollo
make podman-dev

# Entorno de producción
make podman-prod

# Ver logs
make podman-logs
```

---

## 📋 Versiones Disponibles

| Tag | Descripción | Comando |
|-----|-------------|---------|
| `backend-latest` | Última versión estable | `podman pull public.ecr.aws/d3a6d4r1/cam/reserve:backend-latest` |
| `v1.0.0` | Primera versión de producción | `podman pull public.ecr.aws/d3a6d4r1/cam/reserve:v1.0.0` |
| `v1.0.1` | Versión mejorada | `podman pull public.ecr.aws/d3a6d4r1/cam/reserve:v1.0.1` |

---

## 🏗️ Servicios Incluidos

### 🛠️ Entorno de Desarrollo
- **central_reserve**: API Backend (puerto 3050)
- **postgres**: Base de datos PostgreSQL (puerto 5432)
- **redis**: Cache Redis (puerto 6379)
- **nats**: Mensajería NATS (puerto 4222)
- **nats_dashboard**: Dashboard NATS (puerto 8111)
- **adminer**: Gestor de base de datos (puerto 8080)

### 🚀 Entorno de Producción
- **central_reserve**: API Backend optimizado
- **postgres**: Base de datos PostgreSQL
- **redis**: Cache Redis
- **nats**: Mensajería NATS

---

## 🔧 Configuración

### Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto:

```env
# Configuración de la aplicación
APP_ENV=development
HTTP_PORT=3050
LOG_LEVEL=debug
JWT_SECRET=tu-jwt-secret-aqui

# Base de datos
DB_HOST=postgres
DB_USER=postgres
DB_PASS=password
DB_PORT=5432
DB_NAME=central_reserve
DB_LOG_LEVEL=info
PGSSLMODE=disable

# Swagger
URL_BASE_SWAGGER=http://localhost:3050

# Email (opcional)
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=tu-email@outlook.com
SMTP_PASS=tu-contraseña
FROM_EMAIL=tu-email@outlook.com
SMTP_USE_STARTTLS=true
SMTP_USE_TLS=false
```

### Puertos Utilizados
- **3050**: API Backend
- **5432**: PostgreSQL
- **6379**: Redis
- **4222**: NATS
- **8111**: NATS Dashboard
- **8080**: Adminer

---

## 🚀 Despliegue y Desarrollo

### **Desplegar nueva versión**
```bash
# Versión automática (latest + timestamp)
./scripts/deploy-podman.sh

# Versión específica
./scripts/deploy-podman.sh v1.0.2

# Versión de desarrollo
./scripts/deploy-podman.sh dev
```

### **Desarrollo local**
```bash
# Construir imagen local
podman build -f docker/Dockerfile -t central-reserve .

# Ejecutar en desarrollo
podman run --env-file .env -p 3050:3050 central-reserve
```

### **CI/CD Automático**
El proyecto incluye GitHub Actions que automáticamente:
- ✅ Ejecuta tests
- ✅ Construye la imagen con Podman
- ✅ Deploya a ECR en cada push a `main`
- ✅ Despliega al servidor usando Podman Compose
- ✅ Crea tags automáticos para releases

---

## 🌐 Configuración de Entornos

### **Desarrollo**
```bash
# .env para desarrollo
APP_ENV=development
HTTP_PORT=3050
LOG_LEVEL=debug
DB_HOST=localhost
# ... más variables
```

### **Producción**
```bash
# .env para producción
APP_ENV=production
HTTP_PORT=3050
LOG_LEVEL=info
DB_HOST=prod-database-host
JWT_SECRET=production-super-secret-key
# ... más variables
```

### **Staging**
```bash
# Usar tag específico para staging
podman run --env-file .env.staging -p 3050:3050 public.ecr.aws/d3a6d4r1/cam/reserve:v1.0.1
```

---

## 🛠️ Comandos Útiles

### Gestión de Contenedores
```bash
# Ver contenedores activos
podman ps

# Ver logs en tiempo real
make podman-logs

# Ver logs de todos los servicios
make podman-logs-all

# Detener todos los servicios
make podman-stop

# Reiniciar servicios
podman-compose -f docker/docker-compose.dev.yml restart
```

### Base de Datos
```bash
# Acceder a PostgreSQL
podman exec -it postgres_dev psql -U postgres -d central_reserve

# Resetear base de datos
make db-reset

# Ver logs de PostgreSQL
podman logs postgres_dev
```

### Desarrollo
```bash
# Rebuild de la imagen
make podman-build

# Ejecutar tests
make test

# Verificar salud de servicios
make health

# Probar envío de emails
make test-email
```

### Gestión de Imágenes
```bash
# Limpiar imágenes locales
podman image prune -f

# Ver todas las imágenes del proyecto
podman images | grep central-reserve

# Eliminar imagen específica
podman rmi public.ecr.aws/d3a6d4r1/cam/reserve:old-version
```

---

## 📊 Monitoreo y Salud

### **Healthcheck**
```bash
# Verificar salud de la aplicación
curl http://localhost:3050/health

# Respuesta esperada: 200 OK
```

### **Logs**
```bash
# Ver logs en tiempo real
podman logs -f central_reserve_prod

# Logs con podman-compose
podman-compose -f docker/docker-compose.prod.yml logs -f central_reserve
```

### **Métricas**
```bash
# Swagger UI disponible en:
http://localhost:3050/docs

# API docs:
http://localhost:3050/api/v1/docs
```

### Logs Estructurados
Los logs incluyen:
- Timestamp
- Nivel de log (INFO, ERROR, WARN)
- Contexto de la operación
- Métricas de rendimiento

### Métricas Disponibles
- Latencia de requests HTTP
- Estado de conexiones a BD
- Uso de memoria y CPU
- Errores y excepciones

---

## 🔍 Troubleshooting

### Problemas Comunes

#### 1. Puerto ya en uso
```bash
# Ver qué está usando el puerto
sudo lsof -i :3050

# Matar proceso
sudo kill -9 <PID>
```

#### 2. Contenedor no inicia
```bash
# Ver logs detallados
podman logs central_reserve_dev

# Verificar variables de entorno
podman exec central_reserve_dev env | grep -E "(DB_|SMTP_)"
```

#### 3. Base de datos no conecta
```bash
# Verificar que PostgreSQL esté corriendo
podman ps | grep postgres

# Ver logs de PostgreSQL
podman logs postgres_dev

# Probar conexión
podman exec -it postgres_dev pg_isready -U postgres
```

#### 4. Permisos de archivos
```bash
# Dar permisos al script
chmod +x scripts/build-podman.sh

# Si hay problemas con volúmenes
sudo chown -R $USER:$USER .
```

### Troubleshooting Avanzado
```bash
# Ejecutar contenedor en modo interactivo
podman run -it --env-file .env public.ecr.aws/d3a6d4r1/cam/reserve:backend-latest sh

# Verificar variables de entorno
podman run --env-file .env public.ecr.aws/d3a6d4r1/cam/reserve:backend-latest env

# Verificar conectividad a base de datos
podman run --env-file .env --rm public.ecr.aws/d3a6d4r1/cam/reserve:backend-latest ping $DB_HOST
```

### Limpieza
```bash
# Limpieza completa
make clean-all

# Solo contenedores
podman-compose -f docker/docker-compose.dev.yml down -v

# Solo imágenes
podman rmi central-reserve:latest
```

---

## 🔒 Seguridad

### **Variables de Entorno**
- ❌ **NUNCA** hardcodear credenciales en la imagen
- ✅ Usar archivos `.env` diferentes por entorno
- ✅ Rotar credenciales regularmente
- ✅ Usar gestores de secretos en producción

### **Configuración Segura**
```bash
# Generar JWT secret fuerte
openssl rand -base64 32

# Ejecutar con usuario no-root (ya configurado)
podman run --user 1000:1000 --env-file .env -p 3050:3050 public.ecr.aws/d3a6d4r1/cam/reserve:backend-latest
```

### Buenas Prácticas Implementadas
- ✅ Usuario no-root en contenedores
- ✅ Imagen minimalista (Alpine)
- ✅ Variables de entorno para secretos
- ✅ Health checks configurados
- ✅ Volúmenes persistentes para datos
- ✅ Red aislada para servicios

### Recomendaciones de Producción
- Usar secrets management (Docker Secrets, AWS Secrets Manager)
- Configurar backup automático de PostgreSQL
- Implementar rate limiting
- Configurar SSL/TLS para HTTPS
- Monitoreo con Prometheus/Grafana

---

## 🚀 Despliegue a Producción

### 1. Build de Producción
```bash
./scripts/build-podman.sh prod v1.0.0
```

### 2. Configurar Variables de Producción
```env
APP_ENV=production
LOG_LEVEL=info
# Configurar credenciales reales de BD y email
```

### 3. Desplegar
```bash
podman-compose -f docker/docker-compose.prod.yml up -d
```

### 4. Verificar
```bash
# Health check
curl http://tu-servidor:3050/health

# Logs
podman-compose -f docker/docker-compose.prod.yml logs -f
```

---

## 📞 Información del Sistema

### **Especificaciones Técnicas**
- **Go Version**: 1.23
- **Base Image**: Alpine Linux 3.19
- **Architecture**: Multi-stage build optimizado
- **Size**: 55.4MB
- **User**: appuser (non-root)

### **Puertos**
- **HTTP**: 3050
- **Healthcheck**: 3050/health
- **Docs**: 3050/docs

### **Contacto**
- **Repositorio**: https://github.com/your-repo/central-reserve
- **ECR Gallery**: https://gallery.ecr.aws/d3a6d4r1/cam/reserve
- **Issues**: GitHub Issues

---

## 🎯 Próximos Pasos

1. **Configurar monitoreo** (Prometheus, Grafana)
2. **Implementar alertas** (PagerDuty, Slack)
3. **Configurar backup automático** de la base de datos
4. **Implementar scaling horizontal** (Docker Swarm, Kubernetes)
5. **Configurar CDN** para assets estáticos

---

## 📚 Recursos Adicionales

- [Podman Documentation](https://docs.podman.io/)
- [Podman Compose](https://github.com/containers/podman-compose)
- [PostgreSQL Podman](https://hub.docker.com/_/postgres)
- [Redis Podman](https://hub.docker.com/_/redis)
- [NATS Podman](https://hub.docker.com/_/nats)
