package mapper

import (
	"strings"

	"dbpostgres/app/infra/models"

	"central_reserve/services/horizontalproperty/internal/domain"
)

// ToBusinessModel mapea una entidad de dominio a modelo GORM
func ToBusinessModel(property *domain.HorizontalProperty) *models.Business {
	// Convertir ParentBusinessID de 0 a nil para evitar violación de FK
	var parentBusinessID *uint
	if property.ParentBusinessID != nil && *property.ParentBusinessID != 0 {
		parentBusinessID = property.ParentBusinessID
	}

	business := &models.Business{
		Name:               property.Name,
		Code:               property.Code,
		BusinessTypeID:     property.BusinessTypeID,
		ParentBusinessID:   parentBusinessID,
		Timezone:           property.Timezone,
		Address:            property.Address,
		Description:        property.Description,
		EnableDelivery:     property.EnableDelivery,
		EnablePickup:       property.EnablePickup,
		EnableReservations: property.EnableReservations,
		IsActive:           property.IsActive,
	}

	// Campos que pueden ser vacíos o tener valores
	business.LogoURL = emptyToZeroValue(property.LogoURL)
	business.NavbarImageURL = emptyToZeroValue(property.NavbarImageURL)
	business.PrimaryColor = emptyToZeroValue(property.PrimaryColor)
	business.SecondaryColor = emptyToZeroValue(property.SecondaryColor)
	business.TertiaryColor = emptyToZeroValue(property.TertiaryColor)
	business.QuaternaryColor = emptyToZeroValue(property.QuaternaryColor)
	business.CustomDomain = emptyToZeroValue(property.CustomDomain)

	// Solo establecer ID, CreatedAt, UpdatedAt si la entidad ya existe (para updates)
	if property.ID != 0 {
		business.ID = property.ID
		business.CreatedAt = property.CreatedAt
		business.UpdatedAt = property.UpdatedAt
	}

	return business
}

// emptyToZeroValue convierte strings vacíos a string zero value para que GORM los trate como NULL
func emptyToZeroValue(value string) string {
	if strings.TrimSpace(value) == "" {
		return ""
	}
	return value
}

// ToDomainEntity mapea un modelo GORM a entidad de dominio (sin relaciones)
func ToDomainEntity(business *models.Business) *domain.HorizontalProperty {
	return &domain.HorizontalProperty{
		ID:                 business.ID,
		Name:               business.Name,
		Code:               business.Code,
		BusinessTypeID:     business.BusinessTypeID,
		ParentBusinessID:   business.ParentBusinessID,
		Timezone:           business.Timezone,
		Address:            business.Address,
		Description:        business.Description,
		LogoURL:            business.LogoURL,
		PrimaryColor:       business.PrimaryColor,
		SecondaryColor:     business.SecondaryColor,
		TertiaryColor:      business.TertiaryColor,
		QuaternaryColor:    business.QuaternaryColor,
		NavbarImageURL:     business.NavbarImageURL,
		CustomDomain:       business.CustomDomain,
		EnableDelivery:     business.EnableDelivery,
		EnablePickup:       business.EnablePickup,
		EnableReservations: business.EnableReservations,
		// TODO: Mapear campos específicos de propiedad horizontal cuando se agreguen a Business
		TotalUnits:    getTotalUnitsFromDescription(business.Description), // Temporal
		TotalFloors:   nil,                                                // Temporal
		HasElevator:   false,                                              // Temporal
		HasParking:    false,                                              // Temporal
		HasPool:       false,                                              // Temporal
		HasGym:        false,                                              // Temporal
		HasSocialArea: false,                                              // Temporal
		IsActive:      business.IsActive,
		CreatedAt:     business.CreatedAt,
		UpdatedAt:     business.UpdatedAt,
	}
}

// ToDomainEntityWithDetails mapea un modelo GORM a entidad de dominio con relaciones
func ToDomainEntityWithDetails(business *models.Business) *domain.HorizontalProperty {
	property := ToDomainEntity(business)

	// Mapear unidades de propiedad
	if len(business.PropertyUnits) > 0 {
		property.PropertyUnits = make([]domain.PropertyUnit, len(business.PropertyUnits))
		for i, unit := range business.PropertyUnits {
			property.PropertyUnits[i] = domain.PropertyUnit{
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

	// Mapear comités
	if len(business.Committees) > 0 {
		property.Committees = make([]domain.Committee, len(business.Committees))
		for i, committee := range business.Committees {
			property.Committees[i] = domain.Committee{
				ID:              committee.ID,
				CommitteeTypeID: committee.CommitteeTypeID,
				CommitteeType: domain.CommitteeType{
					ID:   committee.CommitteeType.ID,
					Name: committee.CommitteeType.Name,
					Code: committee.CommitteeType.Code,
				},
				Name:      committee.Name,
				StartDate: committee.StartDate,
				EndDate:   committee.EndDate,
				IsActive:  committee.IsActive,
				Notes:     committee.Notes,
			}
		}
	}

	return property
}

// ToBusinessType mapea un modelo GORM BusinessType a entidad de dominio
func ToBusinessType(bt *models.BusinessType) *domain.BusinessType {
	return &domain.BusinessType{
		ID:          bt.ID,
		Name:        bt.Name,
		Code:        bt.Code,
		Description: bt.Description,
		Icon:        bt.Icon,
		IsActive:    bt.IsActive,
	}
}

// ToPropertyUnitModels convierte DTOs de creación de unidades a modelos GORM
func ToPropertyUnitModels(businessID uint, units []domain.PropertyUnitCreate) []models.PropertyUnit {
	propertyUnits := make([]models.PropertyUnit, len(units))
	for i, unit := range units {
		propertyUnits[i] = models.PropertyUnit{
			BusinessID:  businessID,
			Number:      unit.Number,
			Floor:       unit.Floor,
			Block:       unit.Block,
			UnitType:    unit.UnitType,
			Description: unit.Description,
			IsActive:    true,
		}
	}
	return propertyUnits
}

// ToCommitteeTypeInfo mapea modelos CommitteeType a DTOs de info
func ToCommitteeTypeInfo(committeeTypes []models.CommitteeType) []domain.CommitteeTypeInfo {
	result := make([]domain.CommitteeTypeInfo, len(committeeTypes))
	for i, ct := range committeeTypes {
		result[i] = domain.CommitteeTypeInfo{
			ID:                 ct.ID,
			Code:               ct.Code,
			Name:               ct.Name,
			TermDurationMonths: ct.TermDurationMonths,
		}
	}
	return result
}

// ToHorizontalPropertyListDTOs mapea una lista de modelos Business a DTOs de lista
func ToHorizontalPropertyListDTOs(businesses []models.Business) []domain.HorizontalPropertyListDTO {
	data := make([]domain.HorizontalPropertyListDTO, len(businesses))
	for i, business := range businesses {
		data[i] = domain.HorizontalPropertyListDTO{
			ID:               business.ID,
			Name:             business.Name,
			Code:             business.Code,
			BusinessTypeName: business.BusinessType.Name,
			Address:          business.Address,
			TotalUnits:       getTotalUnitsFromDescription(business.Description),
			LogoURL:          business.LogoURL,
			NavbarImageURL:   business.NavbarImageURL,
			IsActive:         business.IsActive,
			CreatedAt:        business.CreatedAt,
		}
	}
	return data
}

// getTotalUnitsFromDescription extrae el número de unidades de la descripción (temporal)
func getTotalUnitsFromDescription(description string) int {
	// Por ahora retornamos un valor por defecto
	// TODO: Implementar lógica para extraer o almacenar en campo separado
	return 1
}
