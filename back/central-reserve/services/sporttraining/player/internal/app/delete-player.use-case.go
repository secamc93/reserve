package app

import (
	"context"

	"central_reserve/shared/log"
)

func (uc *playerUseCase) DeletePlayer(ctx context.Context, id uint, businessID uint) error {
	ctx = log.WithFunctionCtx(ctx, "DeletePlayer")

	if err := uc.repo.Delete(ctx, id, businessID); err != nil {
		uc.logger.Error(ctx).Err(err).Msgf("Error eliminando jugador %d", id)
		return err
	}

	uc.logger.Info(ctx).Msgf("Jugador eliminado: %d", id)
	return nil
}
