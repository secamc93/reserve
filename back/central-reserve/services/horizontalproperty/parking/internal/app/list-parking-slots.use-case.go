package app

import (
	"context"

	"central_reserve/services/horizontalproperty/parking/internal/domain"
	"central_reserve/shared/log"
)

// ListParkingSlots lista los espacios de parqueo según los filtros
func (uc *parkingUseCase) ListParkingSlots(ctx context.Context, filters domain.ParkingSlotFiltersDTO) (*domain.PaginatedParkingSlotsDTO, error) {
	ctx = log.WithFunctionCtx(ctx, "ListParkingSlots")

	result, err := uc.parkingSlotRepo.ListParkingSlots(ctx, filters)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msg("Error listando espacios de parqueo")
		return nil, err
	}

	return result, nil
}
