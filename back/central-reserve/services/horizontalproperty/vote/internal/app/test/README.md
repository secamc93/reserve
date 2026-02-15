# Tests del Módulo Vote

Este directorio contiene los tests unitarios para el módulo de votaciones (Vote) del sistema de Propiedades Horizontales.

## Estructura de Tests

```
internal/app/
├── test/
│   ├── mocks/                              # Mocks compartidos
│   │   ├── logger_mock.go                  # Mock del logger
│   │   ├── voting_repository_mock.go       # Mock del repositorio de votaciones
│   │   └── voting_cache_mock.go            # Mock del servicio de cache
│   └── README.md
├── usecasevotinggroups/test/              # Tests de grupos de votación
│   ├── create_test.go
│   ├── get_by_id_test.go
│   ├── list_by_business_test.go
│   ├── update_test.go
│   ├── deactivate_test.go
│   └── delete_test.go
└── usecasevotingoptions/test/             # Tests de opciones de votación
    ├── create_test.go
    └── voting_options_test.go
```

## Mocks Compartidos

### VotingRepositoryMock

Mock completo del repositorio de votaciones que implementa la interfaz `domain.VotingRepository`. Soporta todos los métodos:

**Voting Groups:**
- `CreateVotingGroup`
- `GetVotingGroupByID`
- `ListVotingGroupsByBusiness`
- `UpdateVotingGroup`
- `DeactivateVotingGroup`
- `DeleteVotingGroup`

**Votings:**
- `CreateVoting`
- `GetVotingByID`
- `ListVotingsByGroup`
- `UpdateVoting`
- `ActivateVoting`
- `DeactivateVoting`
- `DeleteVoting`

**Voting Options:**
- `CreateVotingOption`
- `ListVotingOptionsByVoting`
- `GetVotingOptionByID`
- `UpdateVotingOptionStatus`
- `DeleteVotingOption`

**Votes:**
- `CreateVote`
- `GetVoteByID`
- `DeleteVote`
- `HasUnitVoted`
- `GetUnitVote`
- Y más métodos relacionados con resultados y reportes

### VotingCacheServiceMock

Mock del servicio de cache para votaciones en tiempo real (SSE):
- `PublishVote`
- `RemoveVote`
- `ClearVoting`
- `Subscribe`
- `GetVotingState`
- `InitializeVoting`

### LoggerMock

Mock estándar del logger que implementa la interfaz `log.ILogger` con todos los métodos de logging (Info, Error, Warn, Debug, Fatal, Panic) y métodos de contexto (WithModule, WithService, WithBusinessID).

## Tests Implementados

### UseCaseVotingGroups (22 tests)

**CreateVotingGroup:**
- ✅ Success - Creación exitosa de grupo de votación
- ✅ RepositoryError - Error de base de datos
- ✅ MissingQuorumPercentage - Validación de quorum requerido
- ✅ WithoutQuorumRequirement - Grupo sin quorum

**GetVotingGroupByID:**
- ✅ Success - Obtención exitosa
- ✅ NotFound - Grupo no encontrado
- ✅ RepositoryError - Error de base de datos

**ListVotingGroupsByBusiness:**
- ✅ Success - Lista múltiples grupos
- ✅ EmptyResult - Sin grupos
- ✅ RepositoryError - Error de base de datos

**UpdateVotingGroup:**
- ✅ Success - Actualización exitosa
- ✅ MissingQuorumPercentage - Validación de quorum
- ✅ RepositoryError - Error de base de datos
- ✅ NotFound - Grupo no encontrado

**DeactivateVotingGroup:**
- ✅ Success - Desactivación exitosa
- ✅ RepositoryError - Error de base de datos
- ✅ NotFound - Grupo no encontrado

**DeleteVotingGroup:**
- ✅ Success - Eliminación exitosa con limpieza de cache
- ✅ NoVotings - Eliminación sin votaciones asociadas
- ✅ ErrorListingVotings - Error al listar votaciones
- ✅ ErrorDeletingGroup - Error al eliminar
- ✅ CacheClearError - Error de cache (no debe fallar)

### UseCaseVotingOptions (10 tests)

**CreateVotingOption:**
- ✅ Success - Creación exitosa de opción
- ✅ RepositoryError - Error de base de datos

