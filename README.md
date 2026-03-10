# 🚀 Rupü - Sistema Multi-Tarea

## 📋 Resumen

**Rupü** es un monorepo que integra múltiples sistemas para la gestión completa de restaurantes, logística e inventarios. Diseñado como una plataforma modular y escalable, ofrece soluciones integrales para la industria gastronómica.

### 🎯 **Sistemas Integrados**
- 🍽️ **Restaurantes**: Gestión de reservas, menús y operaciones
- 🚚 **Logística**: Control de entregas y distribución
- 📦 **Inventarios**: Gestión de stock y proveedores

---

## 🏗️ Arquitectura del Monorepo

```
rupü/
├── 🍽️ front/                    # Aplicaciones Frontend
│   ├── reserve_app/            # App de reservas (React)
│   └── website/                # Sitio web corporativo (Astro)
├── 🔧 back/                    # Servicios Backend
│   ├── central-reserve/        # API principal (Go)
│   └── dbpostgres/             # Servicio de base de datos
├── 📱 mobile/                  # Aplicación móvil
│   └── rupu/                   # App Flutter
└── 🐳 infra/                   # Infraestructura y despliegue
    ├── compose-prod/           # Docker Compose producción
    ├── nginx/                  # Configuración de proxy
    └── scripts/                # Scripts de automatización
```

---

## 🚀 Inicio Rápido

### Prerrequisitos
- **Docker** y **Docker Compose** (o Podman)
- **Node.js** (para desarrollo frontend)
- **pnpm** (gestor de paquetes para frontend)
- **Go** (para desarrollo backend)
- **Flutter** (para desarrollo móvil)

### ⚡ Makefile Centralizado (Recomendado)

El proyecto incluye un **Makefile centralizado** en la raíz que simplifica la ejecución de todos los servicios:

```bash
# Ver todos los comandos disponibles
make help

# Ejecutar backend (Go API en :3050)
make run-centralback

# Ejecutar frontend (Next.js en :3000)
make run-centralfront

# Ejecutar migraciones de base de datos
make run-migrations

# Ver información del sistema
make info
```

📚 **Documentación completa:**
- [QUICK_START.md](QUICK_START.md) - Guía de inicio rápido
- [MAKEFILE_GUIDE.md](MAKEFILE_GUIDE.md) - Documentación detallada del Makefile

### 1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/rupu.git
cd rupu
```

### 2. **Despliegue completo con Docker**
```bash
# Desplegar todos los servicios
./infra/scripts/build-all.sh

# O desplegar por componentes
./infra/scripts/build-backend.sh
./infra/scripts/build-frontend-only.sh
```

### 3. **Verificar servicios**
```bash
# Backend API
curl http://localhost:3050/health

# Frontend App
open http://localhost:3000

# Website
open http://localhost:4321
```

---

## 🍽️ Sistema de Restaurantes

### **Frontend - App de Reservas**
- **Tecnología**: React.js
- **Puerto**: 3000
- **Características**:
  - Gestión de reservas en tiempo real
  - Interfaz intuitiva para clientes
  - Dashboard administrativo
  - Notificaciones automáticas

### **Backend - API Central**
- **Tecnología**: Go (Gin)
- **Puerto**: 3050
- **Características**:
  - API RESTful completa
  - Autenticación JWT
  - Sistema de emails automático
  - Documentación Swagger
  - Base de datos PostgreSQL

### **Despliegue del Sistema de Restaurantes**
```bash
# Solo el sistema de restaurantes
cd back/central-reserve
./scripts/build-docker.sh dev

# O usando docker-compose
cd docker
docker-compose -f docker-compose.dev.yml up -d
```

---

## 🚚 Sistema de Logística

### **Características Principales**
- Seguimiento de entregas en tiempo real
- Gestión de rutas optimizadas
- Notificaciones de estado
- Integración con GPS
- Reportes de eficiencia

### **Despliegue**
```bash
# El sistema de logística se despliega junto con el backend principal
# Configurar variables específicas en .env
LOGISTICS_ENABLED=true
GPS_INTEGRATION=true
```

---

## 📦 Sistema de Inventarios

### **Funcionalidades**
- Control de stock en tiempo real
- Alertas de inventario bajo
- Gestión de proveedores
- Reportes de consumo
- Integración con punto de venta

### **Configuración**
```bash
# Habilitar módulo de inventarios
INVENTORY_ENABLED=true
STOCK_ALERTS=true
```

---

## 📱 Aplicación Móvil

### **Tecnología**: Flutter
- **Plataformas**: iOS, Android, Web
- **Características**:
  - Interfaz nativa multiplataforma
  - Sincronización offline
  - Notificaciones push
  - Escáner de códigos QR

### **Desarrollo Móvil**
```bash
cd mobile/rupu
flutter pub get
flutter run
```

---

## 🐳 Despliegue con Docker

### **Arquitectura de Contenedores**

```yaml
# Servicios principales
central-reserve:    # API Backend (Go)
postgres:          # Base de datos
redis:             # Cache
nats:              # Mensajería

