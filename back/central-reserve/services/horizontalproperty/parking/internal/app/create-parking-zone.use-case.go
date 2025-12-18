package app

import (
	"context"
	"fmt"

	"central_reserve/services/horizontalproperty/parking/internal/domain"
	"central_reserve/shared/log"
)

// CreateParkingZone crea una nueva zona de parqueo
func (uc *parkingUseCase) CreateParkingZone(ctx context.Context, dto domain.CreateParkingZoneDTO) (*domain.ParkingZone, error) {
	ctx = log.WithFunctionCtx(ctx, "CreateParkingZone")

	// Validaciones básicas
	if dto.Name == "" {
		return nil, fmt.Errorf("el nombre es requerido")
	}
	if dto.Code == "" {
		return nil, fmt.Errorf("el código es requerido")
	}

	zone := &domain.ParkingZone{
		BusinessID:  dto.BusinessID,
		Name:        dto.Name,
		Code:        dto.Code,
		Description: dto.Description,
		Location:    dto.Location,
		TotalSlots:  0,
		IsActive:    true,
	}

	created, err := uc.parkingZoneRepo.CreateParkingZone(ctx, zone)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msg("Error creando zona de parqueo")
		return nil, err
	}

	uc.logger.Info(ctx).Uint("parking_zone_id", created.ID).Uint("business_id", dto.BusinessID).Msg("Zona de parqueo creada exitosamente")

	return created, nil
}
