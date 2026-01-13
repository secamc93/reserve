# 📊 Configuración de PostgreSQL - Volumen Persistente

## ⚠️ IMPORTANTE: Mantener Datos Existentes

PostgreSQL debe usar el **mismo volumen** donde ya están los datos existentes en el EC2.

## 🔧 Opciones de Configuración

### Opción 1: Volumen Podman Existente (Recomendado si ya usas Podman)

Si ya tienes un volumen Podman con los datos:

```yaml
volumes:
  - postgres_data:/var/lib/postgresql/data
```

El volumen `postgres_data` se mantendrá entre reinicios.

### Opción 2: Bind Mount desde Filesystem del EC2

Si los datos están en el filesystem del EC2:

1. **Identificar la ubicación de los datos actuales**:
```bash
# En el EC2, encontrar dónde están los datos
sudo find / -name "postgresql" -type d 2>/dev/null
# O verificar volúmenes Docker/Podman existentes
podman volume ls
docker volume ls  # Si migraste de Docker
```

2. **Actualizar podman-compose.yaml**:
```yaml
volumes:
  # Reemplaza /opt/postgresql/data con la ruta real de tus datos
  - /opt/postgresql/data:/var/lib/postgresql/data
```

3. **Asegurar permisos**:
```bash
# En el EC2
sudo chown -R 999:999 /opt/postgresql/data  # 999 es el UID de postgres en el contenedor
sudo chmod -R 700 /opt/postgresql/data
```

### Opción 3: Migrar Datos a Nuevo Volumen

Si necesitas migrar datos existentes:

```bash
# 1. Backup de datos existentes
podman exec postgres_prod pg_dumpall -U postgres > backup.sql

# 2. Crear nuevo volumen
podman volume create postgres_data

# 3. Restaurar datos
podman run --rm -v postgres_data:/var/lib/postgresql/data \
  -v $(pwd):/backup postgres:15-alpine \
  sh -c "psql -U postgres -f /backup/backup.sql"
```

## 🔍 Verificar Volumen Actual

Para ver qué volumen está usando PostgreSQL actualmente:

```bash
# Ver volúmenes Podman
podman volume ls

# Inspeccionar volumen específico
podman volume inspect postgres_data

# Ver montajes del contenedor
podman inspect postgres_prod | grep -A 10 Mounts
```

## 📝 Notas

- **No elimines** el volumen existente sin hacer backup
- El volumen debe tener los permisos correctos (UID 999 para postgres)
- Si cambias de bind mount a volumen o viceversa, necesitarás migrar los datos
