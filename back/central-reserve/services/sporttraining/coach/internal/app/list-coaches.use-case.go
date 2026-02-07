package app

import (
	"context"

	"central_reserve/services/sporttraining/coach/internal/domain"
	"central_reserve/shared/log"
)

func (uc *coachUseCase) ListCoaches(ctx context.Context, filters domain.CoachFiltersDTO) (*domain.PaginatedCoachesDTO, error) {
	ctx = log.WithFunctionCtx(ctx, "ListCoaches")

	// Validar parámetros de paginación
	if filters.Page < 1 {
		filters.Page = 1
	}
	if filters.PageSize < 1 || filters.PageSize > 100 {
		filters.PageSize = 10
	}

	result, err := uc.repo.List(ctx, filters)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msg("Error listando entrenadores")
		return nil, err
	}

	uc.logger.Info(ctx).Msgf("Listados %d entrenadores", len(result.Coaches))
	return result, nil
}
