package app

import (
	"context"
	"time"

	"central_reserve/services/sporttraining/booking/internal/domain"
	"central_reserve/shared/log"
)

func (uc *bookingUseCase) CancelBooking(ctx context.Context, dto domain.CancelBookingDTO) (*domain.Booking, error) {
	ctx = log.WithFunctionCtx(ctx, "CancelBooking")

	// Obtener reserva actual
	booking, err := uc.repo.GetByID(ctx, dto.ID, dto.BusinessID)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msgf("Error obteniendo reserva %d", dto.ID)
		return nil, err
	}

	// Validar que no esté en estado final
	if booking.Status != nil && booking.Status.IsFinal {
		uc.logger.Warn(ctx).Msgf("Reserva %d ya está en estado final", dto.ID)
		return nil, domain.ErrBookingInFinalState
	}

	// Obtener estado "cancelled"
	cancelledStatus, err := uc.repo.GetBookingStatusByCode(ctx, "cancelled")
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msg("Error obteniendo estado cancelled")
		return nil, err
	}

	// Actualizar reserva
	now := time.Now()
	booking.BookingStatusID = cancelledStatus.ID
	booking.CancelledAt = &now
	booking.CancelledByUserID = &dto.UserID
	booking.CancellationReason = dto.Reason

	updated, err := uc.repo.Update(ctx, booking)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msg("Error cancelando reserva")
		return nil, err
	}

	uc.logger.Info(ctx).Msgf("Reserva %d cancelada por usuario %d", dto.ID, dto.UserID)
	return updated, nil
}
