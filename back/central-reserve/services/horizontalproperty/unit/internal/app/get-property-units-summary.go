package app

import (
	"context"

	"central_reserve/services/horizontalproperty/unit/internal/domain"
	"central_reserve/shared/log"
)

// GetPropertyUnitsSummary devuelve los totales de unidades de una propiedad, la suma de
// coeficientes y la agrupación por bloque/torre. Exige un business_id concreto (no mezcla
// propiedades).
func (uc *propertyUnitUseCase) GetPropertyUnitsSummary(ctx context.Context, businessID uint) (*domain.PropertyUnitsSummaryDTO, error) {
	ctx = log.WithFunctionCtx(ctx, "GetPropertyUnitsSummary")

	if businessID == 0 {
		return nil, domain.ErrBusinessIDRequired
	}

	summary, err := uc.repo.GetPropertyUnitsSummary(ctx, businessID)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Uint("business_id", businessID).Msg("Error obteniendo resumen de unidades")
		return nil, err
	}
	if summary.Blocks == nil {
		summary.Blocks = []domain.PropertyUnitBlockSummaryDTO{}
	}
	return summary, nil
}
