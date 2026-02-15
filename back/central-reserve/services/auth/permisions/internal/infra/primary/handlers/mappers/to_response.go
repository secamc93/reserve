package mappers

import (
	"central_reserve/services/auth/permisions/internal/domain"
	"central_reserve/services/auth/permisions/internal/infra/primary/handlers/response"
)

// ToPermissionResponse convierte PermissionDTO a PermissionResponse
func ToPermissionResponse(dto domain.PermissionDTO) response.PermissionResponse {
	return response.PermissionResponse{
		ID:               dto.ID,
		Name:             dto.Name,
		Code:             dto.Code,
		Description:      dto.Description,
		Resource:         dto.Resource,
		Action:           dto.Action,
		ResourceID:       dto.ResourceID,
		ActionID:         dto.ActionID,
		ScopeID:          dto.ScopeID,
		ScopeName:        dto.ScopeName,
		ScopeCode:        dto.ScopeCode,
		BusinessTypeID:   dto.BusinessTypeID,
		BusinessTypeName: dto.BusinessTypeName,
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
