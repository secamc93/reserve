package mapper

import (
	"central_reserve/services/auth/internal/domain"
	"central_reserve/services/auth/internal/infra/primary/controllers/rolehandler/request"
	"central_reserve/services/auth/internal/infra/primary/controllers/rolehandler/response"
)

// ToRoleFilters convierte GetRolesByLevelRequest a filtros del dominio
func ToRoleFilters(req request.GetRolesByLevelRequest) domain.RoleFilters {
	return domain.RoleFilters{
		Level: req.Level,
	}
}

// ToRoleResponse convierte RoleDTO a RoleResponse
func ToRoleResponse(dto domain.RoleDTO) response.RoleResponse {
	return response.RoleResponse{
		ID:               dto.ID,
		Name:             dto.Name,
		Code:             dto.Code,
		Description:      dto.Description,
		Level:            dto.Level,
		IsSystem:         dto.IsSystem,
		ScopeID:          dto.ScopeID,
		ScopeName:        dto.ScopeName,
		ScopeCode:        dto.ScopeCode,
		BusinessTypeID:   dto.BusinessTypeID,
		BusinessTypeName: dto.BusinessTypeName,
	}
}

// ToRoleListResponse convierte un slice de RoleDTO a RoleListResponse
func ToRoleListResponse(roles []domain.RoleDTO) response.RoleListResponse {
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
