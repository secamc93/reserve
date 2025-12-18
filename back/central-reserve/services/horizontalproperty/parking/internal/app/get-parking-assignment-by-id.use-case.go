package app

import (
	"context"

	"central_reserve/services/horizontalproperty/parking/internal/domain"
	"central_reserve/shared/log"
)

// GetParkingAssignmentByID obtiene una asignación por ID
func (uc *parkingUseCase) GetParkingAssignmentByID(ctx context.Context, id uint) (*domain.ParkingAssignment, error) {
	ctx = log.WithFunctionCtx(ctx, "GetParkingAssignmentByID")

	assignment, err := uc.parkingAssignmentRepo.GetParkingAssignmentByID(ctx, id)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Uint("parking_assignment_id", id).Msg("Error obteniendo asignación")
		return nil, err
	}

	if assignment == nil {
		return nil, domain.ErrParkingAssignmentNotFound
	}

	return assignment, nil
}
