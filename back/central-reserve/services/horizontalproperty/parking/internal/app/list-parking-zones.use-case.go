package app

import (
	"context"

	"central_reserve/services/horizontalproperty/parking/internal/domain"
	"central_reserve/shared/log"
)

// ListParkingZones lista las zonas de parqueo según los filtros
func (uc *parkingUseCase) ListParkingZones(ctx context.Context, filters domain.ParkingZoneFiltersDTO) (*domain.PaginatedParkingZonesDTO, error) {
	ctx = log.WithFunctionCtx(ctx, "ListParkingZones")

	result, err := uc.parkingZoneRepo.ListParkingZones(ctx, filters)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msg("Error listando zonas de parqueo")
		return nil, err
	}

	return result, nil
}
