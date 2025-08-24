package usecasepermission

import (
	"central_reserve/internal/domain/dtos"
	"central_reserve/internal/domain/entities"
	"context"
	"fmt"
)

// UpdatePermission actualiza un permiso existente
func (uc *PermissionUseCase) UpdatePermission(ctx context.Context, id uint, permissionDTO dtos.UpdatePermissionDTO) (string, error) {
	uc.logger.Info().
		Uint("id", id).
		Str("name", permissionDTO.Name).
		Str("code", permissionDTO.Code).
		Msg("Actualizando permiso")

	// Validar datos de entrada
	if err := validateUpdatePermission(permissionDTO); err != nil {
		uc.logger.Error().Err(err).Msg("Error de validación al actualizar permiso")
		return "", err
	}

	// Verificar que el permiso existe
	existingPermission, err := uc.repository.GetPermissionByID(ctx, id)
	if err != nil {
		uc.logger.Error().Uint("id", id).Err(err).Msg("Error al obtener permiso para actualizar")
		return "", fmt.Errorf("permiso no encontrado: %w", err)
	}

	// Actualizar los campos del permiso existente
	updatedPermission := updatePermissionFields(*existingPermission, permissionDTO)

	// Actualizar el permiso
	result, err := uc.repository.UpdatePermission(ctx, id, updatedPermission)
	if err != nil {
		uc.logger.Error().Uint("id", id).Err(err).Msg("Error al actualizar permiso en el repositorio")
		return "", err
	}

	uc.logger.Info().Uint("id", id).Str("result", result).Msg("Permiso actualizado exitosamente")
	return result, nil
}

// validateUpdatePermission valida los datos para actualizar un permiso
func validateUpdatePermission(permission dtos.UpdatePermissionDTO) error {
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

// updatePermissionFields actualiza los campos de un permiso existente
func updatePermissionFields(existing entities.Permission, updateDTO dtos.UpdatePermissionDTO) entities.Permission {
	return entities.Permission{
		ID:          existing.ID,
		Description: updateDTO.Description,
		Resource:    updateDTO.Resource,
		Action:      updateDTO.Action,
	}
}
