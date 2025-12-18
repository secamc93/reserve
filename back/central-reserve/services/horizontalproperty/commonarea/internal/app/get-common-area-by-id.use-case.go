package app

import (
	"context"

	"central_reserve/services/horizontalproperty/commonarea/internal/domain"
	"central_reserve/shared/log"
)

// GetCommonAreaByID obtiene una zona común por ID
func (uc *commonAreaUseCase) GetCommonAreaByID(ctx context.Context, id uint) (*domain.CommonArea, error) {
	ctx = log.WithFunctionCtx(ctx, "GetCommonAreaByID")

	area, err := uc.commonAreaRepo.GetCommonAreaByID(ctx, id)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Uint("id", id).Msg("Error obteniendo zona común")
		return nil, err
	}

	return area, nil
}

// ListCommonAreas lista zonas comunes con filtros
func (uc *commonAreaUseCase) ListCommonAreas(ctx context.Context, filters domain.CommonAreaFiltersDTO) (*domain.PaginatedCommonAreasDTO, error) {
	ctx = log.WithFunctionCtx(ctx, "ListCommonAreas")

	result, err := uc.commonAreaRepo.ListCommonAreas(ctx, filters)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msg("Error listando zonas comunes")
		return nil, err
	}

	return result, nil
}
