package mappers

import (
	"central_reserve/services/auth/roles/internal/domain"
	"dbpostgres/app/infra/models"
)

// RoleFromCreateDTO convierte un DTO de creación a modelo GORM
func RoleFromCreateDTO(roleDTO domain.CreateRoleDTO) models.Role {
	return models.Role{
		Name:           roleDTO.Name,
		Description:    roleDTO.Description,
		Level:          roleDTO.Level,
		IsSystem:       roleDTO.IsSystem,
		ScopeID:        roleDTO.ScopeID,
		BusinessTypeID: &roleDTO.BusinessTypeID,
	}
}
