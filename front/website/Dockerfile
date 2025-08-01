# Etapa 1: Build del proyecto Astro
FROM node:20-alpine AS build

WORKDIR /app

# Copiar e instalar dependencias
COPY package*.json ./
RUN npm ci

# Copiar el resto del código fuente
COPY . .

# Construir el sitio Astro
RUN npm run build

# Etapa 2: Servir los archivos estáticos con Nginx
FROM nginx:1.25-alpine

# Copiar el build generado
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar la configuración de Nginx interna
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
