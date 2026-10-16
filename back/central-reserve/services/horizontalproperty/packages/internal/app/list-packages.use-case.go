package app

import (
	"context"
	"strings"

	"central_reserve/services/horizontalproperty/packages/internal/domain"
	"central_reserve/shared/log"
	"central_reserve/shared/pagination"
)

// ListPackages lista paquetes con filtros y paginación
func (uc *packageUseCase) ListPackages(ctx context.Context, filters domain.PackageFiltersDTO) (*domain.PaginatedPackagesDTO, error) {
	ctx = log.WithFunctionCtx(ctx, "ListPackages")

	// Validar paginación
	filters.Page, filters.PageSize = pagination.Normalize(filters.Page, filters.PageSize)
	filters.StatusGroup = domain.NormalizePackageStatusGroup(filters.StatusGroup)
	filters.Search = strings.TrimSpace(filters.Search)

	// Llamar al repositorio
	result, err := uc.packageRepo.ListPackages(ctx, filters)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msg("Error listando paquetes")
		return nil, err
	}

	return result, nil
}
