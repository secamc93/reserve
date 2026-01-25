package mappers

import (
	"central_reserve/services/auth/resources/internal/domain"
	"central_reserve/services/auth/resources/internal/infra/primary/handlers/response"
)

// ResourceDTOToResponse convierte DTO de dominio a response HTTP
func ResourceDTOToResponse(dto *domain.ResourceDTO) response.ResourceResponse {
	return response.ResourceResponse{
		ID:               dto.ID,
		Name:             dto.Name,
		Description:      dto.Description,
		BusinessTypeID:   dto.BusinessTypeID,
		BusinessTypeName: dto.BusinessTypeName,
		CreatedAt:        dto.CreatedAt,
		UpdatedAt:        dto.UpdatedAt,
	}
}

// ResourceDTOsToResponse convierte slice de DTOs a slice de responses
func ResourceDTOsToResponse(dtos []domain.ResourceDTO) []response.ResourceResponse {
	result := make([]response.ResourceResponse, len(dtos))
	for i, dto := range dtos {
		result[i] = response.ResourceResponse{
			ID:               dto.ID,
			Name:             dto.Name,
			Description:      dto.Description,
			BusinessTypeID:   dto.BusinessTypeID,
			BusinessTypeName: dto.BusinessTypeName,
			CreatedAt:        dto.CreatedAt,
			UpdatedAt:        dto.UpdatedAt,
		}
	}
	return result
}
