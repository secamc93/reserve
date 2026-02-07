package app

import (
	"context"

	"central_reserve/services/sporttraining/catalog/internal/domain"
	"central_reserve/shared/log"
)

func (uc *catalogUseCase) GetCoachSpecialties(ctx context.Context) ([]domain.CoachSpecialty, error) {
	ctx = log.WithFunctionCtx(ctx, "GetCoachSpecialties")

	specialties, err := uc.repo.GetCoachSpecialties(ctx)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msg("Error obteniendo especialidades de entrenador")
		return nil, err
	}

	return specialties, nil
}
