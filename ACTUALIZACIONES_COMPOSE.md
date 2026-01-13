# 📝 Actualización Automática de podman-compose.yaml

## ✅ Cómo Funciona

### 1. Primera Vez (Manual)
**Sí, necesitas subir el archivo manualmente la primera vez:**

```bash
scp infra/compose-prod/podman-compose.yaml \
  ec2-user@TU_EC2_HOST:~/reserve/infra/compose-prod/
```

### 2. Actualizaciones Automáticas

**Sí, se actualiza automáticamente cuando:**
- Haces push a `main` o `develop` con cambios en `infra/compose-prod/**`
- El workflow de GitHub Actions detecta el cambio
- Automáticamente sube el nuevo `podman-compose.yaml` al EC2
- Ejecuta `podman-compose up -d` para aplicar los cambios

## 🔄 Flujo de Actualización

### Cuando cambias el código (frontend/backend/nginx):
1. GitHub Actions construye nuevas imágenes
2. Sube imágenes a ECR
3. Se conecta al EC2
4. Hace `podman-compose pull` (descarga nuevas imágenes)
5. Ejecuta `podman-compose up -d` (reinicia servicios)

### Cuando cambias `podman-compose.yaml`:
1. GitHub Actions detecta el cambio en `infra/compose-prod/**`
2. **Sube el nuevo archivo al EC2** (automáticamente)
3. Ejecuta `podman-compose up -d` (aplica nueva configuración)

## 📋 Workflows Configurados

### `deploy.yml` (Principal)
- **Se activa cuando cambia:**
  - `front/rupu-central/**`
  - `back/central-reserve/**`
  - `infra/nginx/**`
  - `infra/compose-prod/**` ✅ (sube el compose)
- **Qué hace:**
  - Construye imágenes
  - Sube a ECR
  - **Sube podman-compose.yaml al EC2** ✅
  - Despliega servicios

### `deploy-all.yml` (Manual)
- **Se activa cuando:**
  - Cambios en `infra/compose-prod/**`
  - O ejecución manual (workflow_dispatch)
- **Qué hace:**
  - **Sube podman-compose.yaml al EC2** ✅
  - Hace pull de todas las imágenes
  - Despliega todos los servicios

## ⚠️ Importante

### Terraform NO actualiza el compose
- Terraform solo gestiona **infraestructura** (ECR, IAM, etc.)
- **NO** actualiza archivos en el EC2
- El compose se actualiza mediante **GitHub Actions**

### Archivo .env
- El archivo `.env` **NO** se sube automáticamente
- Debes subirlo manualmente o configurarlo directamente en el EC2
- Contiene información sensible (contraseñas, secrets)

## 🚀 Próximos Pasos

1. **Subir podman-compose.yaml la primera vez** (manual)
2. **Subir .env** (manual, una vez)
3. **Las actualizaciones futuras son automáticas** ✅

## 📝 Ejemplo de Actualización

```bash
# 1. Editas podman-compose.yaml localmente
# 2. Haces commit y push
git add infra/compose-prod/podman-compose.yaml
git commit -m "Actualizar configuración de servicios"
git push origin main

# 3. GitHub Actions automáticamente:
#    - Detecta el cambio
#    - Sube el nuevo archivo al EC2
#    - Aplica los cambios con podman-compose up -d
```
