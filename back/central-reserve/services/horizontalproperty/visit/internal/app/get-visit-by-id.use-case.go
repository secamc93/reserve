package app

import (
	"context"

	"central_reserve/services/horizontalproperty/visit/internal/domain"
	"central_reserve/shared/log"
)

// GetVisitByID obtiene una visita por su ID
func (uc *visitUseCase) GetVisitByID(ctx context.Context, visitID uint) (*domain.Visit, error) {
	ctx = log.WithFunctionCtx(ctx, "GetVisitByID")

	if visitID == 0 {
		return nil, domain.ErrVisitNotFound
	}

	visit, err := uc.visitRepo.GetVisitByID(ctx, visitID)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Uint("visit_id", visitID).Msg("Error obteniendo visita")
		return nil, err
	}

	if visit == nil {
		return nil, domain.ErrVisitNotFound
	}

	return visit, nil
}
