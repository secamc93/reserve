package usecaserole

import (
	"central_reserve/services/auth/internal/domain"
	"context"
	"strconv"
)

// GetRoles obtiene todos los roles
func (uc *RoleUseCase) GetRoles(ctx context.Context, businessTypeIDStr string) ([]domain.RoleDTO, error) {
	uc.log.Info().Msg("Iniciando caso de uso: obtener todos los roles")

	roles, err := uc.repository.GetRoles(ctx)
	if err != nil {
		uc.log.Error().Err(err).Msg("Error al obtener roles desde el repositorio")
		return nil, err
	}

	// Filtrar por business_type_id si se proporciona
	if businessTypeIDStr != "" {
		businessTypeID, err := strconv.ParseUint(businessTypeIDStr, 10, 32)
		if err != nil {
			uc.log.Warn().Str("business_type_id", businessTypeIDStr).Msg("business_type_id inválido")
			return []domain.RoleDTO{}, nil
		}

		filteredRoles := []domain.Role{}
		for _, role := range roles {
			if role.BusinessTypeID == uint(businessTypeID) {
				filteredRoles = append(filteredRoles, role)
			}
		}
		roles = filteredRoles
	}

	// Convertir entidades a DTOs
	roleDTOs := make([]domain.RoleDTO, len(roles))
	for i, role := range roles {
		roleDTOs[i] = entityToRoleDTO(role)
	}

	uc.log.Info().Int("count", len(roleDTOs)).Msg("Roles obtenidos exitosamente")
	return roleDTOs, nil
}

// entityToRoleDTO convierte una entidad Role a RoleDTO
func entityToRoleDTO(role domain.Role) domain.RoleDTO {
	return domain.RoleDTO{
		ID:               role.ID,
		Name:             role.Name,
		Description:      role.Description,
		Level:            role.Level,
		IsSystem:         role.IsSystem,
		ScopeID:          role.ScopeID,
		ScopeName:        role.ScopeName,
		ScopeCode:        role.ScopeCode,
		BusinessTypeID:   role.BusinessTypeID,
		BusinessTypeName: role.BusinessTypeName,
	}
}
