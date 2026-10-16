package app

import (
	"context"
	"fmt"
	"strings"

	"central_reserve/services/horizontalproperty/parking/internal/domain"
	"central_reserve/shared/log"
)

// MaxBulkSlots es el máximo de cupos que se crean en una sola operación.
const MaxBulkSlots = 200

// BulkSlotNumbers arma los números de cupo: prefijo + número rellenado con ceros hasta `pad`
// dígitos ("P2-", 121..123, 3 → P2-121, P2-122, P2-123).
func BulkSlotNumbers(prefix string, from, to, pad int) ([]string, error) {
	if from < 0 || to < from {
		return nil, domain.ErrInvalidSlotRange
	}
	if to-from+1 > MaxBulkSlots {
		return nil, domain.ErrTooManySlots
	}
	if pad < 0 {
		pad = 0
	}
	numbers := make([]string, 0, to-from+1)
	for n := from; n <= to; n++ {
		numbers = append(numbers, fmt.Sprintf("%s%0*d", prefix, pad, n))
	}
	return numbers, nil
}

// CreateParkingSlotsBulk crea varios cupos de una zona de la propiedad con numeración consecutiva.
// Si alguno de los números ya existe en la zona no crea ninguno (ErrSlotNumberExists).
func (uc *parkingUseCase) CreateParkingSlotsBulk(ctx context.Context, dto domain.CreateParkingSlotsBulkDTO) ([]*domain.ParkingSlot, error) {
	ctx = log.WithFunctionCtx(ctx, "CreateParkingSlotsBulk")
	if dto.ParkingZoneID == 0 {
		return nil, fmt.Errorf("la zona de parqueo es requerida")
	}
	if dto.ParkingTypeID == 0 {
		return nil, fmt.Errorf("el tipo de parqueadero es requerido")
	}
	numbers, err := BulkSlotNumbers(strings.TrimSpace(dto.Prefix), dto.From, dto.To, dto.Pad)
	if err != nil {
		return nil, err
	}

	zone, err := uc.parkingZoneRepo.GetParkingZoneByID(ctx, dto.ParkingZoneID)
	if err != nil {
		return nil, err
	}
	if zone == nil || zone.BusinessID != dto.BusinessID {
		return nil, domain.ErrParkingZoneNotFound
	}

	existing, err := uc.parkingSlotRepo.ExistingSlotNumbers(ctx, dto.ParkingZoneID, numbers)
	if err != nil {
		return nil, err
	}
	if len(existing) > 0 {
		return nil, fmt.Errorf("%w: %s", domain.ErrSlotNumberExists, strings.Join(existing, ", "))
	}

	slots := make([]*domain.ParkingSlot, len(numbers))
	for i, n := range numbers {
		slots[i] = &domain.ParkingSlot{
			ParkingZoneID: dto.ParkingZoneID,
			ParkingTypeID: dto.ParkingTypeID,
			SlotNumber:    n,
			IsCovered:     dto.IsCovered,
			HasCharger:    dto.HasCharger,
			Width:         dto.Width,
			Length:        dto.Length,
			Height:        dto.Height,
			IsActive:      true,
		}
	}
	if err := uc.parkingSlotRepo.CreateParkingSlotsBulk(ctx, slots); err != nil {
		uc.logger.Error(ctx).Err(err).Uint("parking_zone_id", dto.ParkingZoneID).Msg("Error creando cupos en lote")
		return nil, err
	}
	uc.logger.Info(ctx).Uint("parking_zone_id", dto.ParkingZoneID).Int("count", len(slots)).Msg("Cupos creados en lote")
	return slots, nil
}
