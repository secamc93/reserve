package usecasehorizontalproperty

import (
	"context"
	"fmt"

	"central_reserve/services/horizontalproperty/internal/domain"
)

// DeleteHorizontalProperty elimina una propiedad horizontal
func (uc *HorizontalPropertyUseCase) DeleteHorizontalProperty(ctx context.Context, id uint) error {
	uc.logger.Info().Uint("id", id).Msg("Iniciando eliminación de propiedad horizontal")

	// Verificar que la propiedad horizontal existe
	property, err := uc.repo.GetHorizontalPropertyByID(ctx, id)
	if err != nil {
		uc.logger.Error().Err(err).Uint("id", id).Msg("Error obteniendo propiedad horizontal para eliminar")
		return domain.ErrHorizontalPropertyNotFound
	}

	// TODO: Agregar validaciones de negocio
	// - Verificar que no tenga unidades registradas
	// - Verificar que no tenga residentes activos
	// - Verificar que no tenga votaciones activas
	// - etc.

	// Por ahora solo eliminamos directamente
	err = uc.repo.DeleteHorizontalProperty(ctx, id)
	if err != nil {
		uc.logger.Error().Err(err).Uint("id", id).Msg("Error eliminando propiedad horizontal")
		return fmt.Errorf("error eliminando propiedad horizontal: %w", err)
	}

	uc.logger.Info().Uint("id", id).Str("name", property.Name).Msg("Propiedad horizontal eliminada exitosamente")

	return nil
}
