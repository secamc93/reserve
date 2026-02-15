# Repository Layer - Mappers

Esta carpeta contiene funciones de mapeo entre modelos GORM y entidades de dominio.

**Nota**: Actualmente la función `mapPropertyUnitToDomain()` está inline en `property_unit_repository.go` (línea 160).

Para mejorar la organización, considera crear:
- `mappers/to_domain.go` - Modelos GORM → Entidades de dominio
- `mappers/from_domain.go` - Entidades de dominio → Modelos GORM

Ejemplo:
```go
package mappers

func ToPropertyUnitDomain(m *models.PropertyUnit) *domain.PropertyUnit {
    return &domain.PropertyUnit{
        ID:                       m.ID,
        BusinessID:               m.BusinessID,
        Number:                   m.Number,
        // ... resto de campos
    }
}
```
