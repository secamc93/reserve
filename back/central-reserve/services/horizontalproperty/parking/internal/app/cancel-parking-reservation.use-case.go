package app

import (
	"context"
	"time"

	"central_reserve/services/horizontalproperty/parking/internal/domain"
	"central_reserve/shared/log"
)

// CancelParkingReservation cancela una reserva de parqueadero
func (uc *parkingUseCase) CancelParkingReservation(ctx context.Context, reservationID uint, userID uint, reason string) (*domain.ParkingReservation, error) {
	ctx = log.WithFunctionCtx(ctx, "CancelParkingReservation")

	// Obtener la reserva
	reservation, err := uc.parkingReservationRepo.GetParkingReservationByID(ctx, reservationID)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Uint("parking_reservation_id", reservationID).Msg("Error obteniendo reserva")
		return nil, err
	}
	if reservation == nil {
		return nil, domain.ErrParkingReservationNotFound
	}

	// Verificar que la reserva pueda ser cancelada
	if reservation.CancelledAt != nil {
		return nil, domain.ErrParkingReservationCancelled
	}
	if reservation.CheckedOutAt != nil {
		return nil, domain.ErrInvalidStatusTransition // Ya completada
	}

	now := time.Now()
	reservation.CancelledAt = &now
	reservation.CancelledByUserID = &userID
	reservation.CancellationReason = reason

	// Actualizar estado a "cancelled" (necesitaríamos obtener el ID del estado)
	// Por ahora solo actualizamos los campos de cancelación

	err = uc.parkingReservationRepo.UpdateParkingReservation(ctx, reservation)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msg("Error cancelando reserva")
		return nil, err
	}

	// Si hay ocupación activa, cerrarla
	if reservation.CheckedInAt != nil {
		activeOccupancy, err := uc.parkingOccupancyRepo.GetActiveOccupancyBySlotID(ctx, reservation.ParkingSlotID)
		if err == nil && activeOccupancy != nil && activeOccupancy.ParkingReservationID != nil && *activeOccupancy.ParkingReservationID == reservationID {
			activeOccupancy.ExitTime = &now
			activeOccupancy.IsActive = false
			uc.parkingOccupancyRepo.UpdateParkingOccupancy(ctx, activeOccupancy)
		}
	}

	uc.logger.Info(ctx).Uint("parking_reservation_id", reservationID).Msg("Reserva de parqueadero cancelada exitosamente")

	return reservation, nil
}
