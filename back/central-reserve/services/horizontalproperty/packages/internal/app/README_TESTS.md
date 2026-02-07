# Tests del Módulo Packages - Application Layer

## Resumen

Tests unitarios para los casos de uso del módulo de paquetería siguiendo arquitectura hexagonal.

**Cobertura**: 61.3% de statements

## Archivos Generados

### Mocks (`internal/mocks/`)

- `logger_mock.go` - Mock del logger usando zerolog.Nop()
- `package_repository_mock.go` - Mock del repositorio de paquetes

### Tests (`internal/app/`)

- `deliver_package_test.go` - Tests para entrega de paquetes
- `delete_package_test.go` - Tests para eliminación (soft delete)
- `list_packages_test.go` - Tests para listado con paginación
- `get_package_by_id_test.go` - Tests para obtener paquete y actualizar estado

## Cobertura por Caso de Uso

| Caso de Uso | Cobertura | Tests |
|-------------|-----------|-------|
| `New` (Constructor) | 100% | ✅ |
| `DeletePackage` | 100% | 5 tests |
| `DeliverPackage` | 84% | 5 tests |
| `GetPackageByID` | 100% | 3 tests |
| `UpdatePackageStatus` | 93.3% | 5 tests |
| `ListPackages` | 100% | 6 tests |
| `GetPackageByQRCode` | 0% | ❌ No testeado |
| `GetPackageStatuses` | 0% | ❌ No testeado |
| `ReceivePackage` | 0% | ⚠️ No testeable con mocks (type assertion) |

## Tests Implementados

### DeliverPackage (5 tests)

1. **TestDeliverPackage_Success** - Entrega exitosa desde estado "received"
2. **TestDeliverPackage_AlreadyDelivered** - Error cuando paquete ya está en estado final
3. **TestDeliverPackage_NotDeliverable** - Error cuando estado no permite entrega
4. **TestDeliverPackage_PackageNotFound** - Error cuando paquete no existe
5. **TestDeliverPackage_InStorageStatus** - Entrega exitosa desde estado "in_storage"

### DeletePackage (5 tests)

1. **TestDeletePackage_Success** - Marcado como "returned" exitosamente
2. **TestDeletePackage_AlreadyFinal** - Error cuando paquete ya está en estado final
3. **TestDeletePackage_NotFound** - Error cuando paquete no existe
4. **TestDeletePackage_UpdateError** - Error al actualizar en base de datos
5. **TestDeletePackage_StatusNotFound** - Error cuando estado "returned" no existe

### ListPackages (6 tests)

1. **TestListPackages_Success** - Listado exitoso con paginación
2. **TestListPackages_DefaultPagination** - Valores por defecto (page=1, pageSize=10)
3. **TestListPackages_MaxPageSize** - PageSize > 100 se capa a 100
4. **TestListPackages_WithFilters** - Filtros aplicados correctamente
5. **TestListPackages_RepositoryError** - Error de repositorio
6. **TestListPackages_EmptyResults** - Resultados vacíos

### GetPackageByID / UpdatePackageStatus (8 tests)

1. **TestGetPackageByID_Success** - Obtención exitosa
2. **TestGetPackageByID_NotFound** - Paquete no encontrado
3. **TestGetPackageByID_RepositoryError** - Error de repositorio
4. **TestUpdatePackageStatus_Success** - Actualización exitosa
5. **TestUpdatePackageStatus_FinalState** - Error al actualizar estado final
6. **TestUpdatePackageStatus_PackageNotFound** - Paquete no encontrado
7. **TestUpdatePackageStatus_UpdateError** - Error al actualizar
8. **TestUpdatePackageStatus_WithNotes** - Notas actualizadas correctamente

## Validaciones Clave Testeadas

### Reglas de Negocio

- ✅ Paquetes en estado final no pueden ser modificados
- ✅ Solo paquetes en "received" o "in_storage" pueden ser entregados
- ✅ Eliminación es soft delete cambiando estado a "returned"
- ✅ Paginación con valores por defecto y límites (max 100)

