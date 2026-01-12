package app

import (
	"context"

	"central_reserve/services/horizontalproperty/commonarea/internal/domain"
	"central_reserve/shared/log"
)

// GetCommonAreaTypes obtiene todos los tipos de zonas comunes activos
func (uc *commonAreaUseCase) GetCommonAreaTypes(ctx context.Context) ([]*domain.CommonAreaType, error) {
	ctx = log.WithFunctionCtx(ctx, "GetCommonAreaTypes")

	types, err := uc.commonAreaRepo.GetCommonAreaTypes(ctx)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msg("Error obteniendo tipos de zonas comunes")
		return nil, err
	}

	uc.logger.Info(ctx).Int("count", len(types)).Msg("Tipos de zonas comunes obtenidos exitosamente")
	return types, nil
}
