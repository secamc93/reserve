package app

import (
	"context"
	"time"

	"central_reserve/services/horizontalproperty/parking/internal/domain"
	"central_reserve/shared/log"
)

// CheckInParking registra la entrada de un vehículo al parqueadero
func (uc *parkingUseCase) CheckInParking(ctx context.Context, reservationID uint, userID uint) (*domain.ParkingReservation, error) {
	ctx = log.WithFunctionCtx(ctx, "CheckInParking")

	// Obtener la reserva
	reservation, err := uc.parkingReservationRepo.GetParkingReservationByID(ctx, reservationID)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Uint("parking_reservation_id", reservationID).Msg("Error obteniendo reserva")
		return nil, err
	}
	if reservation == nil {
		return nil, domain.ErrParkingReservationNotFound
	}

	// Verificar que la reserva esté en un estado válido para check-in
	// Debe estar en "confirmed" o "pending" (si se aprueba automáticamente)
	if reservation.CheckedInAt != nil {
		return nil, domain.ErrInvalidStatusTransition // Ya está registrado el check-in
	}

	// Verificar que no haya ocupación activa en el espacio
	activeOccupancy, err := uc.parkingOccupancyRepo.GetActiveOccupancyBySlotID(ctx, reservation.ParkingSlotID)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Uint("parking_slot_id", reservation.ParkingSlotID).Msg("Error verificando ocupación activa")
		return nil, err
	}
	if activeOccupancy != nil {
		return nil, domain.ErrParkingSlotOccupied
	}

	now := time.Now()
	reservation.CheckedInAt = &now
	reservation.CheckedInByUserID = &userID

	// Actualizar estado a "checked_in" (necesitaríamos obtener el ID del estado)
	// Por ahora solo actualizamos los campos de check-in

	err = uc.parkingReservationRepo.UpdateParkingReservation(ctx, reservation)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msg("Error actualizando reserva con check-in")
		return nil, err
	}

	// Crear registro de ocupación
	occupancy := &domain.ParkingOccupancy{
		ParkingSlotID:        reservation.ParkingSlotID,
		ParkingReservationID: &reservationID,
		VehiclePlate:         reservation.VehiclePlate,
		EntryTime:            now,
		IsActive:             true,
		RegisteredByUserID:   &userID,
	}

	_, err = uc.parkingOccupancyRepo.CreateParkingOccupancy(ctx, occupancy)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msg("Error creando registro de ocupación")
		return nil, err
	}

	uc.logger.Info(ctx).Uint("parking_reservation_id", reservationID).Uint("parking_slot_id", reservation.ParkingSlotID).Msg("Check-in de parqueadero registrado exitosamente")

	return reservation, nil
}
