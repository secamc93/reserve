package app

import (
	"context"
	"time"

	"central_reserve/services/sporttraining/booking/internal/domain"
	"central_reserve/shared/log"
)

func (uc *bookingUseCase) RejectBooking(ctx context.Context, dto domain.RejectBookingDTO) (*domain.Booking, error) {
	ctx = log.WithFunctionCtx(ctx, "RejectBooking")

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

	// Obtener estado "rejected"
	rejectedStatus, err := uc.repo.GetBookingStatusByCode(ctx, "rejected")
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msg("Error obteniendo estado rejected")
		return nil, err
	}

	// Actualizar reserva
	now := time.Now()
	booking.BookingStatusID = rejectedStatus.ID
	booking.ReviewedAt = &now
	booking.ReviewedByCoachID = &dto.CoachID
	booking.ResponseNotes = dto.Notes

	updated, err := uc.repo.Update(ctx, booking)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msg("Error rechazando reserva")
		return nil, err
	}

	uc.logger.Info(ctx).Msgf("Reserva %d rechazada por coach %d", dto.ID, dto.CoachID)
	return updated, nil
}
