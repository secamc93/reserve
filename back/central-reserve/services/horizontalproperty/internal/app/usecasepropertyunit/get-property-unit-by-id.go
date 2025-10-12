package usecasepropertyunit

import (
	"context"

	"central_reserve/services/horizontalproperty/internal/domain"
)

func (uc *propertyUnitUseCase) GetPropertyUnitByID(ctx context.Context, id uint) (*domain.PropertyUnitDetailDTO, error) {
	unit, err := uc.repo.GetPropertyUnitByID(ctx, id)
	if err != nil {
		uc.logger.Error().Err(err).Uint("id", id).Msg("Error obteniendo unidad de propiedad")
		return nil, err
	}

	if unit == nil {
		return nil, domain.ErrPropertyUnitNotFound
	}

	return &domain.PropertyUnitDetailDTO{
		ID:          unit.ID,
		BusinessID:  unit.BusinessID,
		Number:      unit.Number,
		Floor:       unit.Floor,
		Block:       unit.Block,
		UnitType:    unit.UnitType,
		Area:        unit.Area,
		Bedrooms:    unit.Bedrooms,
		Bathrooms:   unit.Bathrooms,
		Description: unit.Description,
		IsActive:    unit.IsActive,
		CreatedAt:   unit.CreatedAt,
		UpdatedAt:   unit.UpdatedAt,
	}, nil
}
