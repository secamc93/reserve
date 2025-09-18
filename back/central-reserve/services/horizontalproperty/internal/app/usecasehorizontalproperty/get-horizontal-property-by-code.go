package usecasehorizontalproperty

import (
	"context"
	"fmt"
	"strings"

	"central_reserve/services/horizontalproperty/internal/domain"
)

// GetHorizontalPropertyByCode obtiene una propiedad horizontal por su código
func (uc *HorizontalPropertyUseCase) GetHorizontalPropertyByCode(ctx context.Context, code string) (*domain.HorizontalPropertyDTO, error) {
	normalizedCode := strings.ToLower(strings.TrimSpace(code))
	uc.logger.Info().Str("code", normalizedCode).Msg("Obteniendo propiedad horizontal por código")

	// Obtener la propiedad horizontal
	property, err := uc.repo.GetHorizontalPropertyByCode(ctx, normalizedCode)
	if err != nil {
		uc.logger.Error().Err(err).Str("code", normalizedCode).Msg("Error obteniendo propiedad horizontal")
		return nil, domain.ErrHorizontalPropertyNotFound
	}

	// Obtener información del tipo de negocio
	businessType, err := uc.repo.GetBusinessTypeByID(ctx, property.BusinessTypeID)
	if err != nil {
		uc.logger.Error().Err(err).Uint("business_type_id", property.BusinessTypeID).Msg("Error obteniendo tipo de negocio")
		return nil, fmt.Errorf("error obteniendo tipo de negocio: %w", err)
	}

	uc.logger.Info().Str("code", normalizedCode).Str("name", property.Name).Msg("Propiedad horizontal obtenida exitosamente")

	return uc.mapToDTO(property, businessType), nil
}
