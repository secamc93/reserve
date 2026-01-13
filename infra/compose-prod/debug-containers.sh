#!/bin/bash
# Script para debug de contenedores que fallan

echo "🔍 Debug de contenedores que no arrancan"
echo "=========================================="
echo ""

# Verificar contenedores que fallaron
echo "📊 Contenedores con estado Exited:"
podman ps -a --filter "status=exited" --format "table {{.Names}}\t{{.Status}}\t{{.CreatedAt}}"
echo ""

# Ver logs de nginx
echo "📋 Logs de nginx_prod (últimas 50 líneas):"
echo "-------------------------------------------"
podman logs --tail 50 nginx_prod 2>&1 || echo "⚠️ No se pudieron obtener logs de nginx"
echo ""

# Ver logs de frontend
echo "📋 Logs de frontend_prod (últimas 50 líneas):"
echo "-----------------------------------------------"
podman logs --tail 50 frontend_prod 2>&1 || echo "⚠️ No se pudieron obtener logs de frontend"
echo ""

# Verificar variables de entorno en .env
echo "🔐 Verificando variables de entorno requeridas:"
echo "-----------------------------------------------"
if [ -f .env ]; then
  echo "✅ Archivo .env existe"
  echo ""
  echo "Variables relacionadas con nginx:"
  grep -E "DOMAIN|SSL_CERT|SSL_KEY" .env || echo "⚠️ No se encontraron variables DOMAIN, SSL_CERT_PATH o SSL_KEY_PATH"
else
  echo "❌ Archivo .env NO existe"
fi
echo ""

# Verificar si las variables están definidas en el compose
echo "📝 Variables en podman-compose.yaml para nginx:"
grep -A 5 "nginx:" podman-compose.yaml | grep -E "DOMAIN|SSL" || echo "⚠️ No se encontraron variables en compose"
echo ""

# Intentar ejecutar nginx manualmente para ver el error
echo "🧪 Intentando ejecutar nginx manualmente para ver el error:"
echo "-----------------------------------------------------------"
podman run --rm \
  -e DOMAIN="${DOMAIN:-localhost}" \
  -e SSL_CERT_PATH="${SSL_CERT_PATH:-/etc/letsencrypt/live/localhost/fullchain.pem}" \
  -e SSL_KEY_PATH="${SSL_KEY_PATH:-/etc/letsencrypt/live/localhost/privkey.pem}" \
  334689162817.dkr.ecr.us-east-1.amazonaws.com/rupu-nginx:latest \
  /entrypoint.sh 2>&1 | head -20 || echo "⚠️ Error al ejecutar nginx manualmente"
echo ""

echo "✅ Debug completado"
echo ""
echo "💡 Próximos pasos:"
echo "1. Revisa los logs arriba para identificar el error"
echo "2. Verifica que las variables DOMAIN, SSL_CERT_PATH y SSL_KEY_PATH estén en .env"
echo "3. Si nginx necesita certificados, asegúrate de que existan en /etc/letsencrypt"
