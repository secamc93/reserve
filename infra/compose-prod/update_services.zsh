#!/usr/bin/env zsh
#
# update_services.zsh
# Uso: ./update_services.zsh [ruta-a-docker-compose.yml]
#

set -euo pipefail

# 1) Configuración
COMPOSE_FILE=${1:-docker-compose.yaml}
SKIP_SERVICE="postgres"

# 2) Obtengo todos los servicios (nombres) excepto el de Postgres
SERVICES=($(docker compose -f "$COMPOSE_FILE" config --services | grep -v "^$SKIP_SERVICE$"))

if [[ ${#SERVICES[@]} -eq 0 ]]; then
  echo "⚠️  No se encontraron servicios distintos de '$SKIP_SERVICE'."
  exit 1
fi

echo "🔄 Servicios a actualizar: ${SERVICES[*]}"

# 3) Paro y elimino contenedores de esos servicios
docker compose -f "$COMPOSE_FILE" stop ${SERVICES[*]}
docker compose -f "$COMPOSE_FILE" rm -sf ${SERVICES[*]}

# 4) Recojo los IDs de las imágenes asociadas a cada servicio
IMAGE_IDS=()
for svc in ${SERVICES[*]}; do
  # docker compose images -q da el ID de la imagen usada por el servicio
  id=$(docker compose -f "$COMPOSE_FILE" images -q "$svc")
  if [[ -n "$id" ]]; then
    IMAGE_IDS+=("$id")
  fi
done

# 5) Elimino esas imágenes para forzar descarga de nuevas
if [[ ${#IMAGE_IDS[@]} -gt 0 ]]; then
  echo "🗑️  Eliminando imágenes de servicios:"
  printf "   %s\n" ${IMAGE_IDS[@]}
  docker rmi -f ${IMAGE_IDS[*]}
else
  echo "ℹ️  No se encontraron imágenes para eliminar."
fi

# (Opcional) Limpio también imágenes colgantes
docker image prune -f

# 6) Levanto de nuevo los servicios, trayendo siempre la última imagen y sin recrear Postgres
docker compose -f "$COMPOSE_FILE" up -d --pull always --no-deps ${SERVICES[*]}

echo "✅ Servicios actualizados correctamente. El contenedor de Postgres permanece intacto."

