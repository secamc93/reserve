package repository

import (
	"context"
	"fmt"
	"math"

	"central_reserve/services/horizontalproperty/commonarea/internal/domain"
	"central_reserve/services/horizontalproperty/commonarea/internal/infra/secondary/repository/mappers"
	"central_reserve/shared/db"
	"central_reserve/shared/log"
	"dbpostgres/app/infra/models"

	"gorm.io/gorm"
)

type CommonAreaRepository struct {
	db     db.IDatabase
	logger log.ILogger
}

func NewCommonAreaRepository(db db.IDatabase, logger log.ILogger) domain.CommonAreaRepository {
	return &CommonAreaRepository{
		db:     db,
		logger: logger,
	}
}

// CreateCommonArea crea una nueva zona común
func (r *CommonAreaRepository) CreateCommonArea(ctx context.Context, area *domain.CommonArea) (*domain.CommonArea, error) {
	model := &models.CommonArea{
		BusinessID:           area.BusinessID,
		CommonAreaTypeID:     area.CommonAreaTypeID,
		Name:                 area.Name,
		Description:          area.Description,
		Location:             area.Location,
		MaxCapacity:          area.MaxCapacity,
		AreaSqm:              area.AreaSqm,
		HasEquipment:         area.HasEquipment,
		EquipmentDescription: area.EquipmentDescription,
		HourlyRate:           area.HourlyRate,
		RequiresApproval:     area.RequiresApproval,
		RequiresDeposit:      area.RequiresDeposit,
		DepositAmount:        area.DepositAmount,
		AllowsRecurring:      area.AllowsRecurring,
		IsActive:             area.IsActive,
		ImageURLs:            area.ImageURLs,
	}

	if err := r.db.Conn(ctx).Create(model).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error creando zona común")
		return nil, fmt.Errorf("error creando zona común: %w", err)
	}

	return mappers.CommonAreaToDomain(model), nil
}

// GetCommonAreaByID obtiene una zona común por ID
func (r *CommonAreaRepository) GetCommonAreaByID(ctx context.Context, id uint) (*domain.CommonArea, error) {
	var area models.CommonArea
	if err := r.db.Conn(ctx).
		Preload("CommonAreaType").
		First(&area, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, domain.ErrCommonAreaNotFound
		}
		return nil, fmt.Errorf("error obteniendo zona común: %w", err)
	}

	return mappers.CommonAreaToDomain(&area), nil
}

// UpdateCommonArea actualiza una zona común
func (r *CommonAreaRepository) UpdateCommonArea(ctx context.Context, area *domain.CommonArea) error {
	updates := map[string]interface{}{
		"common_area_type_id":   area.CommonAreaTypeID,
		"name":                  area.Name,
		"description":           area.Description,
		"location":              area.Location,
		"max_capacity":          area.MaxCapacity,
		"has_equipment":         area.HasEquipment,
		"equipment_description": area.EquipmentDescription,
		"requires_approval":     area.RequiresApproval,
		"requires_deposit":      area.RequiresDeposit,
		"allows_recurring":      area.AllowsRecurring,
		"is_active":             area.IsActive,
	}

	if area.AreaSqm != nil {
		updates["area_sqm"] = area.AreaSqm
	}
	if area.HourlyRate != nil {
		updates["hourly_rate"] = area.HourlyRate
	}
	if area.DepositAmount != nil {
		updates["deposit_amount"] = area.DepositAmount
	}
	if area.ImageURLs != "" {
		updates["image_urls"] = area.ImageURLs
	}

	if err := r.db.Conn(ctx).Model(&models.CommonArea{}).Where("id = ?", area.ID).Updates(updates).Error; err != nil {
		return fmt.Errorf("error actualizando zona común: %w", err)
	}

	return nil
}

// DeleteCommonArea elimina una zona común (soft delete)
func (r *CommonAreaRepository) DeleteCommonArea(ctx context.Context, id uint) error {
	if err := r.db.Conn(ctx).Delete(&models.CommonArea{}, id).Error; err != nil {
		return fmt.Errorf("error eliminando zona común: %w", err)
	}
	return nil
}

