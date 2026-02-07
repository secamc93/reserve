package app

import (
	"context"

	"central_reserve/services/sporttraining/booking/internal/domain"
	"central_reserve/shared/log"
)

func (uc *bookingUseCase) GetBookingByID(ctx context.Context, id uint, businessID uint) (*domain.Booking, error) {
	ctx = log.WithFunctionCtx(ctx, "GetBookingByID")

	booking, err := uc.repo.GetByID(ctx, id, businessID)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msgf("Error obteniendo reserva %d", id)
		return nil, err
	}

	return booking, nil
}
