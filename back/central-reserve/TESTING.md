# Guía de Testing - Central Reserve Backend

Esta guía explica cómo ejecutar tests y generar reportes de coverage para el backend de Central Reserve.

> **💡 Quick Start:** Ver [sección de Testing en README.md](README.md#🧪-testing--coverage) para comandos esenciales.

## 📋 Tabla de Contenidos

- [Comandos Rápidos](#comandos-rápidos)
- [Tests Básicos](#tests-básicos)
- [Coverage](#coverage)
- [Tests por Módulo](#tests-por-módulo)
- [Tests Avanzados](#tests-avanzados)
- [Estructura de Tests](#estructura-de-tests)
- [Mejores Prácticas](#mejores-prácticas)

---

## 🚀 Comandos Rápidos

> **Nota:** Esta sección contiene todos los comandos disponibles. Para uso diario, ver [README.md - Testing & Coverage](README.md#🧪-testing--coverage).

```bash
# Ejecutar todos los tests
make test

# Tests con coverage y reporte HTML
make test-coverage

# Reporte detallado de todos los módulos
make coverage-report

# Ver resumen de coverage
make test-coverage-summary
```

---

## 🧪 Tests Básicos

### Ejecutar todos los tests

```bash
make test
```

Este comando ejecuta todos los tests del proyecto con output verbose.

### Tests rápidos (sin integración)

```bash
make test-short
```

Ejecuta solo tests unitarios, omitiendo tests de integración que pueden ser más lentos.

### Tests de un módulo específico

```bash
make test-module MODULE=auth
make test-module MODULE=horizontalproperty/visit
```

---

## 📊 Coverage

### 1. Coverage con reporte HTML

```bash
make test-coverage
```

Genera:
- `coverage.out` - Archivo de coverage en formato Go
- `coverage.html` - Reporte visual en HTML

Luego abre `coverage.html` en tu navegador para ver:
- Líneas cubiertas (verde) vs no cubiertas (rojo)
- Porcentaje por archivo
- Navegación por paquetes

### 2. Resumen de coverage en terminal

```bash
make test-coverage-summary
```

Output ejemplo:
```
📊 Resumen de Coverage:
total:                                                          (statements)    75.2%

📁 Coverage por paquete:
  services/auth                                                    82.5%
  services/horizontalproperty/visit                               78.3%
  services/horizontalproperty/parking                             65.1%
```

### 3. Abrir reporte en navegador automáticamente

```bash
make test-coverage-html
```

Genera el reporte y lo abre automáticamente en tu navegador predeterminado.

### 4. Reporte detallado de todos los módulos

```bash
make coverage-report
```

Genera reportes individuales para cada módulo en `coverage-reports/`:
```
coverage-reports/
├── coverage-auth.html
├── coverage-auth.out
├── coverage-visit.html
├── coverage-visit.out
├── coverage-all.html          # Reporte consolidado
└── coverage-all.out
```

Output ejemplo:
```
🧪 Generando reporte de coverage...

📦 Analizando: visit
  ✅ Coverage: 78.3%
  📄 Reporte: coverage-reports/coverage-visit.html

📦 Analizando: vote
  ⚠️  Coverage: 62.1%
  📄 Reporte: coverage-reports/coverage-vote.html

✅ Coverage total del proyecto: 75.2%
📄 Reporte consolidado: coverage-reports/coverage-all.html

📉 Top 10 archivos con menor coverage:
  services/horizontalproperty/vote/internal/app/...              32.4%
  services/auth/internal/infra/repository/...                    45.2%
```

### 5. Coverage de un módulo específico

```bash
make coverage-report-module MODULE=horizontalproperty/visit
```

---

## 🔍 Tests por Módulo

### Módulo Auth

```bash
make test-auth
```

### Módulos de Horizontal Property

#### Todos los módulos de HP

```bash
make test-horizontalproperty
```

#### Módulos individuales

```bash
make test-hp-attendance    # Asistencias
make test-hp-commonarea    # Áreas comunes
make test-hp-dashboard     # Dashboard
make test-hp-packages      # Paquetería
make test-hp-parking       # Parqueaderos
make test-hp-resident      # Residentes
make test-hp-security      # Seguridad
make test-hp-unit          # Unidades
make test-hp-visit         # Visitas
make test-hp-vote          # Votaciones
make test-hp-wallnews      # Noticias
```

#### Todos los módulos con reporte individual

```bash
make test-all-modules
```

Output ejemplo:
```
🧪 Ejecutando tests de TODOS los módulos...

🧪 Tests: Auth...
total:                                    (statements)    82.5%

🧪 Tests: Attendance...
total:                                    (statements)    70.1%

🧪 Tests: Visit...
total:                                    (statements)    78.3%

✅ Tests completados para todos los módulos
```

---

## 🔬 Tests Avanzados

### Tests solo unitarios

```bash
make test-unit
```

Ejecuta solo tests marcados con `-short` flag.

### Tests solo de integración

```bash
make test-integration
```

Ejecuta solo tests que incluyen "Integration" en su nombre.

### Tests con detector de race conditions

```bash
make test-race
```

Detecta condiciones de carrera (race conditions) en código concurrente. **Importante** para código que usa goroutines, channels o shared state.

### Benchmarks

```bash
make test-bench
```

Ejecuta benchmarks de performance. Útil para optimizaciones.

Output ejemplo:
```
BenchmarkCreateVisit-8         1000000      1234 ns/op      512 B/op      10 allocs/op
BenchmarkListVisits-8           100000     12345 ns/op     2048 B/op      25 allocs/op
```

---

## 📁 Estructura de Tests

Los tests están organizados en `/back/testing/`:

```
back/testing/
├── modules/
│   ├── auth/
│   │   ├── login_test.go
│   │   └── register_test.go
│   ├── horizontalproperty/
│   │   ├── visit/
│   │   │   └── visit_test.go
│   │   └── parking/
│   │       └── parking_test.go
└── shared/
    └── helpers_test.go
```

### Convenciones de nombres

- Tests unitarios: `*_test.go`
- Tests de integración: `*_integration_test.go` o con tag `// +build integration`
- Benchmarks: `Benchmark*` functions
- Helpers: `testing/shared/`

---

## ✅ Mejores Prácticas

### 1. Ejecutar tests antes de commit

```bash
# Pre-commit hook recomendado
make test-short
```

### 2. Verificar coverage antes de PR

```bash
make test-coverage-summary
```

**Target recomendado:** > 70% coverage

### 3. Tests de módulo durante desarrollo

```bash
# Mientras trabajas en visit module
make test-hp-visit
```

### 4. CI/CD - Tests completos

```bash
# En pipeline de CI/CD
make test
make test-race
make test-coverage
```

### 5. Debugging de tests

```bash
# Ver output detallado de un test específico
go test ./services/horizontalproperty/visit/... -v -run TestCreateVisit

# Con más verbosidad
go test ./services/horizontalproperty/visit/... -v -run TestCreateVisit -count=1
```

### 6. Tests sin cache

```bash
# Forzar re-ejecución sin usar cache
go test ./... -count=1
```

---

## 🧹 Limpieza

### Limpiar archivos de coverage

```bash
make test-clean
```

Elimina:
- `coverage.out`
- `coverage.html`
- `coverage-*.out`
- `coverage-reports/`

### Limpieza completa

```bash
make clean
```

Elimina archivos de coverage + binarios compilados.

---

## 🎯 Objetivos de Coverage

| Capa | Target Coverage |
|------|----------------|
| **Domain** | > 90% |
| **Application (Use Cases)** | > 80% |
| **Handlers** | > 70% |
| **Repository** | > 60% (integración) |

### Por qué estos targets:

- **Domain**: Lógica de negocio crítica, debe estar muy cubierta
- **Application**: Orquestación, muy importante
- **Handlers**: Mapeo HTTP, importante pero menos crítico
- **Repository**: Tests de integración son más costosos

---

## 📚 Recursos Adicionales

- [Testing in Go](https://go.dev/doc/tutorial/add-a-test)
- [Table Driven Tests](https://dave.cheney.net/2019/05/07/prefer-table-driven-tests)
- [Testify - Testing toolkit](https://github.com/stretchr/testify)
- [Gomock - Mocking framework](https://github.com/golang/mock)

---

## 🆘 Troubleshooting

### Tests fallan con "no required module provides package"

```bash
# Actualizar dependencias
make deps
go mod tidy
```

### Coverage report vacío

```bash
# Verificar que existen tests
find . -name "*_test.go" | head -10

# Si no hay tests, crearlos primero
```

### Tests muy lentos

```bash
# Usar tests cortos durante desarrollo
make test-short

# O ejecutar solo el módulo específico
make test-module MODULE=visit
```

### Error "go: cannot find main module"

```bash
# Asegurarse de estar en el directorio correcto
cd /home/cam/Desktop/reserve/back/central-reserve
```

---

**Última actualización:** 2026-02-06
**Mantenedor:** Equipo Central Reserve
