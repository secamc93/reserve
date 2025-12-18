package app

import (
	"context"
	"fmt"

	"central_reserve/services/horizontalproperty/packages/internal/domain"
	"central_reserve/shared/log"
)

// ListPackages lista paquetes con filtros y paginación
func (uc *packageUseCase) ListPackages(ctx context.Context, filters domain.PackageFiltersDTO) (*domain.PaginatedPackagesDTO, error) {
	ctx = log.WithFunctionCtx(ctx, "ListPackages")

	// Validar que businessID esté presente
	if filters.BusinessID == 0 {
		return nil, fmt.Errorf("business_id es requerido")
	}

	// Validar paginación
	if filters.Page < 1 {
		filters.Page = 1
	}
	if filters.PageSize < 1 {
		filters.PageSize = 10
	}
	if filters.PageSize > 100 {
		filters.PageSize = 100
	}

	// Llamar al repositorio
	result, err := uc.packageRepo.ListPackages(ctx, filters)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msg("Error listando paquetes")
		return nil, err
	}

	return result, nil
}
