package app

import (
	"context"

	"central_reserve/services/horizontalproperty/packages/internal/domain"
	"central_reserve/shared/log"
	"central_reserve/shared/pagination"
)

// ListPackages lista paquetes con filtros y paginación
func (uc *packageUseCase) ListPackages(ctx context.Context, filters domain.PackageFiltersDTO) (*domain.PaginatedPackagesDTO, error) {
	ctx = log.WithFunctionCtx(ctx, "ListPackages")

	// Validar paginación
	filters.Page, filters.PageSize = pagination.Normalize(filters.Page, filters.PageSize)

	// Llamar al repositorio
	result, err := uc.packageRepo.ListPackages(ctx, filters)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msg("Error listando paquetes")
		return nil, err
	}

	return result, nil
}
