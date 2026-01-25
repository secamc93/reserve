package mappers

import (
	"central_reserve/services/auth/resources/internal/domain"
	"dbpostgres/app/infra/models"
	"time"
)

// ResourceToDomain convierte modelo de BD a entidad de dominio
func ResourceToDomain(m *models.Resource) domain.Resource {
	var deletedAt *time.Time
	if m.DeletedAt.Valid {
		deletedAt = &m.DeletedAt.Time
	}

	businessTypeID := uint(0)
	businessTypeName := ""
	if m.BusinessTypeID != nil {
		businessTypeID = *m.BusinessTypeID
		if m.BusinessType != nil {
			businessTypeName = m.BusinessType.Name
		}
	}

	return domain.Resource{
		ID:               m.ID,
		Name:             m.Name,
		Description:      m.Description,
		BusinessTypeID:   businessTypeID,
		BusinessTypeName: businessTypeName,
		CreatedAt:        m.CreatedAt,
		UpdatedAt:        m.UpdatedAt,
		DeletedAt:        deletedAt,
	}
}

// ResourcesToDomain convierte slice de modelos a slice de dominio
func ResourcesToDomain(models []models.Resource) []domain.Resource {
	result := make([]domain.Resource, len(models))
	for i, m := range models {
		result[i] = ResourceToDomain(&m)
	}
	return result
}
