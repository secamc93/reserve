package usecasepermission

import (
	"central_reserve/services/auth/internal/domain"
	"context"
)

// GetPermissions obtiene todos los permisos
func (uc *PermissionUseCase) GetPermissions(ctx context.Context) ([]domain.PermissionDTO, error) {
	uc.logger.Info().Msg("Obteniendo todos los permisos")

	permissions, err := uc.repository.GetPermissions(ctx)
	if err != nil {
		uc.logger.Error().Err(err).Msg("Error al obtener permisos desde el repositorio")
		return nil, err
	}

	// Convertir entidades a DTOs
	permissionDTOs := make([]domain.PermissionDTO, len(permissions))
	for i, permission := range permissions {
		permissionDTOs[i] = entityToPermissionDTO(permission)
	}

	uc.logger.Info().Int("count", len(permissionDTOs)).Msg("Permisos obtenidos exitosamente")
	return permissionDTOs, nil
}

// entityToPermissionDTO convierte una entidad Permission a PermissionDTO
func entityToPermissionDTO(permission domain.Permission) domain.PermissionDTO {
	return domain.PermissionDTO{
		ID:          permission.ID,
		Description: permission.Description,
		Resource:    permission.Resource,
		Action:      permission.Action,
	}
}
