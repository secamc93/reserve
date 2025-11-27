package usecaseshared

import (
	"context"
	"fmt"
)

// GetResidentMainUnitID obtiene el ID de la unidad principal de un residente
func (uc *SharedUseCase) GetResidentMainUnitID(ctx context.Context, residentID uint) (uint, error) {
	unitID, err := uc.repo.GetResidentMainUnitID(ctx, residentID)
	if err != nil {
		uc.logger.Error().Err(err).Uint("resident_id", residentID).Msg("Error obteniendo unidad principal del residente")
		return 0, fmt.Errorf("error obteniendo unidad principal: %w", err)
	}

	return unitID, nil
}
