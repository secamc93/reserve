package repository

import (
	"central_reserve/services/horizontalproperty/internal/domain"
	"context"
	"dbpostgres/app/infra/models"
	"fmt"
	"math"

	"gorm.io/gorm"
)

func (r *Repository) CreatePropertyUnit(ctx context.Context, unit *domain.PropertyUnit) (*domain.PropertyUnit, error) {
	model := &models.PropertyUnit{
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
	}
	if err := r.db.Conn(ctx).Create(model).Error; err != nil {
		return nil, fmt.Errorf("error creando unidad: %w", err)
	}
	return mapPropertyUnitToDomain(model), nil
}

func (r *Repository) GetPropertyUnitByID(ctx context.Context, id uint) (*domain.PropertyUnit, error) {
	var m models.PropertyUnit
	if err := r.db.Conn(ctx).First(&m, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, domain.ErrPropertyUnitNotFound
		}
		return nil, fmt.Errorf("error obteniendo unidad: %w", err)
	}
	return mapPropertyUnitToDomain(&m), nil
}

func (r *Repository) ListPropertyUnits(ctx context.Context, filters domain.PropertyUnitFiltersDTO) (*domain.PaginatedPropertyUnitsDTO, error) {
	var ms []models.PropertyUnit
	var total int64
	query := r.db.Conn(ctx).Model(&models.PropertyUnit{}).Where("business_id = ?", filters.BusinessID)
	if filters.Number != "" {
		query = query.Where("number ILIKE ?", "%"+filters.Number+"%")
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
	if err := query.Count(&total).Error; err != nil {
		return nil, fmt.Errorf("error contando: %w", err)
	}
	offset := (filters.Page - 1) * filters.PageSize
	if err := query.Order("number ASC").Limit(filters.PageSize).Offset(offset).Find(&ms).Error; err != nil {
		return nil, fmt.Errorf("error listando: %w", err)
	}
	units := make([]domain.PropertyUnitListDTO, len(ms))
	for i, m := range ms {
		units[i] = domain.PropertyUnitListDTO{
			ID:                       m.ID,
			Number:                   m.Number,
			Floor:                    m.Floor,
			Block:                    m.Block,
			UnitType:                 m.UnitType,
			Area:                     m.Area,
			Bedrooms:                 m.Bedrooms,
			Bathrooms:                m.Bathrooms,
			ParticipationCoefficient: m.ParticipationCoefficient,
			IsActive:                 m.IsActive,
		}
	}
	return &domain.PaginatedPropertyUnitsDTO{
		Units:      units,
		Total:      total,
		Page:       filters.Page,
		PageSize:   filters.PageSize,
		TotalPages: int(math.Ceil(float64(total) / float64(filters.PageSize))),
	}, nil
}

func (r *Repository) UpdatePropertyUnit(ctx context.Context, id uint, unit *domain.PropertyUnit) (*domain.PropertyUnit, error) {
	model := &models.PropertyUnit{
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
	}
	if err := r.db.Conn(ctx).Model(&models.PropertyUnit{}).Where("id = ?", id).Updates(model).Error; err != nil {
		return nil, fmt.Errorf("error actualizando: %w", err)
	}
	var updated models.PropertyUnit
	if err := r.db.Conn(ctx).First(&updated, id).Error; err != nil {
		return nil, err
	}
	return mapPropertyUnitToDomain(&updated), nil
}

func (r *Repository) DeletePropertyUnit(ctx context.Context, id uint) error {
	if err := r.db.Conn(ctx).Delete(&models.PropertyUnit{}, id).Error; err != nil {
		return fmt.Errorf("error eliminando: %w", err)
	}
	return nil
}

func (r *Repository) ExistsPropertyUnitByNumber(ctx context.Context, businessID uint, number string, excludeID uint) (bool, error) {
	var count int64
	query := r.db.Conn(ctx).Model(&models.PropertyUnit{}).Where("business_id = ? AND number = ?", businessID, number)
	if excludeID > 0 {
		query = query.Where("id != ?", excludeID)
	}
	if err := query.Count(&count).Error; err != nil {
		return false, fmt.Errorf("error verificando: %w", err)
	}
	return count > 0, nil
}

func mapPropertyUnitToDomain(m *models.PropertyUnit) *domain.PropertyUnit {
	return &domain.PropertyUnit{
		ID:                       m.ID,
		BusinessID:               m.BusinessID,
		Number:                   m.Number,
		Floor:                    m.Floor,
		Block:                    m.Block,
		UnitType:                 m.UnitType,
		Area:                     m.Area,
		Bedrooms:                 m.Bedrooms,
		Bathrooms:                m.Bathrooms,
		ParticipationCoefficient: m.ParticipationCoefficient,
		Description:              m.Description,
		IsActive:                 m.IsActive,
		CreatedAt:                m.CreatedAt,
		UpdatedAt:                m.UpdatedAt,
	}
}
