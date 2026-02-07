package app

import (
	"context"

	"central_reserve/services/sporttraining/session/internal/domain"
	"central_reserve/shared/log"
)

func (uc *sessionUseCase) ListSessions(ctx context.Context, filters domain.SessionFiltersDTO) (*domain.PaginatedSessionsDTO, error) {
	ctx = log.WithFunctionCtx(ctx, "ListSessions")

	// Validar paginación
	if filters.Page < 1 {
		filters.Page = 1
	}
	if filters.PageSize < 1 || filters.PageSize > 100 {
		filters.PageSize = 10
	}

	result, err := uc.repo.List(ctx, filters)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msg("Error listando sesiones")
		return nil, err
	}

	return result, nil
}
