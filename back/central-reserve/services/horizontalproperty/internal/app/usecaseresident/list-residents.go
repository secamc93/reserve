package usecaseresident

import (
	"context"

	"central_reserve/services/horizontalproperty/internal/domain"
)

func (uc *residentUseCase) ListResidents(ctx context.Context, filters domain.ResidentFiltersDTO) (*domain.PaginatedResidentsDTO, error) {
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
		uc.logger.Error().Err(err).Msg("Error listando residentes")
		return nil, err
	}

	return result, nil
}