// ListCommonAreas lista zonas comunes con filtros y paginación
func (r *CommonAreaRepository) ListCommonAreas(ctx context.Context, filters domain.CommonAreaFiltersDTO) (*domain.PaginatedCommonAreasDTO, error) {
	// Conteo total
	var total int64
	countQuery := r.db.Conn(ctx).Model(&models.CommonArea{}).Where("business_id = ?", filters.BusinessID)

	if filters.CommonAreaTypeID != nil {
		countQuery = countQuery.Where("common_area_type_id = ?", *filters.CommonAreaTypeID)
	}
	if filters.IsActive != nil {
		countQuery = countQuery.Where("is_active = ?", *filters.IsActive)
	}

	if err := countQuery.Count(&total).Error; err != nil {
		return nil, fmt.Errorf("error contando zonas comunes: %w", err)
	}

	// Consulta paginada usando modelos GORM
	var commonAreasModels []models.CommonArea
	query := r.db.Conn(ctx).
		Model(&models.CommonArea{}).
		Preload("CommonAreaType").
		Where("business_id = ?", filters.BusinessID)

	if filters.CommonAreaTypeID != nil {
		query = query.Where("common_area_type_id = ?", *filters.CommonAreaTypeID)
	}
	if filters.IsActive != nil {
		query = query.Where("is_active = ?", *filters.IsActive)
	}

	offset := (filters.Page - 1) * filters.PageSize
	if err := query.Order("name ASC").
		Limit(filters.PageSize).
		Offset(offset).
		Find(&commonAreasModels).Error; err != nil {
		return nil, fmt.Errorf("error listando zonas comunes: %w", err)
	}

	commonAreas := make([]domain.CommonAreaListDTO, len(commonAreasModels))
	for i, ca := range commonAreasModels {
		typeName := ""
		if ca.CommonAreaType.ID != 0 {
			typeName = ca.CommonAreaType.Name
		}

		commonAreas[i] = domain.CommonAreaListDTO{
			ID:               ca.ID,
			Name:             ca.Name,
			TypeName:         typeName,
			Location:         ca.Location,
			MaxCapacity:      ca.MaxCapacity,
			IsActive:         ca.IsActive,
			RequiresApproval: ca.RequiresApproval,
		}
	}

	return &domain.PaginatedCommonAreasDTO{
		CommonAreas: commonAreas,
		Total:       total,
		Page:        filters.Page,
		PageSize:    filters.PageSize,
		TotalPages:  int(math.Ceil(float64(total) / float64(filters.PageSize))),
	}, nil
}

// GetCommonAreasByBusinessID obtiene todas las zonas comunes activas de un negocio
func (r *CommonAreaRepository) GetCommonAreasByBusinessID(ctx context.Context, businessID uint) ([]*domain.CommonArea, error) {
	var areas []models.CommonArea
	if err := r.db.Conn(ctx).
		Preload("CommonAreaType").
		Where("business_id = ? AND is_active = ?", businessID, true).
		Find(&areas).Error; err != nil {
		return nil, fmt.Errorf("error obteniendo zonas comunes: %w", err)
	}

	result := make([]*domain.CommonArea, len(areas))
	for i, a := range areas {
		result[i] = mappers.CommonAreaToDomain(&a)
	}

	return result, nil
}

// GetCommonAreaTypes obtiene todos los tipos de zonas comunes activos
func (r *CommonAreaRepository) GetCommonAreaTypes(ctx context.Context) ([]*domain.CommonAreaType, error) {
	var types []models.CommonAreaType
	if err := r.db.Conn(ctx).
		Where("is_active = ?", true).
		Order("name ASC").
		Find(&types).Error; err != nil {
		return nil, fmt.Errorf("error obteniendo tipos de zonas comunes: %w", err)
	}

	result := make([]*domain.CommonAreaType, len(types))
	for i, t := range types {
		result[i] = mappers.CommonAreaTypeToDomain(&t)
	}

	return result, nil
}
