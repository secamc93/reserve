#!/bin/bash
# cloud-init user-data para la EC2 temporal de Rupü (Ubuntu 24.04 ARM64).
# Instala Docker + compose + AWS CLI + certbot y programa el apagado diario.
set -euxo pipefail
exec > /var/log/rupu-userdata.log 2>&1

export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y ca-certificates curl unzip python3 rsync certbot postgresql-client

# Docker (repo oficial) + plugin compose
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
echo "deb [arch=arm64 signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu noble stable" \
  > /etc/apt/sources.list.d/docker.list
apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
usermod -aG docker ubuntu
systemctl enable --now docker

# AWS CLI v2 (ARM64)
curl -fsSL https://awscli.amazonaws.com/awscli-exe-linux-aarch64.zip -o /tmp/awscliv2.zip
unzip -q /tmp/awscliv2.zip -d /tmp && /tmp/aws/install && rm -rf /tmp/aws /tmp/awscliv2.zip

# Swap de 2 GB para el build de Next.js
fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# Apagado automático diario: 23:59 hora Bogotá (04:59 UTC)
echo '59 4 * * * root /sbin/shutdown -h now "rupu auto-stop"' > /etc/cron.d/rupu-autostop

# En cada arranque: DNS a la IP nueva y deploy (permite encenderla desde EventBridge Scheduler).
# El script vive en el repo: infra/scripts/rupu-boot.sh (copiarlo a /usr/local/bin/rupu-boot.sh).
cat > /etc/systemd/system/rupu-boot.service <<'UNIT'
[Unit]
Description=Rupu: DNS a la IP nueva y deploy al arrancar
Wants=network-online.target
After=network-online.target docker.service

[Service]
Type=oneshot
Environment=AWS_REGION=us-east-1 AWS_DEFAULT_REGION=us-east-1
ExecStart=/usr/local/bin/rupu-boot.sh
TimeoutStartSec=900

[Install]
WantedBy=multi-user.target
UNIT
systemctl daemon-reload && systemctl enable rupu-boot.service

mkdir -p /home/ubuntu/reserve/infra/compose-prod
chown -R ubuntu:ubuntu /home/ubuntu/reserve
touch /var/log/rupu-userdata.done
