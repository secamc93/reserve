package app

import (
	"context"

	"central_reserve/services/horizontalproperty/unit/internal/domain"
	"central_reserve/shared/log"
	"central_reserve/shared/pagination"
)

func (uc *propertyUnitUseCase) ListPropertyUnits(ctx context.Context, filters domain.PropertyUnitFiltersDTO) (*domain.PaginatedPropertyUnitsDTO, error) {
	// Configurar contexto de logging
	ctx = log.WithFunctionCtx(ctx, "ListPropertyUnits")

	// Validar paginación
	filters.Page, filters.PageSize = pagination.Normalize(filters.Page, filters.PageSize)

	// Obtener unidades paginadas
	result, err := uc.repo.ListPropertyUnits(ctx, filters)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Uint("business_id", filters.BusinessID).Int("page", filters.Page).Int("page_size", filters.PageSize).Msg("Error listando unidades de propiedad desde repositorio")
		return nil, err
	}

	return result, nil
}
