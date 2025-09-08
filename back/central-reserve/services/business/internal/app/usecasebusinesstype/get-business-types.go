package usecasebusinesstype

import (
	"central_reserve/internal/domain/dtos"
	"context"
	"fmt"
)

// GetBusinessTypes obtiene todos los tipos de negocio
func (uc *BusinessTypeUseCase) GetBusinessTypes(ctx context.Context) ([]dtos.BusinessTypeResponse, error) {
	uc.log.Info().Msg("Obteniendo tipos de negocio")

	businessTypes, err := uc.repository.GetBusinessTypes(ctx)
	if err != nil {
		uc.log.Error().Err(err).Msg("Error al obtener tipos de negocio")
		return nil, fmt.Errorf("error al obtener tipos de negocio: %w", err)
	}

	// Convertir entidades a DTOs
	response := make([]dtos.BusinessTypeResponse, len(businessTypes))
	for i, bt := range businessTypes {
		response[i] = dtos.BusinessTypeResponse{
			ID:          bt.ID,
			Name:        bt.Name,
			Code:        bt.Code,
			Description: bt.Description,
			Icon:        bt.Icon,
			IsActive:    bt.IsActive,
			CreatedAt:   bt.CreatedAt,
			UpdatedAt:   bt.UpdatedAt,
		}
	}

	uc.log.Info().Int("count", len(response)).Msg("Tipos de negocio obtenidos exitosamente")
	return response, nil
}
