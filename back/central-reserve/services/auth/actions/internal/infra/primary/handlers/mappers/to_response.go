package mappers

import (
	"central_reserve/services/auth/actions/internal/domain"
	"central_reserve/services/auth/actions/internal/infra/primary/handlers/response"
)

// ToActionResponse convierte un ActionDTO (o puntero) a ActionResponse
func ToActionResponse(dto *domain.ActionDTO) response.ActionResponse {
	if dto == nil {
		return response.ActionResponse{}
	}
	return response.ActionResponse{
		ID:          dto.ID,
		Name:        dto.Name,
		Description: dto.Description,
		CreatedAt:   dto.CreatedAt,
		UpdatedAt:   dto.UpdatedAt,
	}
}

// ToActionResponseList convierte una lista de ActionDTO a ActionResponse
func ToActionResponseList(dtos []domain.ActionDTO) []response.ActionResponse {
	responses := make([]response.ActionResponse, 0, len(dtos))
	for _, dto := range dtos {
		responses = append(responses, response.ActionResponse{
			ID:          dto.ID,
			Name:        dto.Name,
			Description: dto.Description,
			CreatedAt:   dto.CreatedAt,
			UpdatedAt:   dto.UpdatedAt,
		})
	}
	return responses
}

// ToActionListResponse convierte un ActionListDTO (o puntero) a ActionListResponse
func ToActionListResponse(dto *domain.ActionListDTO) response.ActionListResponse {
	if dto == nil {
		return response.ActionListResponse{}
	}
	return response.ActionListResponse{
		Actions:    ToActionResponseList(dto.Actions),
		Total:      dto.Total,
		Page:       dto.Page,
		PageSize:   dto.PageSize,
		TotalPages: dto.TotalPages,
	}
}
