package mapper

import (
	"central_reserve/internal/domain/entities"
	"dbpostgres/app/infra/models"
)

// ToBusinessEntity convierte models.Business a entities.Business
func ToBusinessEntity(model models.Business) entities.Business {
	return entities.Business{
		ID:                 model.ID,
		Name:               model.Name,
		Code:               model.Code,
		BusinessTypeID:     model.BusinessTypeID,
		Timezone:           model.Timezone,
		Address:            model.Address,
		Description:        model.Description,
		LogoURL:            model.LogoURL,
		PrimaryColor:       model.PrimaryColor,
		SecondaryColor:     model.SecondaryColor,
		TertiaryColor:      model.TertiaryColor,
		QuaternaryColor:    model.QuaternaryColor,
		NavbarImageURL:     model.NavbarImageURL,
		CustomDomain:       model.CustomDomain,
		IsActive:           model.IsActive,
		EnableDelivery:     model.EnableDelivery,
		EnablePickup:       model.EnablePickup,
		EnableReservations: model.EnableReservations,
		CreatedAt:          model.CreatedAt,
		UpdatedAt:          model.UpdatedAt,
		DeletedAt:          &model.DeletedAt.Time,
	}
}

// ToBusinessEntitySlice convierte un slice de models.Business a entities.Business
func ToBusinessEntitySlice(models []models.Business) []entities.Business {
	if models == nil {
		return nil
	}

	entities := make([]entities.Business, len(models))
	for i, model := range models {
		entities[i] = ToBusinessEntity(model)
	}
	return entities
}

// ToBusinessModel convierte entities.Business a models.Business
func ToBusinessModel(entity entities.Business) models.Business {
	return models.Business{
		Name:               entity.Name,
		Code:               entity.Code,
		BusinessTypeID:     entity.BusinessTypeID,
		Timezone:           entity.Timezone,
		Address:            entity.Address,
		Description:        entity.Description,
		LogoURL:            entity.LogoURL,
		PrimaryColor:       entity.PrimaryColor,
		SecondaryColor:     entity.SecondaryColor,
		TertiaryColor:      entity.TertiaryColor,
		QuaternaryColor:    entity.QuaternaryColor,
		NavbarImageURL:     entity.NavbarImageURL,
		CustomDomain:       entity.CustomDomain,
		IsActive:           entity.IsActive,
		EnableDelivery:     entity.EnableDelivery,
		EnablePickup:       entity.EnablePickup,
		EnableReservations: entity.EnableReservations,
	}
}
