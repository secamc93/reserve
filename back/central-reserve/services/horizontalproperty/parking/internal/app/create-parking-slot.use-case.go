package app

import (
	"context"
	"fmt"

	"central_reserve/services/horizontalproperty/parking/internal/domain"
	"central_reserve/shared/log"
)

// CreateParkingSlot crea un nuevo espacio de parqueo
func (uc *parkingUseCase) CreateParkingSlot(ctx context.Context, dto domain.CreateParkingSlotDTO) (*domain.ParkingSlot, error) {
	ctx = log.WithFunctionCtx(ctx, "CreateParkingSlot")

	// Validaciones básicas
	if dto.SlotNumber == "" {
		return nil, fmt.Errorf("el número de espacio es requerido")
	}
	if dto.ParkingZoneID == 0 {
		return nil, fmt.Errorf("la zona de parqueo es requerida")
	}
	if dto.ParkingTypeID == 0 {
		return nil, fmt.Errorf("el tipo de parqueadero es requerido")
	}

	// Verificar que la zona existe
	zone, err := uc.parkingZoneRepo.GetParkingZoneByID(ctx, dto.ParkingZoneID)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Uint("parking_zone_id", dto.ParkingZoneID).Msg("Error verificando zona de parqueo")
		return nil, err
	}
	if zone == nil {
		return nil, domain.ErrParkingZoneNotFound
	}

	slot := &domain.ParkingSlot{
		ParkingZoneID: dto.ParkingZoneID,
		ParkingTypeID: dto.ParkingTypeID,
		SlotNumber:    dto.SlotNumber,
		IsCovered:     dto.IsCovered,
		Width:         dto.Width,
		Length:        dto.Length,
		Height:        dto.Height,
		HasCharger:    dto.HasCharger,
		IsActive:      true,
	}

	created, err := uc.parkingSlotRepo.CreateParkingSlot(ctx, slot)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msg("Error creando espacio de parqueo")
		return nil, err
	}

	uc.logger.Info(ctx).Uint("parking_slot_id", created.ID).Uint("parking_zone_id", dto.ParkingZoneID).Msg("Espacio de parqueo creado exitosamente")

	return created, nil
}
