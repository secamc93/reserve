package app

import (
	"context"

	"central_reserve/services/sporttraining/session/internal/domain"
	"central_reserve/shared/log"
)

func (uc *sessionUseCase) CancelSession(ctx context.Context, dto domain.CancelSessionDTO) (*domain.TrainingSession, error) {
	ctx = log.WithFunctionCtx(ctx, "CancelSession")

	cancelled, err := uc.repo.Cancel(ctx, dto)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msgf("Error cancelando sesión %d", dto.ID)
		return nil, err
	}

	uc.logger.Info(ctx).Msgf("Sesión cancelada: %d", dto.ID)
	return cancelled, nil
}
