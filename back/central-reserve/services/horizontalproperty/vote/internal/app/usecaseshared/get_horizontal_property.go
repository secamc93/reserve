package usecaseshared

import (
	"central_reserve/services/horizontalproperty/vote/internal/domain"
	"context"
	"fmt"
)

// GetHorizontalPropertyBasicInfo obtiene información básica de una propiedad horizontal
func (uc *SharedUseCase) GetHorizontalPropertyBasicInfo(ctx context.Context, hpID uint) (*domain.HorizontalPropertyDTO, error) {
	hp, err := uc.repo.GetHorizontalPropertyBasicInfo(ctx, hpID)
	if err != nil {
		uc.logger.Error().Err(err).Uint("hp_id", hpID).Msg("Error obteniendo información de propiedad horizontal")
		return nil, fmt.Errorf("error obteniendo propiedad horizontal: %w", err)
	}

	return hp, nil
}