**GetVotingOptionByID:**
- ✅ Success - Obtención exitosa
- ✅ NotFound - Opción no encontrada

**ListVotingOptionsByVoting:**
- ✅ Success - Lista múltiples opciones
- ✅ EmptyResult - Sin opciones

**UpdateVotingOptionStatus:**
- ✅ Success - Actualización de estado exitosa
- ✅ RepositoryError - Error de base de datos

**DeleteVotingOption:**
- ✅ Success - Eliminación exitosa
- ✅ RepositoryError - Error de base de datos

## Cómo Ejecutar los Tests

### Todos los tests del módulo vote
```bash
cd /home/cam/Desktop/reserve/back/central-reserve
go test ./services/horizontalproperty/vote/... -v -count=1
```

### Tests específicos de un sub-package
```bash
# Voting Groups
go test ./services/horizontalproperty/vote/internal/app/usecasevotinggroups/test/... -v -count=1

# Voting Options
go test ./services/horizontalproperty/vote/internal/app/usecasevotingoptions/test/... -v -count=1
```

### Con cobertura
```bash
go test ./services/horizontalproperty/vote/internal/app/.../test/... -cover -count=1
```

## Patrón de Test Utilizado

### External Test Package Pattern
Todos los tests usan el patrón de external test package para evitar dependencias circulares:

```go
package usecasevotinggroups_test

import (
    "testing"
    "context"
    "central_reserve/services/horizontalproperty/vote/internal/app/usecasevotinggroups"
    "central_reserve/services/horizontalproperty/vote/internal/app/test/mocks"
    "central_reserve/services/horizontalproperty/vote/internal/domain"
)
```

### Patrón AAA (Arrange, Act, Assert)

Cada test sigue el patrón AAA:

```go
func TestCreateVotingGroup_Success(t *testing.T) {
    // Arrange - Configurar mocks y datos de entrada
    ctx := context.Background()
    mockRepo := mocks.NewMockVotingRepository()
    mockCache := mocks.NewMockVotingCacheService()
    mockLogger := mocks.NewMockLogger()

    useCase := usecasevotinggroups.New(mockRepo, mockCache, mockLogger)

    // ... configurar comportamiento de mocks

    // Act - Ejecutar el método bajo prueba
    result, err := useCase.CreateVotingGroup(ctx, dto)

    // Assert - Verificar resultados
    if err != nil {
        t.Fatalf("expected no error, got %v", err)
    }
    // ... más aserciones
}
```

### Configuración de Mocks

Los mocks se configuran usando funciones inyectables:

```go
mockRepo.CreateVotingGroupFn = func(ctx context.Context, group *domain.VotingGroup) (*domain.VotingGroup, error) {
    return expectedGroup, nil
}
```

## Cobertura de Tests

Los tests cubren los siguientes escenarios:

1. **Casos felices (happy path)** - Funcionamiento correcto
2. **Errores de validación** - Validación de DTOs
3. **Errores de repositorio** - Simulación de errores de base de datos
4. **Casos de borde** - Datos vacíos, no encontrados, etc.
5. **Integración con cache** - Limpieza de cache en operaciones de eliminación

## Próximos Tests a Implementar

- [ ] **usecasevotings** - CRUD de votaciones
- [ ] **usecasevotes** - Creación y gestión de votos
- [ ] **usecaseresults** - Consultas de resultados
- [ ] **usecaseshared** - Utilidades compartidas
- [ ] **usecasepublic** - Validación de residentes

## Notas Importantes

1. **No usar base de datos real**: Todos los tests son unitarios y usan mocks
2. **Tests independientes**: Cada test puede ejecutarse por separado
3. **Tests rápidos**: Sin dependencias externas, se ejecutan en milisegundos
4. **Mocks reutilizables**: Los mocks en `test/mocks/` se usan en múltiples tests
5. **Validación de cache**: Los tests de delete verifican la limpieza de cache

## Mantenimiento

Al agregar nuevos métodos a las interfaces:

1. Actualizar el mock correspondiente en `test/mocks/`
2. Implementar el método mock con función inyectable
3. Crear tests para el nuevo método

## Referencias

- Arquitectura Hexagonal: `/.claude/rules/architecture.md`
- Estándares de Testing: `/.claude/rules/testing.md`
- Código fuente: `/services/horizontalproperty/vote/internal/app/`
