package usecaseresident

import (
	"context"

	"central_reserve/services/horizontalproperty/internal/domain"
	"central_reserve/shared/log"
)

func (uc *residentUseCase) GetResidentByID(ctx context.Context, id uint) (*domain.ResidentDetailDTO, error) {
	// Configurar contexto de logging
	ctx = log.WithFunctionCtx(ctx, "GetResidentByID")

	resident, err := uc.repo.GetResidentByID(ctx, id)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Uint("resident_id", id).Msg("Error obteniendo residente desde repositorio")
		return nil, err
	}

	if resident == nil {
		uc.logger.Warn(ctx).Uint("resident_id", id).Msg("Residente no encontrado")
		return nil, domain.ErrResidentNotFound
	}

	return resident, nil
}
