package app

import (
	"context"

	"central_reserve/services/horizontalproperty/parking/internal/domain"
	"central_reserve/shared/log"
)

// ListParkingAssignments lista las asignaciones según los filtros
func (uc *parkingUseCase) ListParkingAssignments(ctx context.Context, filters domain.ParkingAssignmentFiltersDTO) (*domain.PaginatedParkingAssignmentsDTO, error) {
	ctx = log.WithFunctionCtx(ctx, "ListParkingAssignments")

	result, err := uc.parkingAssignmentRepo.ListParkingAssignments(ctx, filters)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msg("Error listando asignaciones")
		return nil, err
	}

	return result, nil
}