### Manejo de Errores

- ✅ `ErrPackageNotFound` - Paquete no existe
- ✅ `ErrPackageAlreadyDelivered` - Paquete ya entregado
- ✅ `ErrPackageNotDeliverable` - Estado no permite entrega
- ✅ `ErrPackageAlreadyFinal` - Estado final no puede cambiar
- ✅ `ErrInvalidStatusTransition` - Transición de estado inválida

### Validaciones de Datos

- ✅ Paginación: Page < 1 → 1
- ✅ Paginación: PageSize < 1 → 10
- ✅ Paginación: PageSize > 100 → 100
- ✅ Notas opcionales en entrega
- ✅ Timestamps actualizados correctamente

## Ejecución de Tests

```bash
# Ejecutar todos los tests
go test ./services/horizontalproperty/packages/internal/app/... -v

# Ver cobertura
go test ./services/horizontalproperty/packages/internal/app/... -cover

# Reporte detallado de cobertura
go test ./services/horizontalproperty/packages/internal/app/... -coverprofile=coverage.out
go tool cover -func=coverage.out

# Reporte HTML de cobertura
go tool cover -html=coverage.out -o coverage.html
```

## Tests NO Implementados

### GetPackageByQRCode

**Razón**: Método simple que solo delega al repositorio (cobertura no prioritaria)

**Implementación sugerida**:
```go
func TestGetPackageByQRCode_Success(t *testing.T)
func TestGetPackageByQRCode_NotFound(t *testing.T)
```

### GetPackageStatuses

**Razón**: Método simple que solo delega al repositorio

**Implementación sugerida**:
```go
func TestGetPackageStatuses_Success(t *testing.T)
func TestGetPackageStatuses_Error(t *testing.T)
```

### ReceivePackage

**Razón**: Hace type assertion `uc.packageRepo.(*repository.PackageRepository)` que no funciona con mocks

**Problema**:
```go
// En receive-package.use-case.go
repo, ok := uc.packageRepo.(*repository.PackageRepository)
if !ok {
    return nil, errors.New("error de conversión de repositorio")
}
```

**Solución recomendada**: Refactorizar para que `GenerateQRCode` sea parte de la interfaz `domain.PackageRepository` o usar un generador de QR inyectable.

## Notas de Implementación

### Mock Pattern

Los mocks siguen el patrón de funciones inyectables:

```go
type PackageRepositoryMock struct {
    GetPackageByIDFunc func(ctx context.Context, id uint) (*domain.Package, error)
    // ...
}

func (m *PackageRepositoryMock) GetPackageByID(ctx context.Context, id uint) (*domain.Package, error) {
    if m.GetPackageByIDFunc != nil {
        return m.GetPackageByIDFunc(ctx, id)
    }
    return nil, domain.ErrPackageNotFound
}
```

### Simular Múltiples Llamadas

Para métodos que llaman al repositorio múltiples veces:

```go
callCount := 0
mockRepo.GetPackageByIDFunc = func(ctx context.Context, id uint) (*domain.Package, error) {
    callCount++
    if callCount == 1 {
        return packageBeforeUpdate, nil
    }
    return packageAfterUpdate, nil
}
```

## Mejoras Futuras

1. **Agregar tests para GetPackageByQRCode**
2. **Agregar tests para GetPackageStatuses**
3. **Refactorizar ReceivePackage** para hacerlo testeable
4. **Aumentar cobertura de DeliverPackage** (84% → 100%)
5. **Agregar tests de integración** para repositorio
6. **Agregar benchmarks** para operaciones críticas

## Referencias

- Arquitectura Hexagonal: `.claude/rules/architecture.md`
- Reglas de Testing: Sistema de instrucciones de testing
- Domain Errors: `internal/domain/errors.go`
- Ports: `internal/domain/ports.go`
