package usecaseshared

import (
	"central_reserve/services/horizontalproperty/vote/internal/domain"
	"context"
	"fmt"
)

// ListPropertyUnits obtiene unidades de propiedad con filtros
func (uc *SharedUseCase) ListPropertyUnits(ctx context.Context, filters domain.PropertyUnitFiltersDTO) (*domain.PaginatedPropertyUnitsDTO, error) {
	units, err := uc.repo.ListPropertyUnits(ctx, filters)
	if err != nil {
		uc.logger.Error().Err(err).Msg("Error listando unidades de propiedad")
		return nil, fmt.Errorf("error listando unidades: %w", err)
	}

	return units, nil
}
