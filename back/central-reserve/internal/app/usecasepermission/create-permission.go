package usecasepermission

import (
	"central_reserve/internal/domain/dtos"
	"central_reserve/internal/domain/entities"
	"context"
	"fmt"
)

// CreatePermission crea un nuevo permiso
func (uc *PermissionUseCase) CreatePermission(ctx context.Context, permissionDTO dtos.CreatePermissionDTO) (string, error) {
	uc.logger.Info().
		Str("name", permissionDTO.Name).
		Str("code", permissionDTO.Code).
		Str("resource", permissionDTO.Resource).
		Str("action", permissionDTO.Action).
		Msg("Creando nuevo permiso")

	// Validar datos de entrada
	if err := validateCreatePermission(permissionDTO); err != nil {
		uc.logger.Error().Err(err).Msg("Error de validación al crear permiso")
		return "", err
	}

	// Convertir DTO a entidad
	permission := dtosToPermissionEntity(permissionDTO)

	// Crear el permiso
	result, err := uc.repository.CreatePermission(ctx, permission)
	if err != nil {
		uc.logger.Error().Err(err).Msg("Error al crear permiso en el repositorio")
		return "", err
	}

	uc.logger.Info().Str("result", result).Msg("Permiso creado exitosamente")
	return result, nil
}

// validateCreatePermission valida los datos para crear un permiso
func validateCreatePermission(permission dtos.CreatePermissionDTO) error {
	if permission.Name == "" {
		return fmt.Errorf("el nombre del permiso es requerido")
	}
	if permission.Code == "" {
		return fmt.Errorf("el código del permiso es requerido")
	}
	if permission.Resource == "" {
		return fmt.Errorf("el recurso del permiso es requerido")
	}
	if permission.Action == "" {
		return fmt.Errorf("la acción del permiso es requerida")
	}
	if permission.ScopeID == 0 {
		return fmt.Errorf("el scope ID del permiso es requerido")
	}
	return nil
}

// dtosToPermissionEntity convierte un CreatePermissionDTO a entidad Permission
func dtosToPermissionEntity(permissionDTO dtos.CreatePermissionDTO) entities.Permission {
	return entities.Permission{
		Description: permissionDTO.Description,
		Resource:    permissionDTO.Resource,
		Action:      permissionDTO.Action,
	}
}
