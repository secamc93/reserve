package app

import (
	"context"

	"central_reserve/services/sporttraining/traininggroup/internal/domain"
	"central_reserve/shared/log"
)

func (uc *groupUseCase) ListGroups(ctx context.Context, filters domain.GroupFiltersDTO) (*domain.PaginatedGroupsDTO, error) {
	ctx = log.WithFunctionCtx(ctx, "ListGroups")

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
		uc.logger.Error(ctx).Err(err).Msg("Error listando grupos de entrenamiento")
		return nil, err
	}

	return result, nil
}
