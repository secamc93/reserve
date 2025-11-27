package repository

import (
	"context"
	"fmt"

	"central_reserve/services/horizontalproperty/vote/internal/domain"
	"dbpostgres/app/infra/models"
)

// ListPropertyUnits obtiene unidades de propiedad con filtros
func (r *Repository) ListPropertyUnits(ctx context.Context, filters domain.PropertyUnitFiltersDTO) (*domain.PaginatedPropertyUnitsDTO, error) {
	query := r.db.Conn(ctx).Model(&models.PropertyUnit{})

	// Aplicar filtros
	if filters.BusinessID > 0 {
		query = query.Where("business_id = ?", filters.BusinessID)
	}

	if filters.Number != "" {
		query = query.Where("LOWER(number) LIKE LOWER(?)", "%"+filters.Number+"%")
	}

	if filters.UnitType != "" {
		query = query.Where("unit_type = ?", filters.UnitType)
	}

	if filters.Floor != nil {
		query = query.Where("floor = ?", *filters.Floor)
	}

	if filters.Block != "" {
		query = query.Where("block = ?", filters.Block)
	}

	if filters.IsActive != nil {
		query = query.Where("is_active = ?", *filters.IsActive)
	}

	// Contar total
	var total int64
	if err := query.Count(&total).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error contando unidades de propiedad")
		return nil, fmt.Errorf("error contando unidades: %w", err)
	}

	// Aplicar paginación
	offset := (filters.Page - 1) * filters.PageSize
	query = query.Offset(offset).Limit(filters.PageSize)

	// Ordenar por número
	query = query.Order("number ASC")

	// Obtener unidades
	var units []models.PropertyUnit
	if err := query.Find(&units).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error obteniendo unidades de propiedad")
		return nil, fmt.Errorf("error obteniendo unidades: %w", err)
	}

	// Mapear a DTOs
	unitDTOs := make([]domain.PropertyUnitListDTO, len(units))
	for i, unit := range units {
		unitDTOs[i] = domain.PropertyUnitListDTO{
			ID:                       unit.ID,
			Number:                   unit.Number,
			Floor:                    unit.Floor,
			Block:                    unit.Block,
			UnitType:                 unit.UnitType,
			Area:                     unit.Area,
			Bedrooms:                 unit.Bedrooms,
			Bathrooms:                unit.Bathrooms,
			ParticipationCoefficient: unit.ParticipationCoefficient,
			IsActive:                 unit.IsActive,
		}
	}

	// Calcular total de páginas
	totalPages := int(total) / filters.PageSize
	if int(total)%filters.PageSize > 0 {
		totalPages++
	}

	return &domain.PaginatedPropertyUnitsDTO{
		Units:      unitDTOs,
		Total:      total,
		Page:       filters.Page,
		PageSize:   filters.PageSize,
		TotalPages: totalPages,
	}, nil
}
