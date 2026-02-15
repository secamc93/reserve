package app

import (
	"context"
	"fmt"
	"time"

	"central_reserve/services/horizontalproperty/commonarea/internal/domain"
	"central_reserve/shared/log"
)

// ApproveReservation aprueba una reserva pendiente
func (uc *commonAreaUseCase) ApproveReservation(ctx context.Context, reservationID uint, userID uint) (*domain.CommonAreaReservation, error) {
	ctx = log.WithFunctionCtx(ctx, "ApproveReservation")

	// Cambiar estado a "approved" usando el repositorio
	if err := uc.reservationRepo.ChangeReservationStatus(ctx, reservationID, "approved"); err != nil {
		return nil, fmt.Errorf("error cambiando estado: %w", err)
	}

	// Actualizar campos de aprobación
	reservation, err := uc.reservationRepo.GetReservationByID(ctx, reservationID)
	if err != nil {
		return nil, err
	}

	now := time.Now()
	reservation.ApprovedByUserID = &userID
	reservation.ApprovedAt = &now

	if err := uc.reservationRepo.UpdateReservation(ctx, reservation); err != nil {
		return nil, err
	}

	uc.logger.Info(ctx).Uint("reservation_id", reservationID).Uint("user_id", userID).Msg("Reserva aprobada exitosamente")

	// Recargar reserva actualizada
	return uc.reservationRepo.GetReservationByID(ctx, reservationID)
}
