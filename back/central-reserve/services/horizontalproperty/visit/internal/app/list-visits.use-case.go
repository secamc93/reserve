package app

import (
	"context"
	"fmt"

	"central_reserve/services/horizontalproperty/visit/internal/domain"
	"central_reserve/shared/log"
)

// ListVisits lista visitas con filtros y paginación
func (uc *visitUseCase) ListVisits(ctx context.Context, filters domain.VisitFiltersDTO) (*domain.PaginatedVisitsDTO, error) {
	ctx = log.WithFunctionCtx(ctx, "ListVisits")

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
	result, err := uc.visitRepo.ListVisits(ctx, filters)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msg("Error listando visitas")
		return nil, err
	}

	return result, nil
}
