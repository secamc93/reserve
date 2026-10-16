package app

import (
	"context"
	"strings"

	"central_reserve/services/horizontalproperty/visit/internal/domain"
	"central_reserve/shared/log"
	"central_reserve/shared/pagination"
)

// ListVisits lista visitas con filtros y paginación
func (uc *visitUseCase) ListVisits(ctx context.Context, filters domain.VisitFiltersDTO) (*domain.PaginatedVisitsDTO, error) {
	ctx = log.WithFunctionCtx(ctx, "ListVisits")

	// Nota: Si BusinessID es 0, es un super admin y puede ver todas las visitas
	// El repositorio manejará el filtro apropiadamente

	// Validar paginación
	filters.Page, filters.PageSize = pagination.Normalize(filters.Page, filters.PageSize)
	filters.State = domain.NormalizeVisitState(filters.State)
	filters.Search = strings.TrimSpace(filters.Search)

	// Llamar al repositorio
	result, err := uc.visitRepo.ListVisits(ctx, filters)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msg("Error listando visitas")
		return nil, err
	}

	return result, nil
}
