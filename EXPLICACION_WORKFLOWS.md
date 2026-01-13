# 📋 Explicación de Workflows y Ramas

## 🌿 Ramas Configuradas

### Workflow Principal: `deploy.yml`

**Se activa en:**
- `main` ✅ (construye Y despliega a producción)
- `develop` ✅ (solo construye, NO despliega)

**Despliegue a producción:**
- Solo cuando es push a `main` (línea 131: `if: github.ref == 'refs/heads/main'`)
- En `develop` solo construye las imágenes pero NO las despliega

## 📦 Repositorios

### NO son 3 repositorios separados
Es un **MONOREPO** con 3 servicios:
- `front/rupu-central/` → Frontend
- `back/central-reserve/` → Backend  
- `infra/nginx/` → Nginx

### 3 Repositorios ECR (sí)
- `rupu-frontend` en ECR
- `rupu-backend` en ECR
- `rupu-nginx` en ECR

## 🔄 ¿Siempre se actualizan los 3?

### Comportamiento Actual
**Sí, actualmente construye los 3 siempre** (usa matrix strategy)

### Comportamiento Ideal (Optimizado)
**Solo debería construir/desplegar los que cambiaron**

## 🎯 Cómo Funciona Ahora

### Cuando haces push a `main`:

1. **Si cambias `front/rupu-central/**`:**
   - ✅ Construye frontend
   - ✅ Construye backend (aunque no cambió)
   - ✅ Construye nginx (aunque no cambió)
   - ✅ Despliega los 3

2. **Si cambias `back/central-reserve/**`:**
   - ✅ Construye frontend (aunque no cambió)
   - ✅ Construye backend
   - ✅ Construye nginx (aunque no cambió)
   - ✅ Despliega los 3

3. **Si cambias `infra/compose-prod/**`:**
   - ✅ Construye los 3 (aunque no cambiaron)
   - ✅ Sube el nuevo compose al EC2
   - ✅ Despliega los 3

## ⚠️ Problema Actual

El workflow construye **siempre los 3 servicios** aunque solo uno haya cambiado. Esto es ineficiente.

## ✅ Solución Recomendada

Optimizar para que solo construya/despliegue los servicios que realmente cambiaron.

¿Quieres que optimice el workflow para que solo actualice los servicios que cambiaron?
