package mapper

import (
	"central_reserve/internal/domain/dtos"
	"central_reserve/internal/infra/primary/http2/handlers/permissionhandler/request"
	"central_reserve/internal/infra/primary/http2/handlers/permissionhandler/response"
)

// ToCreatePermissionDTO convierte CreatePermissionRequest a CreatePermissionDTO
func ToCreatePermissionDTO(req request.CreatePermissionRequest) dtos.CreatePermissionDTO {
	return dtos.CreatePermissionDTO{
		Name:        req.Name,
		Code:        req.Code,
		Description: req.Description,
		Resource:    req.Resource,
		Action:      req.Action,
		ScopeID:     req.ScopeID,
	}
}

// ToUpdatePermissionDTO convierte UpdatePermissionRequest a UpdatePermissionDTO
func ToUpdatePermissionDTO(req request.UpdatePermissionRequest) dtos.UpdatePermissionDTO {
	return dtos.UpdatePermissionDTO{
		Name:        req.Name,
		Code:        req.Code,
		Description: req.Description,
		Resource:    req.Resource,
		Action:      req.Action,
		ScopeID:     req.ScopeID,
	}
}

// ToPermissionResponse convierte PermissionDTO a PermissionResponse
func ToPermissionResponse(dto dtos.PermissionDTO) response.PermissionResponse {
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
func ToPermissionListResponse(dtos []dtos.PermissionDTO) response.PermissionListResponse {
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
