package mapper

import (
	"central_reserve/services/auth/internal/domain"
	"central_reserve/services/auth/internal/infra/primary/controllers/permissionhandler/request"
	"central_reserve/services/auth/internal/infra/primary/controllers/permissionhandler/response"
)

// ToCreatePermissionDTO convierte CreatePermissionRequest a CreatePermissionDTO
func ToCreatePermissionDTO(req request.CreatePermissionRequest) domain.CreatePermissionDTO {
	return domain.CreatePermissionDTO{
		Name:        req.Name,
		Code:        req.Code,
		Description: req.Description,
		Resource:    req.Resource,
		Action:      req.Action,
		ScopeID:     req.ScopeID,
	}
}

// ToUpdatePermissionDTO convierte UpdatePermissionRequest a UpdatePermissionDTO
func ToUpdatePermissionDTO(req request.UpdatePermissionRequest) domain.UpdatePermissionDTO {
	return domain.UpdatePermissionDTO{
		Name:        req.Name,
		Code:        req.Code,
		Description: req.Description,
		Resource:    req.Resource,
		Action:      req.Action,
		ScopeID:     req.ScopeID,
	}
}

// ToPermissionResponse convierte PermissionDTO a PermissionResponse
func ToPermissionResponse(dto domain.PermissionDTO) response.PermissionResponse {
	return response.PermissionResponse{
		ID:          dto.ID,
		Name:        dto.Name,
		Code:        dto.Code,
		Description: dto.Description,
		Resource:    dto.Resource,
		Action:      dto.Action,
		ScopeID:     dto.ScopeID,
		ScopeName:   dto.ScopeName,
		ScopeCode:   dto.ScopeCode,
	}
}

// ToPermissionListResponse convierte []PermissionDTO a PermissionListResponse
func ToPermissionListResponse(dtos []domain.PermissionDTO) response.PermissionListResponse {
	permissions := make([]response.PermissionResponse, len(dtos))
	for i, dto := range dtos {
		permissions[i] = ToPermissionResponse(dto)
	}

	return response.PermissionListResponse{
		Success: true,
		Data:    permissions,
		Total:   len(permissions),
	}
}
