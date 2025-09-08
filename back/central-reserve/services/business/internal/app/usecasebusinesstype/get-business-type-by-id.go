package usecasebusinesstype

import (
	"central_reserve/internal/domain/dtos"
	"context"
	"fmt"
)

// GetBusinessTypeByID obtiene un tipo de negocio por ID
func (uc *BusinessTypeUseCase) GetBusinessTypeByID(ctx context.Context, id uint) (*dtos.BusinessTypeResponse, error) {
	uc.log.Info().Uint("id", id).Msg("Obteniendo tipo de negocio por ID")

	businessType, err := uc.repository.GetBusinessTypeByID(ctx, id)
	if err != nil {
		uc.log.Error().Err(err).Uint("id", id).Msg("Error al obtener tipo de negocio por ID")
		return nil, fmt.Errorf("error al obtener tipo de negocio: %w", err)
	}

	if businessType == nil {
		uc.log.Warn().Uint("id", id).Msg("Tipo de negocio no encontrado")
		return nil, fmt.Errorf("tipo de negocio no encontrado")
	}

	response := &dtos.BusinessTypeResponse{
		ID:          businessType.ID,
		Name:        businessType.Name,
		Code:        businessType.Code,
		Description: businessType.Description,
		Icon:        businessType.Icon,
		IsActive:    businessType.IsActive,
		CreatedAt:   businessType.CreatedAt,
		UpdatedAt:   businessType.UpdatedAt,
	}

	uc.log.Info().Uint("id", id).Msg("Tipo de negocio obtenido exitosamente")
	return response, nil
}
