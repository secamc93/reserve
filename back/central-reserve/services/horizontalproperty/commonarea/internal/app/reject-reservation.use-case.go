package app

import (
	"context"
	"fmt"
	"time"

	"central_reserve/services/horizontalproperty/commonarea/internal/domain"
	"central_reserve/shared/log"
)

// RejectReservation rechaza una reserva pendiente
func (uc *commonAreaUseCase) RejectReservation(ctx context.Context, reservationID uint, userID uint, reason string) (*domain.CommonAreaReservation, error) {
	ctx = log.WithFunctionCtx(ctx, "RejectReservation")

	if reason == "" {
		return nil, fmt.Errorf("la razón del rechazo es requerida")
	}

	// Cambiar estado a "rejected" usando el repositorio
	if err := uc.reservationRepo.ChangeReservationStatus(ctx, reservationID, "rejected"); err != nil {
		return nil, fmt.Errorf("error cambiando estado: %w", err)
	}

	// Actualizar campos de rechazo
	reservation, err := uc.reservationRepo.GetReservationByID(ctx, reservationID)
	if err != nil {
		return nil, err
	}

	now := time.Now()
	reservation.RejectedByUserID = &userID
	reservation.RejectedAt = &now
	reservation.RejectionReason = reason

	if err := uc.reservationRepo.UpdateReservation(ctx, reservation); err != nil {
		return nil, err
	}

	uc.logger.Info(ctx).Uint("reservation_id", reservationID).Uint("user_id", userID).Msg("Reserva rechazada")

	// Recargar reserva actualizada
	return uc.reservationRepo.GetReservationByID(ctx, reservationID)
}
