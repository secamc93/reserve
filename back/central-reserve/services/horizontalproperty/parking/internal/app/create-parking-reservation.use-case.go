package app

import (
	"context"
	"fmt"
	"time"

	"central_reserve/services/horizontalproperty/parking/internal/domain"
	"central_reserve/shared/log"
)

// CreateParkingReservation crea una reserva temporal de parqueadero
func (uc *parkingUseCase) CreateParkingReservation(ctx context.Context, dto domain.CreateParkingReservationDTO) (*domain.ParkingReservation, error) {
	ctx = log.WithFunctionCtx(ctx, "CreateParkingReservation")

	// Validaciones básicas
	if dto.VehiclePlate == "" {
		return nil, fmt.Errorf("la placa del vehículo es requerida")
	}
	if dto.ParkingSlotID == 0 {
		return nil, fmt.Errorf("el espacio de parqueo es requerido")
	}
	if dto.StartTime == "" || dto.EndTime == "" {
		return nil, fmt.Errorf("el horario de inicio y fin son requeridos")
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

	// Verificar disponibilidad
	availabilityDTO := domain.CheckParkingAvailabilityDTO{
		ParkingSlotID:        dto.ParkingSlotID,
		ReservationDate:      dto.ReservationDate,
		StartTime:            dto.StartTime,
		EndTime:              dto.EndTime,
		ExcludeReservationID: nil,
	}
	isAvailable, err := uc.parkingReservationRepo.CheckAvailability(ctx, availabilityDTO)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msg("Error verificando disponibilidad")
		return nil, err
	}
	if !isAvailable {
		return nil, domain.ErrParkingSlotNotAvailable
	}

	// Calcular duración
	startTime, err := time.Parse("15:04", dto.StartTime)
	if err != nil {
		return nil, fmt.Errorf("formato de hora de inicio inválido")
	}
	endTime, err := time.Parse("15:04", dto.EndTime)
	if err != nil {
		return nil, fmt.Errorf("formato de hora de fin inválido")
	}
	duration := endTime.Sub(startTime).Hours()

	// TODO: Obtener el ID del estado desde el código (necesitaríamos un método en el repositorio)
	// Por ahora asumimos que el estado existe con código "pending" o "confirmed"
	// Estado inicial: pending si requiere aprobación, confirmed si no
	reservationStatusID := uint(1) // Esto debería obtenerse de la base de datos según el código

	reservation := &domain.ParkingReservation{
		BusinessID:          dto.BusinessID,
		ParkingSlotID:       dto.ParkingSlotID,
		PropertyUnitID:      dto.PropertyUnitID,
		ResidentID:          dto.ResidentID,
		VisitorID:           dto.VisitorID,
		VisitorVehicleID:    dto.VisitorVehicleID,
		ReservationStatusID: reservationStatusID,
		ReservationDate:     dto.ReservationDate,
		StartTime:           dto.StartTime,
		EndTime:             dto.EndTime,
		DurationHours:       duration,
		VehiclePlate:        dto.VehiclePlate,
		VehicleBrand:        dto.VehicleBrand,
		VehicleModel:        dto.VehicleModel,
		VehicleColor:        dto.VehicleColor,
		RequiresApproval:    dto.RequiresApproval,
		NotifyResident:      true,
		NotifyAdmin:         true,
		Notes:               dto.Notes,
		ResidentNotes:       dto.ResidentNotes,
	}

	created, err := uc.parkingReservationRepo.CreateParkingReservation(ctx, reservation)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msg("Error creando reserva de parqueadero")
		return nil, err
	}

	uc.logger.Info(ctx).Uint("parking_reservation_id", created.ID).Uint("parking_slot_id", dto.ParkingSlotID).Msg("Reserva de parqueadero creada exitosamente")

	return created, nil
}
