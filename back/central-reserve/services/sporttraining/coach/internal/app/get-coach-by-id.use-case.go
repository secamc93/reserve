package app

import (
	"context"

	"central_reserve/services/sporttraining/coach/internal/domain"
	"central_reserve/shared/log"
)

func (uc *coachUseCase) GetCoachByID(ctx context.Context, id uint, businessID uint) (*domain.Coach, error) {
	ctx = log.WithFunctionCtx(ctx, "GetCoachByID")

	coach, err := uc.repo.GetByID(ctx, id, businessID)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msgf("Error obteniendo entrenador: %d", id)
		return nil, err
	}

	return coach, nil
}
