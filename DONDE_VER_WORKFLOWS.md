# 📍 Dónde Ver los Workflows en GitHub Actions

## 🔍 Cómo Encontrar "Deploy All Services"

1. **Ve a tu repositorio en GitHub:**
   ```
   https://github.com/secamc93/reserve
   ```

2. **Haz clic en la pestaña "Actions"** (arriba)

3. **En el sidebar izquierdo**, deberías ver:
   - `.github/workflows/deploy-all.yml` ← **Este es el workflow "Deploy All Services"**
   - `Deploy Services (Frontend, Backend, Nginx)`
   - `Backend CI/CD`
   - `Frontend CI/CD`
   - `Test Workflow`

4. **Si no aparece**, puede ser que:
   - GitHub aún no haya detectado el cambio (espera unos segundos y refresca)
   - Necesitas hacer un push nuevo para que GitHub lo detecte

## 🚀 Cómo Ejecutar "Deploy All Services"

### Opción 1: Automático
- Se ejecuta automáticamente en cada push a `main` o `develop`

### Opción 2: Manual
1. Ve a Actions
2. Selecciona `.github/workflows/deploy-all.yml` o "Deploy All Services"
3. Haz clic en "Run workflow" (botón azul arriba a la derecha)
4. Selecciona la rama `main`
5. Haz clic en "Run workflow"

## 📋 Si No Aparece

Si después de refrescar no aparece, verifica:

```bash
# Verificar que el archivo está en git
git ls-files .github/workflows/deploy-all.yml

# Si no está, agregarlo
git add .github/workflows/deploy-all.yml
git commit -m "add: workflow deploy-all"
git push origin main
```

## 🔄 Refrescar GitHub

- Presiona `Ctrl+F5` o `Cmd+Shift+R` para refrescar la página
- O espera unos segundos y GitHub debería detectarlo automáticamente
