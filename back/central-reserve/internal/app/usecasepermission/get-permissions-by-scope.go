package usecasepermission

import (
	"central_reserve/internal/domain/dtos"
	"context"
)

// GetPermissionsByScopeID obtiene permisos por scope ID
func (uc *PermissionUseCase) GetPermissionsByScopeID(ctx context.Context, scopeID uint) ([]dtos.PermissionDTO, error) {
	uc.logger.Info().Uint("scope_id", scopeID).Msg("Obteniendo permisos por scope ID")

	permissions, err := uc.repository.GetPermissionsByScopeID(ctx, scopeID)
	if err != nil {
		uc.logger.Error().Uint("scope_id", scopeID).Err(err).Msg("Error al obtener permisos por scope ID desde el repositorio")
		return nil, err
	}

	// Convertir entidades a DTOs
	permissionDTOs := make([]dtos.PermissionDTO, len(permissions))
	for i, permission := range permissions {
		permissionDTOs[i] = entityToPermissionDTO(permission)
	}

	uc.logger.Info().Uint("scope_id", scopeID).Int("count", len(permissionDTOs)).Msg("Permisos por scope ID obtenidos exitosamente")
	return permissionDTOs, nil
}
