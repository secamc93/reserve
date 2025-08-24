package usecaserole

import (
	"central_reserve/internal/domain/dtos"
	"central_reserve/internal/domain/entities"
	"context"
)

// GetRoles obtiene todos los roles
func (uc *RoleUseCase) GetRoles(ctx context.Context) ([]dtos.RoleDTO, error) {
	uc.log.Info().Msg("Iniciando caso de uso: obtener todos los roles")

	roles, err := uc.repository.GetRoles(ctx)
	if err != nil {
		uc.log.Error().Err(err).Msg("Error al obtener roles desde el repositorio")
		return nil, err
	}

	// Convertir entidades a DTOs
	roleDTOs := make([]dtos.RoleDTO, len(roles))
	for i, role := range roles {
		roleDTOs[i] = entityToRoleDTO(role)
	}

	uc.log.Info().Int("count", len(roleDTOs)).Msg("Roles obtenidos exitosamente")
	return roleDTOs, nil
}

// entityToRoleDTO convierte una entidad Role a RoleDTO
func entityToRoleDTO(role entities.Role) dtos.RoleDTO {
	return dtos.RoleDTO{
		ID:          role.ID,
		Name:        role.Name,
		Description: role.Description,
		Level:       role.Level,
		IsSystem:    role.IsSystem,
		ScopeID:     role.ScopeID,
		ScopeName:   role.ScopeName,
		ScopeCode:   role.ScopeCode,
	}
}
