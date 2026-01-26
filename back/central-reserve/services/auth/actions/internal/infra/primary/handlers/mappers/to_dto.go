package mappers

import (
	"central_reserve/services/auth/actions/internal/domain"
	"central_reserve/services/auth/actions/internal/infra/primary/handlers/request"
)

// ToCreateActionDTO convierte un CreateActionRequest a CreateActionDTO
func ToCreateActionDTO(req request.CreateActionRequest) domain.CreateActionDTO {
	return domain.CreateActionDTO{
		Name:        req.Name,
		Description: req.Description,
	}
}

// ToUpdateActionDTO convierte un UpdateActionRequest a UpdateActionDTO
func ToUpdateActionDTO(req request.UpdateActionRequest) domain.UpdateActionDTO {
	return domain.UpdateActionDTO{
		Name:        req.Name,
		Description: req.Description,
	}
}
