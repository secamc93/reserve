package app

import (
	"context"

	"central_reserve/services/horizontalproperty/parking/internal/domain"
	"central_reserve/shared/log"
)

// GetParkingSlotByID obtiene un espacio de parqueo por ID
func (uc *parkingUseCase) GetParkingSlotByID(ctx context.Context, id uint) (*domain.ParkingSlot, error) {
	ctx = log.WithFunctionCtx(ctx, "GetParkingSlotByID")

	slot, err := uc.parkingSlotRepo.GetParkingSlotByID(ctx, id)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Uint("parking_slot_id", id).Msg("Error obteniendo espacio de parqueo")
		return nil, err
	}

	if slot == nil {
		return nil, domain.ErrParkingSlotNotFound
	}

	return slot, nil
}
