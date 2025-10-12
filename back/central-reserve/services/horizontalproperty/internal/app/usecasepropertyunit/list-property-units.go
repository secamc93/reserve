package usecasepropertyunit

import (
	"context"

	"central_reserve/services/horizontalproperty/internal/domain"
)

func (uc *propertyUnitUseCase) ListPropertyUnits(ctx context.Context, filters domain.PropertyUnitFiltersDTO) (*domain.PaginatedPropertyUnitsDTO, error) {
	// Validar paginación
	if filters.Page < 1 {
		filters.Page = 1
	}
	if filters.PageSize < 1 || filters.PageSize > 100 {
		filters.PageSize = 10
	}

	// Obtener unidades paginadas
	result, err := uc.repo.ListPropertyUnits(ctx, filters)
	if err != nil {
		uc.logger.Error().Err(err).Msg("Error listando unidades de propiedad")
		return nil, err
	}

	return result, nil
}
