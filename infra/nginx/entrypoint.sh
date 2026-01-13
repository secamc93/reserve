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

# Resolver rutas reales de los symlinks
REAL_CERT_PATH=$(readlink -f "$SSL_CERT_PATH" 2>/dev/null || echo "$SSL_CERT_PATH")
REAL_KEY_PATH=$(readlink -f "$SSL_KEY_PATH" 2>/dev/null || echo "$SSL_KEY_PATH")

echo "🔗 Resolviendo symlinks:"
echo "   SSL_CERT_PATH: $SSL_CERT_PATH -> $REAL_CERT_PATH"
echo "   SSL_KEY_PATH: $SSL_KEY_PATH -> $REAL_KEY_PATH"

# Verificar si los certificados existen usando -L para seguir symlinks
# -L hace que -f siga los symlinks y verifique el archivo real
if [ -f "$SSL_CERT_PATH" ] || [ -L "$SSL_CERT_PATH" ]; then
  # Verificar que el archivo real al que apunta el symlink existe y es legible
  if [ -f "$REAL_CERT_PATH" ] && [ -r "$REAL_CERT_PATH" ]; then
    CERT_EXISTS=true
  elif [ -r "$SSL_CERT_PATH" ]; then
    # Si el symlink mismo es legible, intentar leerlo directamente
    CERT_EXISTS=true
  else
    CERT_EXISTS=false
  fi
else
  CERT_EXISTS=false
fi

if [ -f "$SSL_KEY_PATH" ] || [ -L "$SSL_KEY_PATH" ]; then
  if [ -f "$REAL_KEY_PATH" ] && [ -r "$REAL_KEY_PATH" ]; then
    KEY_EXISTS=true
  elif [ -r "$SSL_KEY_PATH" ]; then
    KEY_EXISTS=true
  else
    KEY_EXISTS=false
  fi
else
  KEY_EXISTS=false
fi

if [ "$CERT_EXISTS" = false ] || [ "$KEY_EXISTS" = false ]; then
  echo "⚠️  Advertencia: Certificados SSL no encontrados o no accesibles:"
  echo "   SSL_CERT_PATH: $SSL_CERT_PATH"
  echo "   SSL_KEY_PATH: $SSL_KEY_PATH"
  echo ""
  echo "🔍 Verificando permisos..."
  if [ -L "$SSL_CERT_PATH" ] || [ -f "$SSL_CERT_PATH" ]; then
    echo "   📄 Certificado (symlink/archivo existe):"
    ls -la "$SSL_CERT_PATH" 2>&1 || true
    if [ -L "$SSL_CERT_PATH" ]; then
      echo "   🔗 Apunta a: $(readlink -f "$SSL_CERT_PATH" 2>/dev/null || echo 'no se puede resolver')"
      if [ -f "$REAL_CERT_PATH" ]; then
        echo "   ✅ Archivo real existe: $REAL_CERT_PATH"
        ls -la "$REAL_CERT_PATH" 2>&1 || true
      else
        echo "   ❌ Archivo real NO existe: $REAL_CERT_PATH"
      fi
    fi
  fi
  if [ -L "$SSL_KEY_PATH" ] || [ -f "$SSL_KEY_PATH" ]; then
    echo "   🔑 Clave (symlink/archivo existe):"
    ls -la "$SSL_KEY_PATH" 2>&1 || true
    if [ -L "$SSL_KEY_PATH" ]; then
      echo "   🔗 Apunta a: $(readlink -f "$SSL_KEY_PATH" 2>/dev/null || echo 'no se puede resolver')"
      if [ -f "$REAL_KEY_PATH" ]; then
        echo "   ✅ Archivo real existe: $REAL_KEY_PATH"
        ls -la "$REAL_KEY_PATH" 2>&1 || true
      else
        echo "   ❌ Archivo real NO existe: $REAL_KEY_PATH"
      fi
    fi
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
  echo "✅ Certificados SSL encontrados y accesibles, usando configuración completa con HTTPS"
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
