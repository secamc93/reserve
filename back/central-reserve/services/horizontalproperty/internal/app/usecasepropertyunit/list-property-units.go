package usecasepropertyunit

import (
	"context"

	"central_reserve/services/horizontalproperty/internal/domain"
	"central_reserve/shared/log"
)

func (uc *propertyUnitUseCase) ListPropertyUnits(ctx context.Context, filters domain.PropertyUnitFiltersDTO) (*domain.PaginatedPropertyUnitsDTO, error) {
	// Configurar contexto de logging
	ctx = log.WithFunctionCtx(ctx, "ListPropertyUnits")

	// Validar paginación
	if filters.Page < 1 {
		filters.Page = 1
	}
	// Solo validar límite si PageSize está configurado
	if filters.PageSize < 1 {
		filters.PageSize = 10
	} else if filters.PageSize > 1000 {
		// Permitir hasta 1000 (para casos sin paginación como votación pública)
		filters.PageSize = 1000
	}

	// Obtener unidades paginadas
	result, err := uc.repo.ListPropertyUnits(ctx, filters)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Uint("business_id", filters.BusinessID).Int("page", filters.Page).Int("page_size", filters.PageSize).Msg("Error listando unidades de propiedad desde repositorio")
		return nil, err
	}

	return result, nil
}
