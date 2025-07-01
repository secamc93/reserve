# Etapa 1: build con Go
FROM golang:1.23-alpine AS builder

# Variables de compilación
ENV CGO_ENABLED=0 \
    GOOS=linux \
    GOARCH=amd64 \
    APP_NAME=central_reserve

WORKDIR /app

# Copiar go.mod y go.sum primero para aprovechar cache
COPY go.mod go.sum ./
RUN go mod download

# Copiar el resto del código
COPY . .

# Compilar la aplicación
RUN go build -o ${APP_NAME} ./cmd/main.go

# Etapa 2: Imagen final minimalista
FROM alpine:3.19

# Definir variables de entorno útiles
ENV TZ=America/Bogota \
    APP_NAME=central_reserve

# Crear usuario no root
RUN adduser -D appuser

WORKDIR /app

# Copiar binario desde build stage
COPY --from=builder /app/${APP_NAME} .

# Instalar tzdata y configurar zona horaria
RUN apk update && apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/${TZ} /etc/localtime && \
    echo "${TZ}" > /etc/timezone
    # 👈 Nota: no eliminamos tzdata para que Go lo pueda usar en runtime

# Cambiar a usuario no root
USER appuser

EXPOSE 3050

# Ejecutar la app
CMD ["./central_reserve"]
