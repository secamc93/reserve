package app

import (
	"context"

	"central_reserve/services/sporttraining/traininggroup/internal/domain"
	"central_reserve/shared/log"
)

func (uc *groupUseCase) AddPlayerToGroup(ctx context.Context, dto domain.AddPlayerDTO) error {
	ctx = log.WithFunctionCtx(ctx, "AddPlayerToGroup")

	err := uc.repo.AddPlayer(ctx, dto)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msgf("Error agregando jugador %d al grupo %d", dto.PlayerID, dto.GroupID)
		return err
	}

	uc.logger.Info(ctx).Msgf("Jugador %d agregado al grupo %d", dto.PlayerID, dto.GroupID)
	return nil
}
