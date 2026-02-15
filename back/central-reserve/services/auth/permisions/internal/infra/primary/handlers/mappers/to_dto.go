package mappers

import (
	"central_reserve/services/auth/permisions/internal/domain"
	"central_reserve/services/auth/permisions/internal/infra/primary/handlers/request"
)

// ToCreatePermissionDTO convierte CreatePermissionRequest a CreatePermissionDTO
func ToCreatePermissionDTO(req request.CreatePermissionRequest) domain.CreatePermissionDTO {
	return domain.CreatePermissionDTO{
		Name:           req.Name,
		Code:           req.Code,
		Description:    req.Description,
		ResourceID:     req.ResourceID,
		ActionID:       req.ActionID,
		ScopeID:        req.ScopeID,
		BusinessTypeID: req.BusinessTypeID,
	}
}

// ToUpdatePermissionDTO convierte UpdatePermissionRequest a UpdatePermissionDTO
func ToUpdatePermissionDTO(req request.UpdatePermissionRequest) domain.UpdatePermissionDTO {
	return domain.UpdatePermissionDTO{
		Name:           req.Name,
		Code:           req.Code,
		Description:    req.Description,
		ResourceID:     req.ResourceID,
		ActionID:       req.ActionID,
		ScopeID:        req.ScopeID,
		BusinessTypeID: req.BusinessTypeID,
	}
}
