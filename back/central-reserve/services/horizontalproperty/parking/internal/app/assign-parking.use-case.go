package app

import (
	"context"
	"fmt"

	"central_reserve/services/horizontalproperty/parking/internal/domain"
	"central_reserve/shared/log"
)

// AssignParking asigna un parqueadero permanente
func (uc *parkingUseCase) AssignParking(ctx context.Context, dto domain.AssignParkingDTO) (*domain.ParkingAssignment, error) {
	ctx = log.WithFunctionCtx(ctx, "AssignParking")

	// Validaciones básicas
	if dto.VehiclePlate == "" {
		return nil, fmt.Errorf("la placa del vehículo es requerida")
	}
	if dto.ParkingSlotID == 0 {
		return nil, fmt.Errorf("el espacio de parqueo es requerido")
	}

	// Verificar que el espacio existe y está activo
	slot, err := uc.parkingSlotRepo.GetParkingSlotByID(ctx, dto.ParkingSlotID)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Uint("parking_slot_id", dto.ParkingSlotID).Msg("Error verificando espacio de parqueo")
		return nil, err
	}
	if slot == nil {
		return nil, domain.ErrParkingSlotNotFound
	}
	if !slot.IsActive {
		return nil, domain.ErrParkingSlotInactive
	}

	// Verificar que no hay una asignación activa para este espacio
	activeAssignment, err := uc.parkingAssignmentRepo.GetActiveAssignmentBySlotID(ctx, dto.ParkingSlotID)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Uint("parking_slot_id", dto.ParkingSlotID).Msg("Error verificando asignaciones activas")
		return nil, err
	}
	if activeAssignment != nil {
		return nil, domain.ErrParkingSlotAlreadyAssigned
	}

	assignedByUserID := dto.AssignedByUserID
	assignment := &domain.ParkingAssignment{
		BusinessID:       dto.BusinessID,
		ParkingSlotID:    dto.ParkingSlotID,
		PropertyUnitID:   dto.PropertyUnitID,
		ResidentID:       dto.ResidentID,
		VehiclePlate:     dto.VehiclePlate,
		VehicleBrand:     dto.VehicleBrand,
		VehicleModel:     dto.VehicleModel,
		VehicleColor:     dto.VehicleColor,
		StartDate:        dto.StartDate,
		EndDate:          dto.EndDate,
		IsActive:         true,
		Notes:            dto.Notes,
		AssignedByUserID: &assignedByUserID,
	}

	created, err := uc.parkingAssignmentRepo.CreateParkingAssignment(ctx, assignment)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msg("Error creando asignación de parqueadero")
		return nil, err
	}

	uc.logger.Info(ctx).Uint("parking_assignment_id", created.ID).Uint("parking_slot_id", dto.ParkingSlotID).Msg("Asignación de parqueadero creada exitosamente")

	return created, nil
}
