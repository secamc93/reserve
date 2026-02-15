package app

import (
	"context"

	"central_reserve/services/sporttraining/session/internal/domain"
	"central_reserve/shared/log"
)

func (uc *sessionUseCase) GetSessionByID(ctx context.Context, id uint, businessID uint) (*domain.TrainingSession, error) {
	ctx = log.WithFunctionCtx(ctx, "GetSessionByID")

	session, err := uc.repo.GetByID(ctx, id, businessID)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msgf("Error obteniendo sesión %d", id)
		return nil, err
	}

	return session, nil
}
