package app

import (
	"context"

	"central_reserve/services/horizontalproperty/commonarea/internal/domain"
	"central_reserve/shared/log"
)

// GetReservationByID obtiene una reserva por ID
func (uc *commonAreaUseCase) GetReservationByID(ctx context.Context, id uint) (*domain.CommonAreaReservation, error) {
	ctx = log.WithFunctionCtx(ctx, "GetReservationByID")

	reservation, err := uc.reservationRepo.GetReservationByID(ctx, id)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Uint("id", id).Msg("Error obteniendo reserva")
		return nil, err
	}

	return reservation, nil
}
