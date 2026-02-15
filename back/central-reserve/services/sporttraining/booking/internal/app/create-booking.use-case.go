package app

import (
	"context"
	"time"

	"central_reserve/services/sporttraining/booking/internal/domain"
	"central_reserve/shared/log"
)

func (uc *bookingUseCase) CreateBooking(ctx context.Context, dto domain.CreateBookingDTO) (*domain.Booking, error) {
	ctx = log.WithFunctionCtx(ctx, "CreateBooking")

	// Obtener estado "pending"
	pendingStatus, err := uc.repo.GetBookingStatusByCode(ctx, "pending")
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msg("Error obteniendo estado pending")
		return nil, err
	}

	booking := &domain.Booking{
		TrainingSessionID: dto.TrainingSessionID,
		PlayerID:          dto.PlayerID,
		BookedByUserID:    dto.BookedByUserID,
		BookingStatusID:   pendingStatus.ID,
		BookingDate:       time.Now(),
		RequestNotes:      dto.RequestNotes,
		IsPaid:            false,
	}

	created, err := uc.repo.Create(ctx, booking)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msg("Error creando reserva")
		return nil, err
	}

	uc.logger.Info(ctx).Msgf("Reserva creada: %d", created.ID)
	return created, nil
}
