package mapper

import (
	"central_reserve/internal/domain/entities"
	"dbpostgres/app/infra/models"
)

// ToPermissionEntity convierte models.Permission a entities.Permission
func ToPermissionEntity(model models.Permission) entities.Permission {
	return entities.Permission{
		ID:          model.ID,
		Description: model.Action.Description,
		Resource:    model.Resource.Name,
		Action:      model.Action.Name,
	}
}

// ToPermissionEntitySlice convierte un slice de models.Permission a entities.Permission
func ToPermissionEntitySlice(models []models.Permission) []entities.Permission {
	if models == nil {
		return nil
	}

	entities := make([]entities.Permission, len(models))
	for i, model := range models {
		entities[i] = ToPermissionEntity(model)
	}
	return entities
}

// ToPermissionModel convierte entities.Permission a models.Permission
func ToPermissionModel(entity entities.Permission) models.Permission {
	return models.Permission{
		ResourceID: 0, // Se debe establecer según el nombre del recurso
		ActionID:   0, // Se debe establecer según el nombre de la acción

	}
}
