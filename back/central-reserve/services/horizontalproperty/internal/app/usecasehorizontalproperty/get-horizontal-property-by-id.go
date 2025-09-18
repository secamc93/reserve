package usecasehorizontalproperty

import (
	"context"
	"fmt"

	"central_reserve/services/horizontalproperty/internal/domain"
)

// GetHorizontalPropertyByID obtiene una propiedad horizontal por su ID
func (uc *HorizontalPropertyUseCase) GetHorizontalPropertyByID(ctx context.Context, id uint) (*domain.HorizontalPropertyDTO, error) {
	uc.logger.Info().Uint("id", id).Msg("Obteniendo propiedad horizontal por ID")

	// Obtener la propiedad horizontal
	property, err := uc.repo.GetHorizontalPropertyByID(ctx, id)
	if err != nil {
		uc.logger.Error().Err(err).Uint("id", id).Msg("Error obteniendo propiedad horizontal")
		return nil, domain.ErrHorizontalPropertyNotFound
	}

	// Obtener información del tipo de negocio
	businessType, err := uc.repo.GetBusinessTypeByID(ctx, property.BusinessTypeID)
	if err != nil {
		uc.logger.Error().Err(err).Uint("business_type_id", property.BusinessTypeID).Msg("Error obteniendo tipo de negocio")
		return nil, fmt.Errorf("error obteniendo tipo de negocio: %w", err)
	}

	uc.logger.Info().Uint("id", id).Str("name", property.Name).Msg("Propiedad horizontal obtenida exitosamente")

	return uc.mapToDTO(property, businessType), nil
}
