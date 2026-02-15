package app

import (
	"context"

	"central_reserve/services/sporttraining/player/internal/domain"
	"central_reserve/shared/log"
)

func (uc *playerUseCase) GetPlayerByID(ctx context.Context, id uint, businessID uint) (*domain.Player, error) {
	ctx = log.WithFunctionCtx(ctx, "GetPlayerByID")

	player, err := uc.repo.GetByID(ctx, id, businessID)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msgf("Error obteniendo jugador %d", id)
		return nil, err
	}

	return player, nil
}
