package usecaseresident

import (
	"context"

	"central_reserve/services/horizontalproperty/internal/domain"
	"central_reserve/shared/log"
)

func (uc *residentUseCase) ListResidents(ctx context.Context, filters domain.ResidentFiltersDTO) (*domain.PaginatedResidentsDTO, error) {
	// Configurar contexto de logging
	ctx = log.WithFunctionCtx(ctx, "ListResidents")

	// Validar paginación
	if filters.Page < 1 {
		filters.Page = 1
	}
	if filters.PageSize < 1 || filters.PageSize > 100 {
		filters.PageSize = 10
	}

	// Obtener residentes paginados
	result, err := uc.repo.ListResidents(ctx, filters)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Uint("business_id", filters.BusinessID).Int("page", filters.Page).Int("page_size", filters.PageSize).Msg("Error listando residentes desde repositorio")
		return nil, err
	}

	return result, nil
}
