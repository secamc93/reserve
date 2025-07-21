package usecaserole

import (
	"central_reserve/internal/domain/dtos"
	"context"
)

// GetSystemRoles obtiene solo los roles del sistema
func (uc *RoleUseCase) GetSystemRoles(ctx context.Context) ([]dtos.RoleDTO, error) {
	uc.log.Info().Msg("Iniciando caso de uso: obtener roles del sistema")

	roles, err := uc.repository.GetSystemRoles(ctx)
	if err != nil {
		uc.log.Error().Err(err).Msg("Error al obtener roles del sistema desde el repositorio")
		return nil, err
	}

	// Convertir entidades a DTOs
	roleDTOs := make([]dtos.RoleDTO, len(roles))
	for i, role := range roles {
		roleDTOs[i] = entityToRoleDTO(role)
	}

	uc.log.Info().Int("count", len(roleDTOs)).Msg("Roles del sistema obtenidos exitosamente")
	return roleDTOs, nil
}
