package app

import (
	"context"

	"central_reserve/services/sporttraining/attendance/internal/domain"
	"central_reserve/shared/log"
)

func (uc *attendanceUseCase) ListByPlayer(ctx context.Context, filters domain.AttendanceFiltersDTO) (*domain.PaginatedAttendanceDTO, error) {
	ctx = log.WithFunctionCtx(ctx, "ListByPlayer")

	// Validar parámetros de paginación
	if filters.Page < 1 {
		filters.Page = 1
	}
	if filters.PageSize < 1 || filters.PageSize > 100 {
		filters.PageSize = 10
	}

	result, err := uc.repo.ListByPlayer(ctx, filters)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msg("Error listando asistencia por jugador")
		return nil, err
	}

	return result, nil
}
