package app

import (
	"context"

	"central_reserve/shared/log"
)

func (uc *groupUseCase) RemovePlayerFromGroup(ctx context.Context, groupID uint, playerID uint, businessID uint) error {
	ctx = log.WithFunctionCtx(ctx, "RemovePlayerFromGroup")

	err := uc.repo.RemovePlayer(ctx, groupID, playerID, businessID)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msgf("Error removiendo jugador %d del grupo %d", playerID, groupID)
		return err
	}

	uc.logger.Info(ctx).Msgf("Jugador %d removido del grupo %d", playerID, groupID)
	return nil
}
