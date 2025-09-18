package usecasehorizontalproperty

import (
	"context"
	"fmt"
	"strings"
	"time"

	"central_reserve/services/horizontalproperty/internal/domain"
)

// UpdateHorizontalProperty actualiza una propiedad horizontal existente
func (uc *HorizontalPropertyUseCase) UpdateHorizontalProperty(ctx context.Context, id uint, dto domain.UpdateHorizontalPropertyDTO) (*domain.HorizontalPropertyDTO, error) {
	uc.logger.Info().Uint("id", id).Msg("Iniciando actualización de propiedad horizontal")

	// Obtener la propiedad horizontal existente
	existingProperty, err := uc.repo.GetHorizontalPropertyByID(ctx, id)
	if err != nil {
		uc.logger.Error().Err(err).Uint("id", id).Msg("Error obteniendo propiedad horizontal para actualizar")
		return nil, domain.ErrHorizontalPropertyNotFound
	}

	// Validar código único si se está actualizando
	if dto.Code != nil {
		normalizedCode := strings.ToLower(strings.TrimSpace(*dto.Code))
		exists, err := uc.repo.ExistsHorizontalPropertyByCode(ctx, normalizedCode, &id)
		if err != nil {
			uc.logger.Error().Err(err).Str("code", normalizedCode).Msg("Error verificando existencia del código")
			return nil, fmt.Errorf("error verificando código: %w", err)
		}
		if exists {
			uc.logger.Warn().Str("code", normalizedCode).Msg("El código de propiedad horizontal ya existe")
			return nil, domain.ErrHorizontalPropertyCodeExists
		}
		existingProperty.Code = normalizedCode
	}

	// Actualizar campos si se proporcionan
	if dto.Name != nil {
		existingProperty.Name = strings.TrimSpace(*dto.Name)
	}
	if dto.ParentBusinessID != nil {
		existingProperty.ParentBusinessID = dto.ParentBusinessID
	}
	if dto.Timezone != nil {
		existingProperty.Timezone = *dto.Timezone
	}
	if dto.Address != nil {
		existingProperty.Address = strings.TrimSpace(*dto.Address)
	}
	if dto.Description != nil {
		existingProperty.Description = strings.TrimSpace(*dto.Description)
	}

	// Actualizar configuración de marca blanca
	if dto.LogoURL != nil {
		existingProperty.LogoURL = *dto.LogoURL
	}
	if dto.PrimaryColor != nil {
		existingProperty.PrimaryColor = *dto.PrimaryColor
	}
	if dto.SecondaryColor != nil {
		existingProperty.SecondaryColor = *dto.SecondaryColor
	}
	if dto.TertiaryColor != nil {
		existingProperty.TertiaryColor = *dto.TertiaryColor
	}
	if dto.QuaternaryColor != nil {
		existingProperty.QuaternaryColor = *dto.QuaternaryColor
	}
	if dto.NavbarImageURL != nil {
		existingProperty.NavbarImageURL = *dto.NavbarImageURL
	}
	if dto.CustomDomain != nil {
		existingProperty.CustomDomain = *dto.CustomDomain
	}

	// Actualizar configuración específica de propiedades horizontales
	if dto.TotalUnits != nil {
		existingProperty.TotalUnits = *dto.TotalUnits
	}
	if dto.TotalFloors != nil {
		existingProperty.TotalFloors = dto.TotalFloors
	}
	if dto.HasElevator != nil {
		existingProperty.HasElevator = *dto.HasElevator
	}
	if dto.HasParking != nil {
		existingProperty.HasParking = *dto.HasParking
	}
	if dto.HasPool != nil {
		existingProperty.HasPool = *dto.HasPool
	}
	if dto.HasGym != nil {
		existingProperty.HasGym = *dto.HasGym
	}
	if dto.HasSocialArea != nil {
		existingProperty.HasSocialArea = *dto.HasSocialArea
	}
	if dto.IsActive != nil {
		existingProperty.IsActive = *dto.IsActive
	}

	// Actualizar timestamp
	existingProperty.UpdatedAt = time.Now()

	// Actualizar en el repositorio
	updatedProperty, err := uc.repo.UpdateHorizontalProperty(ctx, id, existingProperty)
	if err != nil {
		uc.logger.Error().Err(err).Uint("id", id).Msg("Error actualizando propiedad horizontal")
		return nil, fmt.Errorf("error actualizando propiedad horizontal: %w", err)
	}

	// Obtener información del tipo de negocio
	businessType, err := uc.repo.GetBusinessTypeByID(ctx, updatedProperty.BusinessTypeID)
	if err != nil {
		uc.logger.Error().Err(err).Uint("business_type_id", updatedProperty.BusinessTypeID).Msg("Error obteniendo tipo de negocio")
		return nil, fmt.Errorf("error obteniendo tipo de negocio: %w", err)
	}

	uc.logger.Info().Uint("id", id).Str("name", updatedProperty.Name).Msg("Propiedad horizontal actualizada exitosamente")

	return uc.mapToDTO(updatedProperty, businessType), nil
}
