package app

import (
	"context"

	"central_reserve/services/horizontalproperty/visit/internal/domain"
	"central_reserve/shared/log"
)

// GetVisitTypes obtiene todos los tipos de visita activos
func (uc *visitUseCase) GetVisitTypes(ctx context.Context, businessID uint) ([]*domain.VisitType, error) {
	ctx = log.WithFunctionCtx(ctx, "GetVisitTypes")

	types, err := uc.visitRepo.GetVisitTypes(ctx, businessID)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msg("Error obteniendo tipos de visita")
		return nil, err
	}

	return types, nil
}
