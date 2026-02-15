package app

import (
	"context"

	"central_reserve/services/sporttraining/guardian/internal/domain"
	"central_reserve/shared/log"
)

func (uc *guardianUseCase) GetPlayerGuardians(ctx context.Context, playerID uint, businessID uint) ([]domain.PlayerGuardianDTO, error) {
	ctx = log.WithFunctionCtx(ctx, "GetPlayerGuardians")

	guardians, err := uc.repo.GetPlayerGuardians(ctx, playerID, businessID)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msgf("Error obteniendo tutores del jugador: %d", playerID)
		return nil, err
	}

	uc.logger.Info(ctx).Msgf("Tutores del jugador %d obtenidos: %d", playerID, len(guardians))
	return guardians, nil
}
