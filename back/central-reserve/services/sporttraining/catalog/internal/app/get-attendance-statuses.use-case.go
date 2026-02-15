package app

import (
	"context"

	"central_reserve/services/sporttraining/catalog/internal/domain"
	"central_reserve/shared/log"
)

func (uc *catalogUseCase) GetAttendanceStatuses(ctx context.Context) ([]domain.AttendanceStatus, error) {
	ctx = log.WithFunctionCtx(ctx, "GetAttendanceStatuses")

	statuses, err := uc.repo.GetAttendanceStatuses(ctx)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msg("Error obteniendo estados de asistencia")
		return nil, err
	}

	return statuses, nil
}
