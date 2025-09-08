package usecasepermission

import (
	"central_reserve/services/auth/internal/domain"
	"context"
	"fmt"
)

// GetPermissionByID obtiene un permiso por su ID
func (uc *PermissionUseCase) GetPermissionByID(ctx context.Context, id uint) (*domain.PermissionDTO, error) {
	uc.logger.Info().Uint("id", id).Msg("Obteniendo permiso por ID")

	permission, err := uc.repository.GetPermissionByID(ctx, id)
	if err != nil {
		uc.logger.Error().Uint("id", id).Err(err).Msg("Error al obtener permiso por ID desde el repositorio")
		return nil, fmt.Errorf("permiso no encontrado: %w", err)
	}

	permissionDTO := entityToPermissionDTO(*permission)

	uc.logger.Info().Uint("id", id).Msg("Permiso obtenido exitosamente")
	return &permissionDTO, nil
}
