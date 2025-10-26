package mapper

import (
	"central_reserve/services/auth/internal/domain"
	"central_reserve/services/auth/internal/infra/primary/controllers/rolehandler/request"
	"central_reserve/services/auth/internal/infra/primary/controllers/rolehandler/response"
)

// ToCreateRoleDTO convierte el request a DTO de dominio
func ToCreateRoleDTO(req request.CreateRoleRequest) domain.CreateRoleDTO {
	return domain.CreateRoleDTO{
		Name:           req.Name,
		Description:    req.Description,
		Level:          req.Level,
		IsSystem:       req.IsSystem,
		ScopeID:        req.ScopeID,
		BusinessTypeID: req.BusinessTypeID,
	}
}

// ToCreateRoleResponse convierte el DTO de dominio a response
func ToCreateRoleResponse(role *domain.Role) response.CreateRoleResponse {
	return response.CreateRoleResponse{
		Success: true,
		Message: "Rol creado exitosamente",
		Data: response.RoleData{
			ID:             role.ID,
			Name:           role.Name,
			Description:    role.Description,
			Level:          role.Level,
			IsSystem:       role.IsSystem,
			ScopeID:        role.ScopeID,
			BusinessTypeID: role.BusinessTypeID,
			CreatedAt:      role.CreatedAt,
			UpdatedAt:      role.UpdatedAt,
		},
	}
}

// ToUpdateRoleDTO convierte el request de actualización a DTO de dominio
func ToUpdateRoleDTO(req request.UpdateRoleRequest) domain.UpdateRoleDTO {
	return domain.UpdateRoleDTO{
		Name:           req.Name,
		Description:    req.Description,
		Level:          req.Level,
		IsSystem:       req.IsSystem,
		ScopeID:        req.ScopeID,
		BusinessTypeID: req.BusinessTypeID,
	}
}

// ToUpdateRoleResponse convierte el DTO de dominio a response de actualización
func ToUpdateRoleResponse(role *domain.Role) response.UpdateRoleResponse {
	return response.UpdateRoleResponse{
		Success: true,
		Message: "Rol actualizado exitosamente",
		Data: response.RoleData{
			ID:             role.ID,
			Name:           role.Name,
			Description:    role.Description,
			Level:          role.Level,
			IsSystem:       role.IsSystem,
			ScopeID:        role.ScopeID,
			BusinessTypeID: role.BusinessTypeID,
			CreatedAt:      role.CreatedAt,
			UpdatedAt:      role.UpdatedAt,
		},
	}
}
