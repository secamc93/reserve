package usecasepermission

import (
	"context"
	"errors"
	"fmt"

	"gorm.io/gorm"
)

// DeletePermission elimina un permiso
func (uc *PermissionUseCase) DeletePermission(ctx context.Context, id uint) (string, error) {
	uc.logger.Info().Uint("id", id).Msg("Eliminando permiso")

	// Verificar que el permiso existe
	existingPermission, err := uc.repository.GetPermissionByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			uc.logger.Warn().Uint("id", id).Msg("Permiso no encontrado para eliminar")
			return "", fmt.Errorf("permiso no encontrado")
		}
		uc.logger.Error().Uint("id", id).Err(err).Msg("Error al obtener permiso para eliminar")
		return "", err
	}

	// Eliminar el permiso
	result, err := uc.repository.DeletePermission(ctx, id)
	if err != nil {
		uc.logger.Error().Uint("id", id).Err(err).Msg("Error al eliminar permiso en el repositorio")
		return "", err
	}

	uc.logger.Info().
		Uint("id", id).
		Str("resource", existingPermission.Resource).
		Str("action", existingPermission.Action).
		Str("result", result).
		Msg("Permiso eliminado exitosamente")
	return result, nil
}
