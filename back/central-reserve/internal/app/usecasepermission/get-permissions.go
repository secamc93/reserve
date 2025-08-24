package usecasepermission

import (
	"central_reserve/internal/domain/dtos"
	"central_reserve/internal/domain/entities"
	"context"
)

// GetPermissions obtiene todos los permisos
func (uc *PermissionUseCase) GetPermissions(ctx context.Context) ([]dtos.PermissionDTO, error) {
	uc.logger.Info().Msg("Obteniendo todos los permisos")

	permissions, err := uc.repository.GetPermissions(ctx)
	if err != nil {
		uc.logger.Error().Err(err).Msg("Error al obtener permisos desde el repositorio")
		return nil, err
	}

	// Convertir entidades a DTOs
	permissionDTOs := make([]dtos.PermissionDTO, len(permissions))
	for i, permission := range permissions {
		permissionDTOs[i] = entityToPermissionDTO(permission)
	}

	uc.logger.Info().Int("count", len(permissionDTOs)).Msg("Permisos obtenidos exitosamente")
	return permissionDTOs, nil
}

// entityToPermissionDTO convierte una entidad Permission a PermissionDTO
func entityToPermissionDTO(permission entities.Permission) dtos.PermissionDTO {
	return dtos.PermissionDTO{
		ID:          permission.ID,
		Description: permission.Description,
		Resource:    permission.Resource,
		Action:      permission.Action,
	}
}
