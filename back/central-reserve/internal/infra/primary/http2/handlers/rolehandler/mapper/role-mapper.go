package mapper

import (
	"central_reserve/internal/domain/dtos"
	"central_reserve/internal/infra/primary/http2/handlers/rolehandler/request"
	"central_reserve/internal/infra/primary/http2/handlers/rolehandler/response"
)

// ToRoleFilters convierte GetRolesByLevelRequest a filtros del dominio
func ToRoleFilters(req request.GetRolesByLevelRequest) dtos.RoleFilters {
	return dtos.RoleFilters{
		Level: req.Level,
	}
}

// ToRoleResponse convierte RoleDTO a RoleResponse
func ToRoleResponse(dto dtos.RoleDTO) response.RoleResponse {
	return response.RoleResponse{
		ID:          dto.ID,
		Name:        dto.Name,
		Code:        dto.Code,
		Description: dto.Description,
		Level:       dto.Level,
		IsSystem:    dto.IsSystem,
		ScopeID:     dto.ScopeID,
		ScopeName:   dto.ScopeName,
		ScopeCode:   dto.ScopeCode,
	}
}

// ToRoleListResponse convierte un slice de RoleDTO a RoleListResponse
func ToRoleListResponse(roles []dtos.RoleDTO) response.RoleListResponse {
	roleResponses := make([]response.RoleResponse, len(roles))
	for i, role := range roles {
		roleResponses[i] = ToRoleResponse(role)
	}

	return response.RoleListResponse{
		Success: true,
		Data:    roleResponses,
		Count:   len(roleResponses),
	}
}
