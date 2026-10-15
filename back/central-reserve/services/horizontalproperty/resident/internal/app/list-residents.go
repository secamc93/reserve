package app

import (
	"context"

	"central_reserve/services/horizontalproperty/resident/internal/domain"
	"central_reserve/shared/log"
	"central_reserve/shared/pagination"
)

func (uc *residentUseCase) ListResidents(ctx context.Context, filters domain.ResidentFiltersDTO) (*domain.PaginatedResidentsDTO, error) {
	// Configurar contexto de logging
	ctx = log.WithFunctionCtx(ctx, "ListResidents")

	// Validar paginación
	filters.Page, filters.PageSize = pagination.Normalize(filters.Page, filters.PageSize)

	// Obtener residentes paginados
	result, err := uc.repo.ListResidents(ctx, filters)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Uint("business_id", filters.BusinessID).Int("page", filters.Page).Int("page_size", filters.PageSize).Msg("Error listando residentes desde repositorio")
		return nil, err
	}

	return result, nil
}
