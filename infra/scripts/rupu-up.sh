#!/bin/bash
# Enciende la EC2 temporal de Rupü (si está apagada) y apunta rupü.com / www a su IP pública actual.
# La IP es dinámica (sin Elastic IP): correr este script cada vez que se encienda la instancia.
#
# Uso: infra/scripts/rupu-up.sh
set -euo pipefail

export AWS_PROFILE=default AWS_REGION=us-east-1
ZONE_ID=Z08239492S5ST2KGD2SC0
DOMAIN=xn--rup-joa.com

INSTANCE_ID=$(aws ec2 describe-instances \
  --filters Name=tag:Name,Values=rupu-prod Name=instance-state-name,Values=pending,running,stopping,stopped \
  --query 'Reservations[0].Instances[0].InstanceId' --output text)
[ "$INSTANCE_ID" = "None" ] && { echo "No hay instancia rupu-prod"; exit 1; }

STATE=$(aws ec2 describe-instances --instance-ids "$INSTANCE_ID" --query 'Reservations[0].Instances[0].State.Name' --output text)
if [ "$STATE" != "running" ]; then
  echo "==> Encendiendo $INSTANCE_ID ($STATE)"
  [ "$STATE" = "stopping" ] && aws ec2 wait instance-stopped --instance-ids "$INSTANCE_ID"
  aws ec2 start-instances --instance-ids "$INSTANCE_ID" >/dev/null
  aws ec2 wait instance-running --instance-ids "$INSTANCE_ID"
fi

IP=$(aws ec2 describe-instances --instance-ids "$INSTANCE_ID" --query 'Reservations[0].Instances[0].PublicIpAddress' --output text)
echo "==> IP pública: $IP"

aws route53 change-resource-record-sets --hosted-zone-id "$ZONE_ID" --change-batch "{
  \"Comment\": \"rupu-up $(date -Iseconds)\",
  \"Changes\": [
    {\"Action\":\"UPSERT\",\"ResourceRecordSet\":{\"Name\":\"$DOMAIN.\",\"Type\":\"A\",\"TTL\":60,\"ResourceRecords\":[{\"Value\":\"$IP\"}]}},
    {\"Action\":\"UPSERT\",\"ResourceRecordSet\":{\"Name\":\"www.$DOMAIN.\",\"Type\":\"A\",\"TTL\":60,\"ResourceRecords\":[{\"Value\":\"$IP\"}]}}
  ]}" --query 'ChangeInfo.Status' --output text

echo "==> DNS actualizado: https://rupü.com -> $IP"

# Traer las últimas imágenes de ECR (CI pudo publicar mientras estaba apagada)
echo "==> Desplegando últimas imágenes (SSM)"
for _ in $(seq 1 18); do
  PING=$(aws ssm describe-instance-information --filters "Key=InstanceIds,Values=$INSTANCE_ID" \
    --query 'InstanceInformationList[0].PingStatus' --output text)
  [ "$PING" = "Online" ] && break
  sleep 10
done
INSTANCE_TAG_NAME=rupu-prod GITHUB_SHA=rupu-up bash "$(dirname "$0")/../../.github/scripts/ssm-deploy.sh" all
echo "    SSH: ssh -i cam.pem ubuntu@$IP"
