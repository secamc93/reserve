package app

import (
	"context"

	"central_reserve/services/horizontalproperty/parking/internal/domain"
	"central_reserve/shared/log"
)

// CheckParkingAvailability verifica la disponibilidad de un espacio de parqueo
func (uc *parkingUseCase) CheckParkingAvailability(ctx context.Context, dto domain.CheckParkingAvailabilityDTO) (bool, error) {
	ctx = log.WithFunctionCtx(ctx, "CheckParkingAvailability")

	// Verificar que el espacio existe y está activo
	slot, err := uc.parkingSlotRepo.GetParkingSlotByID(ctx, dto.ParkingSlotID)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Uint("parking_slot_id", dto.ParkingSlotID).Msg("Error verificando espacio de parqueo")
		return false, err
	}
	if slot == nil {
		return false, domain.ErrParkingSlotNotFound
	}
	if !slot.IsActive {
		return false, domain.ErrParkingSlotInactive
	}

	// Verificar si hay una asignación activa
	activeAssignment, err := uc.parkingAssignmentRepo.GetActiveAssignmentBySlotID(ctx, dto.ParkingSlotID)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Uint("parking_slot_id", dto.ParkingSlotID).Msg("Error verificando asignaciones activas")
		return false, err
	}
	if activeAssignment != nil {
		return false, nil // No disponible si hay asignación activa
	}

	// Verificar disponibilidad en el repositorio de reservas
	isAvailable, err := uc.parkingReservationRepo.CheckAvailability(ctx, dto)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msg("Error verificando disponibilidad")
		return false, err
	}

	return isAvailable, nil
}
