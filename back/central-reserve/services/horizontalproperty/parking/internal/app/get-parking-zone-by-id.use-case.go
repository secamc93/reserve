package app

import (
	"context"

	"central_reserve/services/horizontalproperty/parking/internal/domain"
	"central_reserve/shared/log"
)

// GetParkingZoneByID obtiene una zona de parqueo por ID
func (uc *parkingUseCase) GetParkingZoneByID(ctx context.Context, id uint) (*domain.ParkingZone, error) {
	ctx = log.WithFunctionCtx(ctx, "GetParkingZoneByID")

	zone, err := uc.parkingZoneRepo.GetParkingZoneByID(ctx, id)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Uint("parking_zone_id", id).Msg("Error obteniendo zona de parqueo")
		return nil, err
	}

	if zone == nil {
		return nil, domain.ErrParkingZoneNotFound
	}

	return zone, nil
}
