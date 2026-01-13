#!/bin/sh
set -e

# Valores por defecto si las variables no están definidas
DOMAIN=${DOMAIN:-localhost}
SSL_CERT_PATH=${SSL_CERT_PATH:-/etc/letsencrypt/live/${DOMAIN}/fullchain.pem}
SSL_KEY_PATH=${SSL_KEY_PATH:-/etc/letsencrypt/live/${DOMAIN}/privkey.pem}

# Debug: Verificar montaje del volumen
echo "🔍 Verificando montaje de /etc/letsencrypt..."
if [ -d "/etc/letsencrypt" ]; then
  echo "✅ Directorio /etc/letsencrypt existe"
  echo "📁 Contenido de /etc/letsencrypt:"
  ls -la /etc/letsencrypt/ 2>&1 | head -10 || echo "⚠️ No se puede listar contenido"
  
  # Verificar si existe el directorio del dominio
  DOMAIN_DIR="/etc/letsencrypt/live/${DOMAIN}"
  if [ -d "$DOMAIN_DIR" ]; then
    echo "✅ Directorio del dominio existe: $DOMAIN_DIR"
    echo "📁 Contenido del directorio del dominio:"
    ls -la "$DOMAIN_DIR" 2>&1 || echo "⚠️ No se puede listar contenido"
  else
    echo "⚠️ Directorio del dominio NO existe: $DOMAIN_DIR"
    echo "📁 Directorios disponibles en /etc/letsencrypt/live/:"
    ls -la /etc/letsencrypt/live/ 2>&1 || echo "⚠️ No se puede listar contenido"
  fi
else
  echo "❌ Directorio /etc/letsencrypt NO existe - el volumen no está montado"
fi

# Verificar si los certificados existen, si no, usar configuración sin SSL
if [ ! -f "$SSL_CERT_PATH" ] || [ ! -f "$SSL_KEY_PATH" ]; then
  echo "⚠️  Advertencia: Certificados SSL no encontrados en:"
  echo "   SSL_CERT_PATH: $SSL_CERT_PATH"
  echo "   SSL_KEY_PATH: $SSL_KEY_PATH"
  echo ""
  echo "🔍 Verificando permisos..."
  if [ -f "$SSL_CERT_PATH" ]; then
    echo "   ✅ Certificado existe pero puede tener problemas de permisos"
    ls -la "$SSL_CERT_PATH" 2>&1 || true
  fi
  if [ -f "$SSL_KEY_PATH" ]; then
    echo "   ✅ Clave existe pero puede tener problemas de permisos"
    ls -la "$SSL_KEY_PATH" 2>&1 || true
  fi
  echo "   Usando configuración HTTP solamente (sin HTTPS)"
  
  # Crear configuración temporal sin SSL
  cat > /etc/nginx/nginx.conf <<EOF
user  nginx;
worker_processes  1;

events {
    worker_connections  1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;
    
    server {
        listen 80;
        server_name ${DOMAIN};
        
        # Proxy al frontend
        location / {
            proxy_pass http://frontend:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_cache_bypass \$http_upgrade;
        }
        
        # Proxy al backend API
        location /api/ {
            proxy_pass http://central_reserve:3050;
            proxy_http_version 1.1;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }
    }
}
EOF
else
  echo "✅ Certificados SSL encontrados, usando configuración completa"
  # Usar la configuración normal con SSL
  envsubst '\$DOMAIN \$SSL_CERT_PATH \$SSL_KEY_PATH' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf
fi

# Validar configuración de nginx antes de iniciar
echo "🔍 Validando configuración de nginx..."
nginx -t || {
  echo "❌ Error en la configuración de nginx"
  exit 1
}

echo "✅ Configuración válida, iniciando nginx..."
exec nginx -g 'daemon off;'
