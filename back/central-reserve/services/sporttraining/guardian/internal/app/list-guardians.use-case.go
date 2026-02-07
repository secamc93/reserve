package app

import (
	"context"

	"central_reserve/services/sporttraining/guardian/internal/domain"
	"central_reserve/shared/log"
)

func (uc *guardianUseCase) ListGuardians(ctx context.Context, filters domain.GuardianFiltersDTO) (*domain.PaginatedGuardiansDTO, error) {
	ctx = log.WithFunctionCtx(ctx, "ListGuardians")

	// Validar paginación
	if filters.Page < 1 {
		filters.Page = 1
	}
	if filters.PageSize < 1 || filters.PageSize > 100 {
		filters.PageSize = 10
	}

	result, err := uc.repo.List(ctx, filters)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msg("Error listando tutores")
		return nil, err
	}

	uc.logger.Info(ctx).Msgf("Tutores listados: %d", result.Total)
	return result, nil
}
