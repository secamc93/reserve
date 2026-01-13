# 🌿 Ramas y Actualizaciones - Explicación Completa

## 📋 Respuestas a tus Preguntas

### 1. ¿A qué rama se actualizará?

**Rama `main`:**
- ✅ Construye imágenes
- ✅ Sube a ECR
- ✅ **Despliega a producción en EC2**

**Rama `develop`:**
- ✅ Construye imágenes
- ✅ Sube a ECR
- ❌ **NO despliega** (solo para testing)

### 2. ¿Son tres repositorios?

**NO**, es un **MONOREPO** con 3 servicios:
- `front/rupu-central/` → Frontend (Next.js)
- `back/central-reserve/` → Backend (Go)
- `infra/nginx/` → Nginx

**SÍ**, hay 3 repositorios ECR (donde se guardan las imágenes):
- `rupu-frontend` en ECR privado
- `rupu-backend` en ECR privado
- `rupu-nginx` en ECR privado

### 3. ¿Siempre se actualizarán los 3?

**ANTES (ineficiente):**
- ❌ Construía los 3 siempre, aunque solo uno cambiara

**AHORA (optimizado):**
- ✅ Solo construye/despliega los servicios que **realmente cambiaron**
- ✅ Usa detección de cambios por paths

## 🔄 Cómo Funciona Ahora (Optimizado)

### Escenario 1: Cambias solo Frontend
```bash
# Editas archivos en front/rupu-central/
git add front/rupu-central/
git commit -m "Actualizar frontend"
git push origin main
```

**Resultado:**
- ✅ Construye **solo frontend**
- ❌ NO construye backend
- ❌ NO construye nginx
- ✅ Despliega **solo frontend** en EC2

### Escenario 2: Cambias solo Backend
```bash
# Editas archivos en back/central-reserve/
git add back/central-reserve/
git commit -m "Actualizar backend"
git push origin main
```

**Resultado:**
- ❌ NO construye frontend
- ✅ Construye **solo backend**
- ❌ NO construye nginx
- ✅ Despliega **solo backend** en EC2

### Escenario 3: Cambias podman-compose.yaml
```bash
# Editas infra/compose-prod/podman-compose.yaml
git add infra/compose-prod/podman-compose.yaml
git commit -m "Actualizar compose"
git push origin main
```

**Resultado:**
- ❌ NO construye imágenes (no cambiaron)
- ✅ Sube el nuevo `podman-compose.yaml` al EC2
- ✅ Ejecuta `podman-compose up -d` (aplica nueva configuración)

### Escenario 4: Cambias múltiples servicios
```bash
# Editas frontend Y backend
git add front/rupu-central/ back/central-reserve/
git commit -m "Actualizar frontend y backend"
git push origin main
```

**Resultado:**
- ✅ Construye **frontend**
- ✅ Construye **backend**
- ❌ NO construye nginx
- ✅ Despliega **frontend y backend** en EC2

## 📊 Tabla de Comportamiento

| Cambio en | Construye | Despliega |
|-----------|-----------|-----------|
| `front/rupu-central/**` | Solo Frontend | Solo Frontend |
| `back/central-reserve/**` | Solo Backend | Solo Backend |
| `infra/nginx/**` | Solo Nginx | Solo Nginx |
| `infra/compose-prod/**` | Ninguno | Todos (nueva config) |
| Múltiples paths | Los que cambiaron | Los que cambiaron |

## 🎯 Ventajas de la Optimización

1. **Más rápido**: Solo construye lo necesario
2. **Más económico**: Menos tiempo de CI/CD
3. **Más seguro**: Menos riesgo de romper servicios que no cambiaron
4. **Mejor para debugging**: Sabes exactamente qué se actualizó

## ⚠️ Nota Importante

Si cambias `podman-compose.yaml`, se despliegan **todos los servicios** porque la configuración afecta a todos, aunque las imágenes no cambien.

## 🚀 Flujo Completo

```
Push a main
    ↓
Detecta cambios (paths-filter)
    ↓
¿Qué cambió?
    ├─ frontend → Construye frontend → Despliega frontend
    ├─ backend → Construye backend → Despliega backend
    ├─ nginx → Construye nginx → Despliega nginx
    └─ compose → Sube compose → Despliega todos
```
