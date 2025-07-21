package usecaserole

import (
	"central_reserve/internal/domain/dtos"
	"context"
)

// GetRolesByLevel obtiene roles por nivel
func (uc *RoleUseCase) GetRolesByLevel(ctx context.Context, filters dtos.RoleFilters) ([]dtos.RoleDTO, error) {
	uc.log.Info().Int("level", filters.Level).Msg("Iniciando caso de uso: obtener roles por nivel")

	roles, err := uc.repository.GetRolesByLevel(ctx, filters.Level)
	if err != nil {
		uc.log.Error().Int("level", filters.Level).Err(err).Msg("Error al obtener roles por nivel desde el repositorio")
		return nil, err
	}

	// Convertir entidades a DTOs
	roleDTOs := make([]dtos.RoleDTO, len(roles))
	for i, role := range roles {
		roleDTOs[i] = entityToRoleDTO(role)
	}

	uc.log.Info().Int("level", filters.Level).Int("count", len(roleDTOs)).Msg("Roles por nivel obtenidos exitosamente")
	return roleDTOs, nil
}
