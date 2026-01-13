#!/bin/sh
set -e

# Valores por defecto si las variables no están definidas
DOMAIN=${DOMAIN:-localhost}
SSL_CERT_PATH=${SSL_CERT_PATH:-/etc/letsencrypt/live/${DOMAIN}/fullchain.pem}
SSL_KEY_PATH=${SSL_KEY_PATH:-/etc/letsencrypt/live/${DOMAIN}/privkey.pem}

# Verificar si los certificados existen, si no, usar configuración sin SSL
if [ ! -f "$SSL_CERT_PATH" ] || [ ! -f "$SSL_KEY_PATH" ]; then
  echo "⚠️  Advertencia: Certificados SSL no encontrados en:"
  echo "   SSL_CERT_PATH: $SSL_CERT_PATH"
  echo "   SSL_KEY_PATH: $SSL_KEY_PATH"
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
