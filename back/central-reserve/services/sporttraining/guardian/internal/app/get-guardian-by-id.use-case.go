package app

import (
	"context"

	"central_reserve/services/sporttraining/guardian/internal/domain"
	"central_reserve/shared/log"
)

func (uc *guardianUseCase) GetGuardianByID(ctx context.Context, id uint, businessID uint) (*domain.Guardian, error) {
	ctx = log.WithFunctionCtx(ctx, "GetGuardianByID")

	guardian, err := uc.repo.GetByID(ctx, id, businessID)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msgf("Error obteniendo tutor: %d", id)
		return nil, err
	}

	uc.logger.Info(ctx).Msgf("Tutor obtenido: %d", id)
	return guardian, nil
}
