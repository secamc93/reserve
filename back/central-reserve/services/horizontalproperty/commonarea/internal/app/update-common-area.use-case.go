package app

import (
	"context"
	"fmt"

	"central_reserve/services/horizontalproperty/commonarea/internal/domain"
	"central_reserve/shared/log"
)

// UpdateCommonArea edita los datos y reglas de una zona común
func (uc *commonAreaUseCase) UpdateCommonArea(ctx context.Context, dto domain.UpdateCommonAreaDTO) (*domain.CommonArea, error) {
	ctx = log.WithFunctionCtx(ctx, "UpdateCommonArea")

	if dto.Name == "" {
		return nil, fmt.Errorf("el nombre es requerido")
	}
	if dto.CommonAreaTypeID == 0 {
		return nil, fmt.Errorf("el tipo de zona común es requerido")
	}
	if dto.MaxCapacity <= 0 {
		return nil, fmt.Errorf("la capacidad máxima debe ser mayor a 0")
	}
	if dto.RequiresDeposit && (dto.DepositAmount == nil || *dto.DepositAmount <= 0) {
		return nil, fmt.Errorf("si requiere depósito, el monto debe ser mayor a 0")
	}

	current, err := uc.commonAreaRepo.GetCommonAreaByID(ctx, dto.ID)
	if err != nil {
		return nil, err
	}

	current.CommonAreaTypeID = dto.CommonAreaTypeID
	current.Name = dto.Name
	current.Description = dto.Description
	current.Location = dto.Location
	current.MaxCapacity = dto.MaxCapacity
	current.AreaSqm = dto.AreaSqm
	current.HasEquipment = dto.HasEquipment
	current.EquipmentDescription = dto.EquipmentDescription
	current.HourlyRate = dto.HourlyRate
	current.RequiresApproval = dto.RequiresApproval
	current.RequiresDeposit = dto.RequiresDeposit
	current.DepositAmount = dto.DepositAmount
	if !dto.RequiresDeposit {
		current.DepositAmount = nil
	}
	current.AllowsRecurring = dto.AllowsRecurring
	current.IsActive = dto.IsActive
	current.ImageURLs = dto.ImageURLs

	if err := uc.commonAreaRepo.UpdateCommonArea(ctx, current); err != nil {
		uc.logger.Error(ctx).Err(err).Uint("common_area_id", dto.ID).Msg("Error actualizando zona común")
		return nil, err
	}

	uc.logger.Info(ctx).Uint("common_area_id", dto.ID).Msg("Zona común actualizada")
	return uc.commonAreaRepo.GetCommonAreaByID(ctx, dto.ID)
}

// DeleteCommonArea elimina (soft delete) una zona común
func (uc *commonAreaUseCase) DeleteCommonArea(ctx context.Context, id uint) error {
	ctx = log.WithFunctionCtx(ctx, "DeleteCommonArea")

	if _, err := uc.commonAreaRepo.GetCommonAreaByID(ctx, id); err != nil {
		return err
	}
	if err := uc.commonAreaRepo.DeleteCommonArea(ctx, id); err != nil {
		uc.logger.Error(ctx).Err(err).Uint("common_area_id", id).Msg("Error eliminando zona común")
		return err
	}
	uc.logger.Info(ctx).Uint("common_area_id", id).Msg("Zona común eliminada")
	return nil
}
