package usecasehorizontalproperty

import (
	"central_reserve/services/horizontalproperty/internal/domain"
	"central_reserve/shared/log"
)

// HorizontalPropertyUseCase implementa los casos de uso de propiedades horizontales
type HorizontalPropertyUseCase struct {
	repo   domain.HorizontalPropertyRepository
	logger log.ILogger
}

// NewHorizontalPropertyUseCase crea una nueva instancia del caso de uso
func NewHorizontalPropertyUseCase(
	repo domain.HorizontalPropertyRepository,
	logger log.ILogger,
) domain.HorizontalPropertyUseCase {
	return &HorizontalPropertyUseCase{
		repo:   repo,
		logger: logger,
	}
}

// mapToDTO convierte una entidad a DTO
func (uc *HorizontalPropertyUseCase) mapToDTO(property *domain.HorizontalProperty, businessType *domain.BusinessType) *domain.HorizontalPropertyDTO {
	return &domain.HorizontalPropertyDTO{
		ID:               property.ID,
		Name:             property.Name,
		Code:             property.Code,
		BusinessTypeID:   property.BusinessTypeID,
		BusinessTypeName: businessType.Name,
		ParentBusinessID: property.ParentBusinessID,
		Timezone:         property.Timezone,
		Address:          property.Address,
		Description:      property.Description,

		LogoURL:         property.LogoURL,
		PrimaryColor:    property.PrimaryColor,
		SecondaryColor:  property.SecondaryColor,
		TertiaryColor:   property.TertiaryColor,
		QuaternaryColor: property.QuaternaryColor,
		NavbarImageURL:  property.NavbarImageURL,
		CustomDomain:    property.CustomDomain,

		TotalUnits:    property.TotalUnits,
		TotalFloors:   property.TotalFloors,
		HasElevator:   property.HasElevator,
		HasParking:    property.HasParking,
		HasPool:       property.HasPool,
		HasGym:        property.HasGym,
		HasSocialArea: property.HasSocialArea,

		IsActive:  property.IsActive,
		CreatedAt: property.CreatedAt,
		UpdatedAt: property.UpdatedAt,
	}
}
