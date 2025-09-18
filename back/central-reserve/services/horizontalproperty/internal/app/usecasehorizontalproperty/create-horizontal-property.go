package usecasehorizontalproperty

import (
	"context"
	"fmt"
	"strings"

	"central_reserve/services/horizontalproperty/internal/domain"
)

// CreateHorizontalProperty crea una nueva propiedad horizontal
func (uc *HorizontalPropertyUseCase) CreateHorizontalProperty(ctx context.Context, dto domain.CreateHorizontalPropertyDTO) (*domain.HorizontalPropertyDTO, error) {
	uc.logger.Info().Msg("Iniciando creación de propiedad horizontal")

	// Validar que el código no exista
	exists, err := uc.repo.ExistsHorizontalPropertyByCode(ctx, dto.Code, nil)
	if err != nil {
		uc.logger.Error().Err(err).Str("code", dto.Code).Msg("Error verificando existencia del código")
		return nil, fmt.Errorf("error verificando código: %w", err)
	}
	if exists {
		uc.logger.Warn().Str("code", dto.Code).Msg("El código de propiedad horizontal ya existe")
		return nil, domain.ErrHorizontalPropertyCodeExists
	}

	// Obtener automáticamente el tipo de negocio de propiedad horizontal
	businessType, err := uc.repo.GetHorizontalPropertyType(ctx)
	if err != nil {
		uc.logger.Error().Err(err).Msg("Error obteniendo tipo de negocio horizontal_property")
		return nil, domain.ErrBusinessTypeNotFound
	}

	// Normalizar el código (lowercase, sin espacios)
	normalizedCode := strings.ToLower(strings.TrimSpace(dto.Code))

	// Crear entidad de propiedad horizontal (sin ID, timestamps se generan automáticamente)
	property := &domain.HorizontalProperty{
		Name:             strings.TrimSpace(dto.Name),
		Code:             normalizedCode,
		BusinessTypeID:   businessType.ID,
		ParentBusinessID: dto.ParentBusinessID,
		Timezone:         dto.Timezone,
		Address:          strings.TrimSpace(dto.Address),
		Description:      strings.TrimSpace(dto.Description),

		// Configuración de marca blanca con valores por defecto
		LogoURL:         dto.LogoURL,
		PrimaryColor:    getOrDefault(dto.PrimaryColor, "#1f2937"),
		SecondaryColor:  getOrDefault(dto.SecondaryColor, "#3b82f6"),
		TertiaryColor:   getOrDefault(dto.TertiaryColor, "#10b981"),
		QuaternaryColor: getOrDefault(dto.QuaternaryColor, "#fbbf24"),
		NavbarImageURL:  dto.NavbarImageURL,
		CustomDomain:    dto.CustomDomain,

		// Configuración de funcionalidades (por defecto para propiedades horizontales)
		EnableDelivery:     false, // No típico en propiedades horizontales
		EnablePickup:       false, // No típico en propiedades horizontales
		EnableReservations: true,  // Sí para áreas comunes

		// Configuración específica de propiedades horizontales
		TotalUnits:    dto.TotalUnits,
		TotalFloors:   dto.TotalFloors,
		HasElevator:   dto.HasElevator,
		HasParking:    dto.HasParking,
		HasPool:       dto.HasPool,
		HasGym:        dto.HasGym,
		HasSocialArea: dto.HasSocialArea,

		IsActive: true,
		// ID, CreatedAt, UpdatedAt se generan automáticamente
	}

	// Crear en el repositorio
	createdProperty, err := uc.repo.CreateHorizontalProperty(ctx, property)
	if err != nil {
		uc.logger.Error().Err(err).Str("name", dto.Name).Msg("Error creando propiedad horizontal")
		return nil, fmt.Errorf("error creando propiedad horizontal: %w", err)
	}

	uc.logger.Info().Uint("id", createdProperty.ID).Str("name", createdProperty.Name).Msg("Propiedad horizontal creada exitosamente")

	// Convertir a DTO de respuesta
	return uc.mapToDTO(createdProperty, businessType), nil
}

// getOrDefault retorna el valor si no está vacío, sino el valor por defecto
func getOrDefault(value, defaultValue string) string {
	if strings.TrimSpace(value) == "" {
		return defaultValue
	}
	return value
}
