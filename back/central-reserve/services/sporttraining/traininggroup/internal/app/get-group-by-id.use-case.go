package app

import (
	"context"

	"central_reserve/services/sporttraining/traininggroup/internal/domain"
	"central_reserve/shared/log"
)

func (uc *groupUseCase) GetGroupByID(ctx context.Context, id uint, businessID uint) (*domain.TrainingGroup, error) {
	ctx = log.WithFunctionCtx(ctx, "GetGroupByID")

	group, err := uc.repo.GetByID(ctx, id, businessID)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msgf("Error obteniendo grupo: %d", id)
		return nil, err
	}

	return group, nil
}
