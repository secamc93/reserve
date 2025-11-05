package usecasepropertyunit

import (
	"context"

	"central_reserve/services/horizontalproperty/internal/domain"
	"central_reserve/shared/log"
)

func (uc *propertyUnitUseCase) DeletePropertyUnit(ctx context.Context, id uint) error {
	// Configurar contexto de logging
	ctx = log.WithFunctionCtx(ctx, "DeletePropertyUnit")

	// Verificar que la unidad existe
	existing, err := uc.repo.GetPropertyUnitByID(ctx, id)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Uint("unit_id", id).Msg("Error obteniendo unidad de propiedad desde repositorio")
		return err
	}
	if existing == nil {
		uc.logger.Warn(ctx).Uint("unit_id", id).Msg("Unidad de propiedad no encontrada para eliminar")
		return domain.ErrPropertyUnitNotFound
	}

	// Eliminar (soft delete)
	if err := uc.repo.DeletePropertyUnit(ctx, id); err != nil {
		uc.logger.Error(ctx).Err(err).Uint("unit_id", id).Uint("business_id", existing.BusinessID).Msg("Error eliminando unidad de propiedad en repositorio")
		return err
	}

	return nil
}
