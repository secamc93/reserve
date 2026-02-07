package app

import (
	"context"

	"central_reserve/services/sporttraining/player/internal/domain"
	"central_reserve/shared/log"
)

func (uc *playerUseCase) ListPlayers(ctx context.Context, filters domain.PlayerFiltersDTO) (*domain.PaginatedPlayersDTO, error) {
	ctx = log.WithFunctionCtx(ctx, "ListPlayers")

	if filters.Page < 1 {
		filters.Page = 1
	}
	if filters.PageSize < 1 {
		filters.PageSize = 10
	}
	if filters.PageSize > 100 {
		filters.PageSize = 100
	}

	result, err := uc.repo.List(ctx, filters)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msg("Error listando jugadores")
		return nil, err
	}

	return result, nil
}
