package mappers

import (
	"central_reserve/services/business/internal/domain"
	"dbpostgres/app/infra/models"
)

// ToBusinessEntity convierte models.Business a entities.Business
func ToBusinessEntity(model models.Business) domain.Business {
	return domain.Business{
		ID:                 model.Model.ID,
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
		CreatedAt:          model.Model.CreatedAt,
		UpdatedAt:          model.Model.UpdatedAt,
		DeletedAt:          &model.Model.DeletedAt.Time,
	}
}

// ToBusinessEntitySlice convierte un slice de models.Business a entities.Business
func ToBusinessEntitySlice(models []models.Business) []domain.Business {
	if models == nil {
		return nil
	}

	entities := make([]domain.Business, len(models))
	for i, model := range models {
		entities[i] = ToBusinessEntity(model)
	}
	return entities
}

// ToBusinessModel convierte entities.Business a models.Business
func ToBusinessModel(entity domain.Business) models.Business {
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

func ToBusinessTypeResourcePermittedEntity(model models.BusinessTypeResourcePermitted) domain.BusinessTypeResourcePermitted {
	return domain.BusinessTypeResourcePermitted{
		ID:             model.Model.ID,
		BusinessTypeID: model.BusinessTypeID,
		ResourceID:     model.ResourceID,
		ResourceName:   model.Resource.Name,
	}
}

func ToBusinessTypeResourcePermittedEntitySlice(models []models.BusinessTypeResourcePermitted) []domain.BusinessTypeResourcePermitted {
	if models == nil {
		return nil
	}

	entities := make([]domain.BusinessTypeResourcePermitted, len(models))
	for i, model := range models {
		entities[i] = ToBusinessTypeResourcePermittedEntity(model)
	}
	return entities
}
