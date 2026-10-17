#!/bin/bash
# Corre en la EC2 en cada arranque (systemd rupu-boot.service): apunta rupü.com / www a la IP
# pública nueva (la instancia no tiene Elastic IP) y despliega las últimas imágenes de ECR.
# Permite encenderla desde AWS (EventBridge Scheduler) sin correr rupu-up.sh en local.
# Lo instala infra/scripts/rupu-ec2-userdata.sh (o a mano por SSM).
set -euo pipefail

ZONE_ID=Z08239492S5ST2KGD2SC0
DOMAIN=xn--rup-joa.com

TOKEN=$(curl -sf -X PUT http://169.254.169.254/latest/api/token -H 'X-aws-ec2-metadata-token-ttl-seconds: 300')
IP=$(curl -sf -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/public-ipv4)
echo "==> IP pública: $IP"

aws route53 change-resource-record-sets --hosted-zone-id "$ZONE_ID" --change-batch "{
  \"Comment\": \"rupu-boot $(date -Iseconds)\",
  \"Changes\": [
    {\"Action\":\"UPSERT\",\"ResourceRecordSet\":{\"Name\":\"$DOMAIN.\",\"Type\":\"A\",\"TTL\":60,\"ResourceRecords\":[{\"Value\":\"$IP\"}]}},
    {\"Action\":\"UPSERT\",\"ResourceRecordSet\":{\"Name\":\"www.$DOMAIN.\",\"Type\":\"A\",\"TTL\":60,\"ResourceRecords\":[{\"Value\":\"$IP\"}]}}
  ]}" --query 'ChangeInfo.Status' --output text
echo "==> DNS actualizado: $DOMAIN -> $IP"

/home/ubuntu/reserve/infra/compose-prod/deploy.sh all
