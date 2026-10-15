#!/bin/bash
# Despliega un servicio en la EC2 de Rupü vía AWS SSM (sin SSH ni secrets).
# La instancia se ubica por su tag Name=rupu-prod, así que sobrevive a que se recree.
# Si la instancia está apagada (auto-apagado nocturno), no falla: la imagen ya quedó
# en ECR y se despliega al encenderla con infra/scripts/rupu-up.sh.
#
# Uso: ssm-deploy.sh <backend|frontend|nginx|all>
set -euo pipefail

SERVICE="${1:?Uso: ssm-deploy.sh <backend|frontend|nginx|all>}"
TAG_NAME="${INSTANCE_TAG_NAME:-rupu-prod}"

CMD_ID=$(aws ssm send-command \
  --targets "Key=tag:Name,Values=$TAG_NAME" \
  --document-name "AWS-RunShellScript" \
  --comment "Deploy $SERVICE GHA ${GITHUB_SHA:-manual}" \
  --timeout-seconds 60 \
  --parameters "commands=[\"bash /home/ubuntu/reserve/infra/compose-prod/deploy.sh $SERVICE\"],executionTimeout=[\"900\"]" \
  --query "Command.CommandId" --output text)
echo "SSM CommandId: $CMD_ID"

# Esperar a que la invocación termine (máx ~15 min)
STATUS="Pending"
INSTANCE_ID=""
for i in $(seq 1 90); do
  sleep 10
  OUT=$(aws ssm list-command-invocations --command-id "$CMD_ID" \
    --query 'CommandInvocations[0].[InstanceId,Status]' --output text)
  INSTANCE_ID=$(echo "$OUT" | awk '{print $1}')
  STATUS=$(echo "$OUT" | awk '{print $2}')
  # Sin invocaciones: el tag aún se está resolviendo, o no hay instancia que coincida
  if [ -z "$STATUS" ] || [ "$INSTANCE_ID" = "None" ]; then
    [ "$i" -lt 3 ] && continue
    STATUS="None"; break
  fi
  case "$STATUS" in
    Pending|InProgress|Delayed) continue ;;
    *) break ;;
  esac
done

if [ "$STATUS" = "None" ]; then
  echo "::warning::No hay instancia '$TAG_NAME' encendida en SSM. La imagen quedó en ECR; se desplegará al encenderla (infra/scripts/rupu-up.sh)."
  exit 0
fi
if [ "$STATUS" = "DeliveryTimedOut" ] || [ "$STATUS" = "Undeliverable" ]; then
  echo "::warning::La instancia $INSTANCE_ID no recibió el comando ($STATUS), probablemente está apagada. Se desplegará al encenderla (infra/scripts/rupu-up.sh)."
  exit 0
fi

echo "===== STDOUT ($INSTANCE_ID) ====="
aws ssm get-command-invocation --command-id "$CMD_ID" --instance-id "$INSTANCE_ID" --query StandardOutputContent --output text
echo "===== STDERR ====="
aws ssm get-command-invocation --command-id "$CMD_ID" --instance-id "$INSTANCE_ID" --query StandardErrorContent --output text
echo "Status final: $STATUS"
[ "$STATUS" = "Success" ]
