package usecaseresident

import (
	"context"

	"central_reserve/services/horizontalproperty/internal/domain"
	"central_reserve/shared/log"
)

func (uc *residentUseCase) DeleteResident(ctx context.Context, id uint) error {
	// Configurar contexto de logging
	ctx = log.WithFunctionCtx(ctx, "DeleteResident")

	// Verificar que el residente existe
	existing, err := uc.repo.GetResidentByID(ctx, id)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Uint("resident_id", id).Msg("Error obteniendo residente desde repositorio")
		return err
	}
	if existing == nil {
		uc.logger.Warn(ctx).Uint("resident_id", id).Msg("Residente no encontrado para eliminar")
		return domain.ErrResidentNotFound
	}

	// Eliminar (soft delete)
	if err := uc.repo.DeleteResident(ctx, id); err != nil {
		uc.logger.Error(ctx).Err(err).Uint("resident_id", id).Uint("business_id", existing.BusinessID).Msg("Error eliminando residente en repositorio")
		return err
	}

	return nil
}