# Frontend
reserve-app:       # React App
website:           # Astro Website

# Infraestructura
nginx:             # Proxy reverso
```

### **Comandos de Despliegue**

#### **Desarrollo Local**
```bash
# Desplegar todo el stack
./infra/scripts/build-all.sh dev

# Solo backend
./infra/scripts/build-backend.sh

# Solo frontend
./infra/scripts/build-frontend-only.sh
```

#### **Producción**
```bash
# Desplegar en producción
./infra/scripts/build-all.sh prod

# Usar docker-compose de producción
docker-compose -f infra/compose-prod/docker-compose.yaml up -d
```

### **Variables de Entorno**
```bash
# Crear archivos de configuración
cp .env.example .env
cp .env.example .env.prod

# Configurar variables específicas por entorno
APP_ENV=production
DB_HOST=prod-database
JWT_SECRET=tu-secret-super-seguro
```

---

## 🔧 Desarrollo

### **Estructura de Desarrollo**
```bash
# Backend (Go)
cd back/central-reserve
go mod tidy
go run cmd/main.go

# Frontend (React)
cd front/reserve_app
npm install
npm start

# Website (Astro)
cd front/website
npm install
npm run dev

# Móvil (Flutter)
cd mobile/rupu
flutter pub get
flutter run
```

### **Scripts Útiles**
```bash
# Limpiar cache
./scripts/clean-cache.sh

# Verificar pre-commit
./scripts/pre-commit-check.sh

# Desplegar específico
./infra/scripts/deploy.sh [servicio] [entorno]
```

---

## 📊 Monitoreo y Logs

### **Health Checks**
```bash
# Backend API
curl http://localhost:3050/health

# Frontend App
curl http://localhost:3000

# Website
curl http://localhost:4321
```

### **Logs**
```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Logs específicos
docker logs central_reserve_dev
docker logs reserve_app_dev
```

---

## 🔒 Seguridad

### **Buenas Prácticas Implementadas**
- ✅ Usuarios no-root en contenedores
- ✅ Variables de entorno para secretos
- ✅ Imágenes minimalistas (Alpine)
- ✅ Health checks configurados
- ✅ Redes aisladas por servicio
- ✅ Volúmenes persistentes

### **Configuración de Seguridad**
```bash
# Generar JWT secret fuerte
openssl rand -base64 32

# Configurar SSL/TLS en producción
# Configurar rate limiting
# Implementar autenticación 2FA
```

---

## 🚀 Despliegue a Producción

### **1. Preparar entorno**
```bash
# Configurar variables de producción
cp .env.example .env.prod
# Editar .env.prod con valores reales
```

### **2. Build de producción**
```bash
# Build completo
./infra/scripts/build-all.sh prod

# O por componentes
./infra/scripts/build-backend.sh prod
./infra/scripts/build-frontend-only.sh prod
```

### **3. Desplegar**
```bash
# Usar docker-compose de producción
docker-compose -f infra/compose-prod/docker-compose.yaml up -d
```

### **4. Verificar**
```bash
# Health checks
curl https://tu-dominio.com/health

# Ver logs
docker-compose -f infra/compose-prod/docker-compose.yaml logs -f
```

---

## 📞 Información del Proyecto

### **Tecnologías Utilizadas**
- **Backend**: Go, Gin, PostgreSQL, Redis, NATS
- **Frontend**: React.js, Astro, TypeScript
- **Móvil**: Flutter, Dart
- **Infraestructura**: Docker, Docker Compose, Nginx
- **CI/CD**: GitHub Actions

### **Puertos por Defecto**
- **3050**: API Backend
- **3000**: React App
- **4321**: Astro Website
- **5432**: PostgreSQL
- **6379**: Redis
- **4222**: NATS

### **Contacto**
- **Repositorio**: https://github.com/tu-usuario/rupu
- **Documentación**: [Wiki del proyecto]
- **Issues**: GitHub Issues

---

## 🎯 Próximos Pasos

1. **Implementar CI/CD completo** con GitHub Actions
2. **Configurar monitoreo** (Prometheus, Grafana)
3. **Implementar testing automatizado**
4. **Configurar backup automático** de bases de datos
5. **Implementar scaling horizontal** (Kubernetes)
6. **Añadir más módulos** (contabilidad, RRHH, etc.)

---

## 📚 Documentación Adicional

- [Backend API Docs](back/central-reserve/README.md)
- [Frontend App Docs](front/reserve_app/README.md)
- [Mobile App Docs](mobile/rupu/README.md)
- [Infrastructure Docs](infra/README.md)