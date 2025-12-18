package app

import (
	"context"

	"central_reserve/services/horizontalproperty/parking/internal/domain"
	"central_reserve/shared/log"
)

// GetParkingReservationByID obtiene una reserva por ID
func (uc *parkingUseCase) GetParkingReservationByID(ctx context.Context, id uint) (*domain.ParkingReservation, error) {
	ctx = log.WithFunctionCtx(ctx, "GetParkingReservationByID")

	reservation, err := uc.parkingReservationRepo.GetParkingReservationByID(ctx, id)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Uint("parking_reservation_id", id).Msg("Error obteniendo reserva")
		return nil, err
	}

	if reservation == nil {
		return nil, domain.ErrParkingReservationNotFound
	}

	return reservation, nil
}
