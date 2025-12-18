package app

import (
	"context"

	"central_reserve/services/horizontalproperty/parking/internal/domain"
	"central_reserve/shared/log"
)

// ListParkingReservations lista las reservas según los filtros
func (uc *parkingUseCase) ListParkingReservations(ctx context.Context, filters domain.ParkingReservationFiltersDTO) (*domain.PaginatedParkingReservationsDTO, error) {
	ctx = log.WithFunctionCtx(ctx, "ListParkingReservations")

	result, err := uc.parkingReservationRepo.ListParkingReservations(ctx, filters)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msg("Error listando reservas")
		return nil, err
	}

	return result, nil
}
