#!/bin/bash
# Deploy script ejecutado en la EC2 (rupu-prod) vía AWS SSM desde GitHub Actions.
# Regenera el .env desde SSM Parameter Store, hace login a ECR con el instance role,
# y recrea el/los servicio(s) indicados. No requiere secrets ni SSH.
#
# Uso: deploy.sh [backend|frontend|nginx|all]
set -euo pipefail

SERVICE="${1:-all}"
REGION=us-east-1
ECR=334689162817.dkr.ecr.us-east-1.amazonaws.com
APP_DIR=/home/ubuntu/reserve/infra/compose-prod
cd "$APP_DIR"

echo "==> [deploy] servicio=$SERVICE"

echo "==> Regenerando .env desde Parameter Store (/rupu/)"
aws ssm get-parameters-by-path --region "$REGION" --path /rupu/ --recursive --with-decryption --output json > /tmp/rupu-params.json
python3 - <<'PY'
import json
d = json.load(open('/tmp/rupu-params.json'))
with open('/home/ubuntu/reserve/infra/compose-prod/.env', 'w') as f:
    for p in sorted(d['Parameters'], key=lambda x: x['Name']):
        f.write(f"{p['Name'].split('/')[-1]}={p['Value']}\n")
    f.write("DOMAIN=xn--rup-joa.com\n")
PY
chmod 600 .env
chown ubuntu:ubuntu .env 2>/dev/null || true
rm -f /tmp/rupu-params.json

echo "==> Login a ECR (instance role)"
aws ecr get-login-password --region "$REGION" | docker login --username AWS --password-stdin "$ECR" >/dev/null

CF="-f docker-compose.yaml -f docker-compose.db.yaml"
case "$SERVICE" in
  backend)  SVC="central_reserve"; CN="central_reserve_prod" ;;
  frontend) SVC="frontend";        CN="frontend_prod" ;;
  nginx)    SVC="nginx";           CN="nginx_prod" ;;
  all)      SVC="";                CN="" ;;
  *) echo "Servicio desconocido: $SERVICE"; exit 1 ;;
esac

echo "==> Pull + recreate"
docker compose $CF pull $SVC
docker compose $CF up -d --force-recreate $SVC

echo "==> Limpieza de imagenes viejas"
docker image prune -f >/dev/null 2>&1 || true

# Health check del backend
if [ "$SERVICE" = "backend" ] || [ "$SERVICE" = "all" ]; then
  echo "==> Health check backend"
  for i in $(seq 1 24); do
    if curl -sf http://localhost:3050/health >/dev/null 2>&1; then
      echo "    backend healthy"; break
    fi
    [ "$i" = "24" ] && { echo "    ERROR: backend no respondio /health"; docker logs --tail 40 central_reserve_prod; exit 1; }
    sleep 5
  done
fi

echo "==> Estado:"
docker ps --format "table {{.Names}}\t{{.Status}}"
echo "==> Deploy OK ($SERVICE)"
