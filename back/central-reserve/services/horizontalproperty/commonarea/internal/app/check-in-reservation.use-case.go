package app

import (
	"context"
	"fmt"
	"time"

	"central_reserve/services/horizontalproperty/commonarea/internal/domain"
	"central_reserve/shared/log"
)

// CheckInReservation registra el check-in de una reserva
func (uc *commonAreaUseCase) CheckInReservation(ctx context.Context, reservationID uint, userID uint) (*domain.CommonAreaReservation, error) {
	ctx = log.WithFunctionCtx(ctx, "CheckInReservation")

	// Cambiar estado a "checked_in" usando el repositorio
	if err := uc.reservationRepo.ChangeReservationStatus(ctx, reservationID, "checked_in"); err != nil {
		return nil, fmt.Errorf("error cambiando estado: %w", err)
	}

	// Actualizar campos de check-in
	reservation, err := uc.reservationRepo.GetReservationByID(ctx, reservationID)
	if err != nil {
		return nil, err
	}

	now := time.Now()
	reservation.CheckedInByUserID = &userID
	reservation.CheckedInAt = &now

	if err := uc.reservationRepo.UpdateReservation(ctx, reservation); err != nil {
		return nil, err
	}

	uc.logger.Info(ctx).Uint("reservation_id", reservationID).Uint("user_id", userID).Msg("Check-in registrado")

	// Recargar reserva actualizada
	return uc.reservationRepo.GetReservationByID(ctx, reservationID)
}
