package app

import (
	"context"

	"central_reserve/services/horizontalproperty/parking/internal/domain"
	"central_reserve/shared/log"
)

// GetParkingTypes obtiene todos los tipos de parqueadero activos
func (uc *parkingUseCase) GetParkingTypes(ctx context.Context) ([]*domain.ParkingType, error) {
	ctx = log.WithFunctionCtx(ctx, "GetParkingTypes")

	types, err := uc.parkingTypeRepo.GetActiveParkingTypes(ctx)
	if err != nil {
		uc.logger.Error().Err(err).Msg("Error obteniendo tipos de parqueadero")
		return nil, err
	}

	return types, nil
}
