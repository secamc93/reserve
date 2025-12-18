package app

import (
	"context"
	"fmt"

	"central_reserve/services/horizontalproperty/commonarea/internal/domain"
	"central_reserve/shared/log"
)

// CreateCommonArea crea una nueva zona común
func (uc *commonAreaUseCase) CreateCommonArea(ctx context.Context, dto domain.CreateCommonAreaDTO) (*domain.CommonArea, error) {
	ctx = log.WithFunctionCtx(ctx, "CreateCommonArea")

	// Validaciones básicas
	if dto.Name == "" {
		return nil, fmt.Errorf("el nombre es requerido")
	}
	if dto.CommonAreaTypeID == 0 {
		return nil, fmt.Errorf("el tipo de zona común es requerido")
	}
	if dto.MaxCapacity <= 0 {
		return nil, fmt.Errorf("la capacidad máxima debe ser mayor a 0")
	}

	area := &domain.CommonArea{
		BusinessID:           dto.BusinessID,
		CommonAreaTypeID:     dto.CommonAreaTypeID,
		Name:                 dto.Name,
		Description:          dto.Description,
		Location:             dto.Location,
		MaxCapacity:          dto.MaxCapacity,
		AreaSqm:              dto.AreaSqm,
		HasEquipment:         dto.HasEquipment,
		EquipmentDescription: dto.EquipmentDescription,
		HourlyRate:           dto.HourlyRate,
		RequiresApproval:     dto.RequiresApproval,
		RequiresDeposit:      dto.RequiresDeposit,
		DepositAmount:        dto.DepositAmount,
		AllowsRecurring:      dto.AllowsRecurring,
		IsActive:             true,
		ImageURLs:            dto.ImageURLs,
	}

	created, err := uc.commonAreaRepo.CreateCommonArea(ctx, area)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msg("Error creando zona común")
		return nil, err
	}

	uc.logger.Info(ctx).Uint("common_area_id", created.ID).Uint("business_id", dto.BusinessID).Msg("Zona común creada exitosamente")

	return created, nil
}
