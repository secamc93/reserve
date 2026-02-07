package app

import (
	"context"

	"central_reserve/services/sporttraining/traininggroup/internal/domain"
	"central_reserve/shared/log"
)

func (uc *groupUseCase) GetGroupPlayers(ctx context.Context, groupID uint, businessID uint) ([]domain.GroupPlayerDTO, error) {
	ctx = log.WithFunctionCtx(ctx, "GetGroupPlayers")

	players, err := uc.repo.GetGroupPlayers(ctx, groupID, businessID)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msgf("Error obteniendo jugadores del grupo: %d", groupID)
		return nil, err
	}

	return players, nil
}
