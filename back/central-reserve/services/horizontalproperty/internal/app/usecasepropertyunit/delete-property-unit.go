package usecasepropertyunit

import (
	"context"

	"central_reserve/services/horizontalproperty/internal/domain"
)

func (uc *propertyUnitUseCase) DeletePropertyUnit(ctx context.Context, id uint) error {
	// Verificar que la unidad exists
	existing, err := uc.repo.GetPropertyUnitByID(ctx, id)
	if err != nil {
		uc.logger.Error().Err(err).Uint("id", id).Msg("Error obteniendo unidad de propiedad")
		return err
	}
	if existing == nil {
		return domain.ErrPropertyUnitNotFound
	}

	// Eliminar (soft delete)
	if err := uc.repo.DeletePropertyUnit(ctx, id); err != nil {
		uc.logger.Error().Err(err).Uint("id", id).Msg("Error eliminando unidad de propiedad")
		return err
	}

	uc.logger.Info().Uint("id", id).Msg("Unidad de propiedad eliminada exitosamente")
	return nil
}
