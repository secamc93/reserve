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
		uc.logger.Error().Err(err).Msg("Error listando unidades de propiedad")
		return nil, err
	}

	return result, nil
}
