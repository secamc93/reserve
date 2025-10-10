package usecasehorizontalproperty

import (
	"fmt"
	"strings"

	"central_reserve/services/horizontalproperty/internal/domain"
	"central_reserve/shared/env"
	"central_reserve/shared/log"
	"central_reserve/shared/storage"
)

// HorizontalPropertyUseCase implementa los casos de uso de propiedades horizontales
type HorizontalPropertyUseCase struct {
	repo   domain.HorizontalPropertyRepository
	logger log.ILogger
	s3     storage.IS3Service
	env    env.IConfig
}

// NewHorizontalPropertyUseCase crea una nueva instancia del caso de uso
func NewHorizontalPropertyUseCase(
	repo domain.HorizontalPropertyRepository,
	logger log.ILogger,
	s3 storage.IS3Service,
	envConfig env.IConfig,
) domain.HorizontalPropertyUseCase {
	return &HorizontalPropertyUseCase{
		repo:   repo,
		logger: logger,
		s3:     s3,
		env:    envConfig,
	}
}

// mapToDTO convierte una entidad a DTO con detalles completos
func (uc *HorizontalPropertyUseCase) mapToDTO(property *domain.HorizontalProperty, businessType *domain.BusinessType) *domain.HorizontalPropertyDTO {
	// Completar URLs de imágenes si son paths relativos
	fullLogoURL := property.LogoURL
	if fullLogoURL != "" && !strings.HasPrefix(fullLogoURL, "http") {
		base := strings.TrimRight(uc.env.Get("URL_BASE_DOMAIN_S3"), "/")
		if base != "" {
			fullLogoURL = fmt.Sprintf("%s/%s", base, strings.TrimLeft(fullLogoURL, "/"))
		}
	}

	fullNavbarImageURL := property.NavbarImageURL
	if fullNavbarImageURL != "" && !strings.HasPrefix(fullNavbarImageURL, "http") {
		base := strings.TrimRight(uc.env.Get("URL_BASE_DOMAIN_S3"), "/")
		if base != "" {
			fullNavbarImageURL = fmt.Sprintf("%s/%s", base, strings.TrimLeft(fullNavbarImageURL, "/"))
		}
	}

	dto := &domain.HorizontalPropertyDTO{
		ID:               property.ID,
		Name:             property.Name,
		Code:             property.Code,
		BusinessTypeID:   property.BusinessTypeID,
		BusinessTypeName: businessType.Name,
		ParentBusinessID: property.ParentBusinessID,
		Timezone:         property.Timezone,
		Address:          property.Address,
		Description:      property.Description,

		LogoURL:         fullLogoURL,
		PrimaryColor:    property.PrimaryColor,
		SecondaryColor:  property.SecondaryColor,
		TertiaryColor:   property.TertiaryColor,
		QuaternaryColor: property.QuaternaryColor,
		NavbarImageURL:  fullNavbarImageURL,
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

	// Mapear unidades de propiedad si existen
	if len(property.PropertyUnits) > 0 {
		dto.PropertyUnits = make([]domain.PropertyUnitDTO, len(property.PropertyUnits))
		for i, unit := range property.PropertyUnits {
			dto.PropertyUnits[i] = domain.PropertyUnitDTO{
				ID:          unit.ID,
				Number:      unit.Number,
				Floor:       unit.Floor,
				Block:       unit.Block,
				UnitType:    unit.UnitType,
				Area:        unit.Area,
				Bedrooms:    unit.Bedrooms,
				Bathrooms:   unit.Bathrooms,
				Description: unit.Description,
				IsActive:    unit.IsActive,
			}
		}
	}

	// Mapear comités si existen
	if len(property.Committees) > 0 {
		dto.Committees = make([]domain.CommitteeDTO, len(property.Committees))
		for i, committee := range property.Committees {
			dto.Committees[i] = domain.CommitteeDTO{
				ID:              committee.ID,
				CommitteeTypeID: committee.CommitteeTypeID,
				TypeName:        committee.CommitteeType.Name,
				TypeCode:        committee.CommitteeType.Code,
				Name:            committee.Name,
				StartDate:       committee.StartDate,
				EndDate:         committee.EndDate,
				IsActive:        committee.IsActive,
				Notes:           committee.Notes,
			}
		}
	}

	return dto
}
