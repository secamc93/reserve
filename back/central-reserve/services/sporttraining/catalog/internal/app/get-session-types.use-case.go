package app

import (
	"context"

	"central_reserve/services/sporttraining/catalog/internal/domain"
	"central_reserve/shared/log"
)

func (uc *catalogUseCase) GetSessionTypes(ctx context.Context) ([]domain.TrainingSessionType, error) {
	ctx = log.WithFunctionCtx(ctx, "GetSessionTypes")

	types, err := uc.repo.GetSessionTypes(ctx)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msg("Error obteniendo tipos de sesión")
		return nil, err
	}

	return types, nil
}
