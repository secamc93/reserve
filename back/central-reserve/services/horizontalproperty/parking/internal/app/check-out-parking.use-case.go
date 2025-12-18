package app

import (
	"context"
	"time"

	"central_reserve/services/horizontalproperty/parking/internal/domain"
	"central_reserve/shared/log"
)

// CheckOutParking registra la salida de un vehículo del parqueadero
func (uc *parkingUseCase) CheckOutParking(ctx context.Context, reservationID uint, userID uint) (*domain.ParkingReservation, error) {
	ctx = log.WithFunctionCtx(ctx, "CheckOutParking")

	// Obtener la reserva
	reservation, err := uc.parkingReservationRepo.GetParkingReservationByID(ctx, reservationID)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Uint("parking_reservation_id", reservationID).Msg("Error obteniendo reserva")
		return nil, err
	}
	if reservation == nil {
		return nil, domain.ErrParkingReservationNotFound
	}

	// Verificar que haya check-in previo
	if reservation.CheckedInAt == nil {
		return nil, domain.ErrInvalidStatusTransition // No se puede hacer check-out sin check-in
	}
	if reservation.CheckedOutAt != nil {
		return nil, domain.ErrInvalidStatusTransition // Ya está registrado el check-out
	}

	now := time.Now()
	reservation.CheckedOutAt = &now
	reservation.CheckedOutByUserID = &userID

	err = uc.parkingReservationRepo.UpdateParkingReservation(ctx, reservation)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msg("Error actualizando reserva con check-out")
		return nil, err
	}

	// Actualizar registro de ocupación
	activeOccupancy, err := uc.parkingOccupancyRepo.GetActiveOccupancyBySlotID(ctx, reservation.ParkingSlotID)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Uint("parking_slot_id", reservation.ParkingSlotID).Msg("Error obteniendo ocupación activa")
		return nil, err
	}
	if activeOccupancy != nil && activeOccupancy.ParkingReservationID != nil && *activeOccupancy.ParkingReservationID == reservationID {
		activeOccupancy.ExitTime = &now
		activeOccupancy.IsActive = false
		err = uc.parkingOccupancyRepo.UpdateParkingOccupancy(ctx, activeOccupancy)
		if err != nil {
			uc.logger.Error(ctx).Err(err).Msg("Error actualizando ocupación")
			return nil, err
		}
	}

	uc.logger.Info(ctx).Uint("parking_reservation_id", reservationID).Uint("parking_slot_id", reservation.ParkingSlotID).Msg("Check-out de parqueadero registrado exitosamente")

	return reservation, nil
}
