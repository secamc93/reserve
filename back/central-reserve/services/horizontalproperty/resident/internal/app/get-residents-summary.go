package app

import (
	"context"

	"central_reserve/services/horizontalproperty/resident/internal/domain"
	"central_reserve/shared/log"
)

// GetResidentsSummary devuelve los totales de residentes de una propiedad y el conteo por
// tipo. Exige un business_id concreto (no mezcla propiedades).
func (uc *residentUseCase) GetResidentsSummary(ctx context.Context, businessID uint) (*domain.ResidentsSummaryDTO, error) {
	ctx = log.WithFunctionCtx(ctx, "GetResidentsSummary")

	if businessID == 0 {
		return nil, domain.ErrBusinessIDRequired
	}
	summary, err := uc.repo.GetResidentsSummary(ctx, businessID)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Uint("business_id", businessID).Msg("Error obteniendo resumen de residentes")
		return nil, err
	}
	if summary.Types == nil {
		summary.Types = []domain.ResidentTypeCountDTO{}
	}
	return summary, nil
}
