# Etapa 1: build con Go
FROM golang:1.24-alpine AS builder

# Variables de compilación (solo para build)
ENV CGO_ENABLED=0 \
    GOOS=linux \
    GOARCH=arm64 \
    APP_ENV=production

# Instalar herramientas necesarias para generar Swagger
RUN apk add --no-cache \
    jq \
    python3 \
    bash \
    make

# Instalar swag (herramienta de swaggo) y agregar al PATH
RUN go install github.com/swaggo/swag/cmd/swag@latest
ENV PATH="${PATH}:/go/bin:/root/go/bin"

# Crear usuario no root para build
RUN adduser -D -g '' appuser

WORKDIR /app

# Copiar go.mod y go.sum primero para aprovechar cache
COPY back/central-reserve/go.mod back/central-reserve/go.sum ./

# Copiar el módulo dbpostgres al contexto de build
COPY dbpostgres ./dbpostgres/

# Copiar el resto del código
COPY back/central-reserve .

# Actualizar el replace directive para el contexto de Podman
RUN sed -i 's|replace dbpostgres => ../dbpostgres|replace dbpostgres => ./dbpostgres|' go.mod

RUN go mod download

# Generar documentación Swagger para producción antes de compilar
RUN chmod +x scripts/generate-swagger.sh && \
    APP_ENV=production ./scripts/generate-swagger.sh all || echo "⚠️  Advertencia: La generación de Swagger falló, continuando con el build..."

# Compilar la aplicación
RUN go build -o central_reserve ./cmd/main.go

# Etapa 2: Imagen final minimalista
FROM alpine:3.19

# Solo variables no sensibles necesarias para runtime
ENV TZ=America/Bogota

# Crear usuario no root
RUN adduser -D -g '' appuser

WORKDIR /app

# Copiar binario desde build stage
COPY --from=builder /app/central_reserve .

# Instalar certificados SSL, wget y configurar zona horaria
# Nota: Podman no se instala en el contenedor, se accede al socket del host
RUN apk update && apk add --no-cache \
    ca-certificates \
    tzdata \
    wget && \
    cp /usr/share/zoneinfo/${TZ} /etc/localtime && \
    echo "${TZ}" > /etc/timezone && \
    rm -rf /var/cache/apk/*

# Cambiar a usuario no root
USER appuser

# Exponer puerto
EXPOSE 3050

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3050/health || exit 1

# Ejecutar la app
CMD ["./central_reserve"]
