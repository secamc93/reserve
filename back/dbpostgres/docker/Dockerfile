# Etapa 1: build con Go
FROM --platform=$BUILDPLATFORM golang:1.23-alpine AS builder

# Variables de compilación
ENV CGO_ENABLED=0

# Crear usuario no root para build
RUN adduser -D -g '' appuser

WORKDIR /app

# Copiar go.mod y go.sum primero para aprovechar cache
COPY go.mod go.sum ./
RUN go mod download

# Copiar el resto del código
COPY . .

# Compilar la aplicación
# Cross-compile a ARM64 (Graviton) sin importar la arquitectura del builder
RUN GOOS=linux GOARCH=arm64 go build -o db_migrator ./cmd/main.go

# Etapa 2: Imagen final minimalista
FROM --platform=linux/arm64 alpine:3.19

# Variables de entorno
ENV TZ=America/Bogota

# Crear usuario no root
RUN adduser -D -g '' appuser

WORKDIR /app

# Copiar binario desde build stage
COPY --from=builder /app/db_migrator .

# Instalar certificados SSL, wget para healthcheck y configurar zona horaria
RUN apk update && apk add --no-cache \
    ca-certificates \
    tzdata \
    wget && \
    cp /usr/share/zoneinfo/${TZ} /etc/localtime && \
    echo "${TZ}" > /etc/timezone && \
    rm -rf /var/cache/apk/*

# Cambiar a usuario no root
USER appuser

# Ejecutar la aplicación de migración
CMD ["./db_migrator"] 