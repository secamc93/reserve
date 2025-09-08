package mappers

import (
	"central_reserve/services/auth/internal/domain"
	"dbpostgres/app/infra/models"
)

// ToPermissionEntity convierte models.Permission a entities.Permission
func ToPermissionEntity(model models.Permission) domain.Permission {
	return domain.Permission{
		ID:          model.Model.ID,
		Description: model.Action.Description,
		Resource:    model.Resource.Name,
		Action:      model.Action.Name,
	}
}

// ToPermissionEntitySlice convierte un slice de models.Permission a entities.Permission
func ToPermissionEntitySlice(models []models.Permission) []domain.Permission {
	if models == nil {
		return nil
	}

	entities := make([]domain.Permission, len(models))
	for i, model := range models {
		entities[i] = ToPermissionEntity(model)
	}
	return entities
}

// ToPermissionModel convierte entities.Permission a models.Permission
func ToPermissionModel(entity domain.Permission) models.Permission {
	return models.Permission{
		ResourceID: 0, // Se debe establecer según el nombre del recurso
		ActionID:   0, // Se debe establecer según el nombre de la acción

	}
}
