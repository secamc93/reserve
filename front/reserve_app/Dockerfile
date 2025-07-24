# Multi-stage build para React
FROM --platform=linux/arm64 node:18-alpine AS builder

# Argumento de build para la URL de la API
ARG VITE_API_BASE_URL

# Establecer la variable de entorno para el build
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Establecer directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install --legacy-peer-deps

# Copiar el código fuente
COPY . .

# Construir la aplicación para producción
RUN npm run build

# Etapa de producción con nginx
FROM --platform=linux/arm64 nginx:alpine

# Copiar archivos construidos desde la etapa anterior
COPY --from=builder /app/build /usr/share/nginx/html

# Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Exponer puerto 80
EXPOSE 80

# Usar nginx como entrypoint
CMD ["nginx", "-g", "daemon off;"] 