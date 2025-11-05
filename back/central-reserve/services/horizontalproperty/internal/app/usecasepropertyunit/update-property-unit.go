package usecasepropertyunit

import (
	"context"

	"central_reserve/services/horizontalproperty/internal/domain"
	"central_reserve/shared/log"
)

func (uc *propertyUnitUseCase) UpdatePropertyUnit(ctx context.Context, id uint, dto domain.UpdatePropertyUnitDTO) (*domain.PropertyUnitDetailDTO, error) {
	// Configurar contexto de logging
	ctx = log.WithFunctionCtx(ctx, "UpdatePropertyUnit")

	// Verificar que la unidad existe
	existing, err := uc.repo.GetPropertyUnitByID(ctx, id)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Uint("unit_id", id).Msg("Error obteniendo unidad de propiedad desde repositorio")
		return nil, err
	}
	if existing == nil {
		uc.logger.Warn(ctx).Uint("unit_id", id).Msg("Unidad de propiedad no encontrada para actualizar")
		return nil, domain.ErrPropertyUnitNotFound
	}

	// Si se está cambiando el número, verificar que no exista
	if dto.Number != nil && *dto.Number != existing.Number {
		exists, err := uc.repo.ExistsPropertyUnitByNumber(ctx, existing.BusinessID, *dto.Number, id)
		if err != nil {
			uc.logger.Error(ctx).Err(err).Uint("unit_id", id).Uint("business_id", existing.BusinessID).Str("new_number", *dto.Number).Msg("Error verificando número de unidad existente")
			return nil, err
		}
		if exists {
			uc.logger.Warn(ctx).Uint("unit_id", id).Uint("business_id", existing.BusinessID).Str("new_number", *dto.Number).Msg("Número de unidad ya existe")
			return nil, domain.ErrPropertyUnitNumberExists
		}
	}

	// Aplicar cambios
	if dto.Number != nil {
		existing.Number = *dto.Number
	}
	if dto.Floor != nil {
		existing.Floor = dto.Floor
	}
	if dto.Block != nil {
		existing.Block = *dto.Block
	}
	if dto.UnitType != nil {
		existing.UnitType = *dto.UnitType
	}
	if dto.Area != nil {
		existing.Area = dto.Area
	}
	if dto.Bedrooms != nil {
		existing.Bedrooms = dto.Bedrooms
	}
	if dto.Bathrooms != nil {
		existing.Bathrooms = dto.Bathrooms
	}
	if dto.ParticipationCoefficient != nil {
		existing.ParticipationCoefficient = dto.ParticipationCoefficient
	}
	if dto.Description != nil {
		existing.Description = *dto.Description
	}
	if dto.IsActive != nil {
		existing.IsActive = *dto.IsActive
	}

	// Actualizar en repositorio
	updated, err := uc.repo.UpdatePropertyUnit(ctx, id, existing)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Uint("unit_id", id).Uint("business_id", existing.BusinessID).Msg("Error actualizando unidad de propiedad en repositorio")
		return nil, err
	}

	// Convertir a DTO de respuesta
	return &domain.PropertyUnitDetailDTO{
		ID:                       updated.ID,
		BusinessID:               updated.BusinessID,
		Number:                   updated.Number,
		Floor:                    updated.Floor,
		Block:                    updated.Block,
		UnitType:                 updated.UnitType,
		Area:                     updated.Area,
		Bedrooms:                 updated.Bedrooms,
		Bathrooms:                updated.Bathrooms,
		ParticipationCoefficient: updated.ParticipationCoefficient,
		Description:              updated.Description,
		IsActive:                 updated.IsActive,
		CreatedAt:                updated.CreatedAt,
		UpdatedAt:                updated.UpdatedAt,
	}, nil
}
