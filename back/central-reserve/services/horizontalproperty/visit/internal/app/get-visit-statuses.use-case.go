package app

import (
	"context"

	"central_reserve/services/horizontalproperty/visit/internal/domain"
	"central_reserve/shared/log"
)

// GetVisitStatuses obtiene todos los estados de visita activos
func (uc *visitUseCase) GetVisitStatuses(ctx context.Context) ([]*domain.VisitStatus, error) {
	ctx = log.WithFunctionCtx(ctx, "GetVisitStatuses")

	statuses, err := uc.visitRepo.GetVisitStatuses(ctx)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msg("Error obteniendo estados de visita")
		return nil, err
	}

	return statuses, nil
}
