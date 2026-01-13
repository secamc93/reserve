# 🧪 Cómo Probar los Workflows

## 📋 Workflows Disponibles

### 1. **Deploy All Services** (Recomendado para probar)
- **Ubicación**: Actions → Deploy All Services
- **Tipo**: Manual (workflow_dispatch)
- **Qué hace**: Levanta todos los servicios en el EC2
- **Cuándo usar**: Cuando quieras levantar/actualizar todos los servicios

**Cómo ejecutarlo:**
1. Ve a GitHub Actions
2. Selecciona "Deploy All Services"
3. Haz clic en "Run workflow"
4. Selecciona rama `main`
5. Haz clic en "Run workflow"

### 2. **Deploy Services (Frontend, Backend, Nginx)** (Automático)
- **Ubicación**: Actions → Deploy Services
- **Tipo**: Automático (se ejecuta cuando hay cambios)
- **Qué hace**: 
  - Detecta qué cambió
  - Construye solo los servicios que cambiaron
  - Despliega al EC2
- **Cuándo usar**: Automáticamente cuando haces push con cambios en:
  - `front/rupu-central/**`
  - `back/central-reserve/**`
  - `infra/nginx/**`
  - `infra/compose-prod/**`

## 🔍 Por qué se saltó el Deploy

Si ves que "Deploy to EC2" se saltó, es porque:
- No se detectaron cambios en los paths configurados
- O los jobs de build se saltaron (porque no había cambios)

## ✅ Cómo Verificar que Funcionó

### Opción 1: Usar "Deploy All Services" (Manual)
Este workflow siempre funciona porque es manual y no depende de detectar cambios.

### Opción 2: Hacer un cambio que active el workflow automático
```bash
# Hacer un cambio pequeño en algún servicio
echo "# Test" >> front/rupu-central/README.md
git add front/rupu-central/README.md
git commit -m "test: activar workflow automático"
git push origin main
```

### Opción 3: Verificar en el EC2
```bash
# Conectarse al EC2
ssh -i /home/cam/Desktop/cam.pem ubuntu@ec2-3-220-183-29.compute-1.amazonaws.com

# Verificar servicios
cd ~/reserve/infra/compose-prod
podman-compose -f podman-compose.yaml ps
```

## 🎯 Recomendación

Para probar ahora mismo, usa **"Deploy All Services"** porque:
- ✅ Es manual (siempre funciona)
- ✅ No depende de detectar cambios
- ✅ Levanta todos los servicios directamente
- ✅ Muestra logs y estado
