# Reserve Testing Suite

Proyecto de testing modular para el sistema Reserve.

## Estructura

```
testing/
├── cmd/                    # Punto de entrada principal
│   └── main.go
├── modules/                # Módulos de testing (cada uno es un paquete)
│   ├── unit/              # Tests unitarios
│   │   ├── internal/      # Código interno del módulo
│   │   ├── bundle.go      # Bundle del módulo
│   │   └── unit_test.go   # Tests del módulo
│   └── residents/         # Tests de residents
│       ├── internal/      # Código interno del módulo
│       ├── bundle.go      # Bundle del módulo
│       └── residents_test.go
├── go.mod
└── README.md
```

## Uso

### Ejecutar todos los tests
```bash
go run cmd/main.go
```

### Ejecutar un módulo específico
```bash
# Solo tests unitarios
go run cmd/main.go -module unit

# Solo tests de residents
go run cmd/main.go -module residents
```

### Modo verbose
```bash
go run cmd/main.go -v
```

### Ejecutar tests con go test
```bash
# Todos los tests
go test ./...

# Tests de un módulo específico
go test ./modules/unit
go test ./modules/residents
```

## Agregar nuevos módulos

Para agregar un nuevo módulo de testing:

1. Crear directorio en `modules/`:
```bash
mkdir -p modules/nuevo_modulo/internal
```

2. Crear `bundle.go`:
```go
package nuevo_modulo

import "testing"

type Bundle struct {
    testSuite string
}

func NewBundle() *Bundle {
    return &Bundle{testSuite: "nuevo_modulo"}
}

func (b *Bundle) Run(t *testing.T) {
    t.Run("Nuevo Modulo Tests", func(t *testing.T) {
        // Tests aquí
    })
}

func (b *Bundle) GetName() string {
    return b.testSuite
}
```

3. Crear tests `nuevo_modulo_test.go`

4. Agregar al `cmd/main.go` si deseas ejecutarlo desde el CLI

## Desarrollo

```bash
# Compilar
go build -o testing cmd/main.go

# Ejecutar compilado
./testing -module all -v
```
