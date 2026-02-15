# Build trigger: 2026-02-15 - Migrado a Docker y ECR privado
FROM nginx:alpine

COPY nginx.conf /etc/nginx/nginx.conf.template
COPY entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
