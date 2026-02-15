package app

import (
	"context"
	"fmt"
	"time"

	"central_reserve/services/horizontalproperty/commonarea/internal/domain"
	"central_reserve/shared/log"
)

// CancelReservation cancela una reserva
func (uc *commonAreaUseCase) CancelReservation(ctx context.Context, reservationID uint, userID uint, reason string) (*domain.CommonAreaReservation, error) {
	ctx = log.WithFunctionCtx(ctx, "CancelReservation")

	// Cambiar estado a "cancelled" usando el repositorio
	if err := uc.reservationRepo.ChangeReservationStatus(ctx, reservationID, "cancelled"); err != nil {
		return nil, fmt.Errorf("error cambiando estado: %w", err)
	}

	// Actualizar campos de cancelación
	reservation, err := uc.reservationRepo.GetReservationByID(ctx, reservationID)
	if err != nil {
		return nil, err
	}

	now := time.Now()
	reservation.CancelledByUserID = &userID
	reservation.CancelledAt = &now
	reservation.CancellationReason = reason

	// TODO: Calcular reembolso si aplica

	if err := uc.reservationRepo.UpdateReservation(ctx, reservation); err != nil {
		return nil, err
	}

	uc.logger.Info(ctx).Uint("reservation_id", reservationID).Uint("user_id", userID).Msg("Reserva cancelada")

	// Recargar reserva actualizada
	return uc.reservationRepo.GetReservationByID(ctx, reservationID)
}
