# Repository Layer - Mappers

Esta carpeta contiene funciones de mapeo entre modelos GORM y entidades de dominio.

**Nota**: Actualmente la función `mapResidentToDomain()` está inline en `resident_repository.go` (línea 330).

Para mejorar la organización, considera crear:
- `mappers/to_domain.go` - Modelos GORM → Entidades de dominio
- `mappers/from_domain.go` - Entidades de dominio → Modelos GORM

Ejemplo:
```go
package mappers

func ToDomain(m *models.Resident) *domain.Resident {
    return &domain.Resident{
        ID:               m.ID,
        BusinessID:       m.BusinessID,
        ResidentTypeID:   m.ResidentTypeID,
        Name:             m.Name,
        // ... resto de campos
    }
}
```
