package app

import (
	"context"
	"strings"
	"time"

	"central_reserve/services/horizontalproperty/parking/internal/domain"
	"central_reserve/shared/log"
)

// GetParkingAssignmentSummary conteos de asignaciones por estado y unidades sin cupo.
func (uc *parkingUseCase) GetParkingAssignmentSummary(ctx context.Context, businessID uint, today time.Time) (*domain.ParkingAssignmentSummaryDTO, error) {
	return uc.parkingAssignmentRepo.GetAssignmentSummary(ctx, businessID, today)
}

// assignmentInScope obtiene la asignación y verifica que sea de la propiedad.
func (uc *parkingUseCase) assignmentInScope(ctx context.Context, businessID, id uint) (*domain.ParkingAssignment, error) {
	a, err := uc.parkingAssignmentRepo.GetParkingAssignmentByID(ctx, id)
	if err != nil || a == nil || a.BusinessID != businessID {
		return nil, domain.ErrParkingAssignmentNotFound
	}
	return a, nil
}

// UpdateParkingAssignment edita el vehículo, la fecha de fin y las notas de una asignación activa.
func (uc *parkingUseCase) UpdateParkingAssignment(ctx context.Context, dto domain.UpdateParkingAssignmentDTO) (*domain.ParkingAssignment, error) {
	ctx = log.WithFunctionCtx(ctx, "UpdateParkingAssignment")
	plate := strings.ToUpper(strings.TrimSpace(dto.VehiclePlate))
	if plate == "" {
		return nil, domain.ErrInvalidVehiclePlate
	}
	a, err := uc.assignmentInScope(ctx, dto.BusinessID, dto.ID)
	if err != nil {
		return nil, err
	}
	if !a.IsActive {
		return nil, domain.ErrParkingAssignmentInactive
	}
	if dto.EndDate != nil && dto.EndDate.Before(a.StartDate) {
		return nil, domain.ErrInvalidTimeRange
	}
	a.VehiclePlate = plate
	a.VehicleBrand = strings.TrimSpace(dto.VehicleBrand)
	a.VehicleModel = strings.TrimSpace(dto.VehicleModel)
	a.VehicleColor = strings.TrimSpace(dto.VehicleColor)
	a.EndDate = dto.EndDate
	a.Notes = dto.Notes
	if err := uc.parkingAssignmentRepo.UpdateParkingAssignment(ctx, a); err != nil {
		uc.logger.Error(ctx).Err(err).Uint("parking_assignment_id", a.ID).Msg("Error editando asignación")
		return nil, err
	}
	return a, nil
}

// ReleaseParkingAssignment libera el cupo: la asignación queda inactiva con fin hoy (historial) y
// el cupo queda libre para asignarlo de nuevo.
func (uc *parkingUseCase) ReleaseParkingAssignment(ctx context.Context, businessID, assignmentID uint, today time.Time) (*domain.ParkingAssignment, error) {
	ctx = log.WithFunctionCtx(ctx, "ReleaseParkingAssignment")
	a, err := uc.assignmentInScope(ctx, businessID, assignmentID)
	if err != nil {
		return nil, err
	}
	if !a.IsActive {
		return nil, domain.ErrParkingAssignmentInactive
	}
	end := today
	if end.Before(a.StartDate) {
		end = a.StartDate
	}
	a.IsActive = false
	a.EndDate = &end
	if err := uc.parkingAssignmentRepo.UpdateParkingAssignment(ctx, a); err != nil {
		uc.logger.Error(ctx).Err(err).Uint("parking_assignment_id", a.ID).Msg("Error liberando asignación")
		return nil, err
	}
	uc.logger.Info(ctx).Uint("parking_assignment_id", a.ID).Uint("parking_slot_id", a.ParkingSlotID).Msg("Cupo liberado")
	return a, nil
}
