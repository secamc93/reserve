package usecasepropertyunit

import (
	"context"

	"central_reserve/services/horizontalproperty/internal/domain"
	"central_reserve/shared/log"
)

func (uc *propertyUnitUseCase) GetPropertyUnitByID(ctx context.Context, id uint) (*domain.PropertyUnitDetailDTO, error) {
	// Configurar contexto de logging
	ctx = log.WithFunctionCtx(ctx, "GetPropertyUnitByID")

	unit, err := uc.repo.GetPropertyUnitByID(ctx, id)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Uint("unit_id", id).Msg("Error obteniendo unidad de propiedad desde repositorio")
		return nil, err
	}

	if unit == nil {
		uc.logger.Warn(ctx).Uint("unit_id", id).Msg("Unidad de propiedad no encontrada")
		return nil, domain.ErrPropertyUnitNotFound
	}

	return &domain.PropertyUnitDetailDTO{
		ID:                       unit.ID,
		BusinessID:               unit.BusinessID,
		Number:                   unit.Number,
		Floor:                    unit.Floor,
		Block:                    unit.Block,
		UnitType:                 unit.UnitType,
		Area:                     unit.Area,
		Bedrooms:                 unit.Bedrooms,
		Bathrooms:                unit.Bathrooms,
		ParticipationCoefficient: unit.ParticipationCoefficient,
		Description:              unit.Description,
		IsActive:                 unit.IsActive,
		CreatedAt:                unit.CreatedAt,
		UpdatedAt:                unit.UpdatedAt,
	}, nil
}
