# Build trigger: 2026-02-15 - Migrado a Docker y ECR privado
# La web pública (front/website, Astro estático) se compila aquí y nginx la sirve en la raíz de
# rupü.com. Se construye con: docker build --build-context website=../../front/website .

FROM --platform=linux/arm64 node:20-alpine AS website-build
WORKDIR /website
COPY --from=website package.json package-lock.json ./
RUN npm ci
COPY --from=website . .
RUN npm run build

FROM --platform=linux/arm64 nginx:alpine

COPY nginx.conf /etc/nginx/nginx.conf.template
COPY entrypoint.sh /entrypoint.sh
COPY --from=website-build /website/dist /usr/share/nginx/website

RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
