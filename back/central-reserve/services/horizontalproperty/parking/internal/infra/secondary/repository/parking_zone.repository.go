package repository

import (
	"context"
	"fmt"
	"math"

	"central_reserve/services/horizontalproperty/parking/internal/domain"
	"central_reserve/shared/db"
	"central_reserve/shared/log"
	"dbpostgres/app/infra/models"

	"gorm.io/gorm"
)

type ParkingZoneRepository struct {
	db     db.IDatabase
	logger log.ILogger
}

func NewParkingZoneRepository(db db.IDatabase, logger log.ILogger) domain.ParkingZoneRepository {
	return &ParkingZoneRepository{
		db:     db,
		logger: logger,
	}
}

// CreateParkingZone crea una nueva zona de parqueo
func (r *ParkingZoneRepository) CreateParkingZone(ctx context.Context, zone *domain.ParkingZone) (*domain.ParkingZone, error) {
	model := &models.ParkingZone{
		BusinessID:  zone.BusinessID,
		Name:        zone.Name,
		Code:        zone.Code,
		Description: zone.Description,
		Location:    zone.Location,
		TotalSlots:  zone.TotalSlots,
		IsActive:    zone.IsActive,
	}

	if err := r.db.Conn(ctx).Create(model).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error creando zona de parqueo")
		return nil, fmt.Errorf("error creando zona de parqueo: %w", err)
	}

	return mapParkingZoneToDomain(model), nil
}

// GetParkingZoneByID obtiene una zona de parqueo por ID
func (r *ParkingZoneRepository) GetParkingZoneByID(ctx context.Context, id uint) (*domain.ParkingZone, error) {
	var zone models.ParkingZone
	if err := r.db.Conn(ctx).First(&zone, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, fmt.Errorf("error obteniendo zona de parqueo: %w", err)
	}

	return mapParkingZoneToDomain(&zone), nil
}

// UpdateParkingZone actualiza una zona de parqueo
func (r *ParkingZoneRepository) UpdateParkingZone(ctx context.Context, zone *domain.ParkingZone) error {
	updates := map[string]interface{}{
		"name":        zone.Name,
		"code":        zone.Code,
		"description": zone.Description,
		"location":    zone.Location,
		"total_slots": zone.TotalSlots,
		"is_active":   zone.IsActive,
	}

	if err := r.db.Conn(ctx).Model(&models.ParkingZone{}).Where("id = ?", zone.ID).Updates(updates).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error actualizando zona de parqueo")
		return fmt.Errorf("error actualizando zona de parqueo: %w", err)
	}

	return nil
}

// DeleteParkingZone elimina una zona de parqueo
func (r *ParkingZoneRepository) DeleteParkingZone(ctx context.Context, id uint) error {
	if err := r.db.Conn(ctx).Delete(&models.ParkingZone{}, id).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error eliminando zona de parqueo")
		return fmt.Errorf("error eliminando zona de parqueo: %w", err)
	}

	return nil
}

// ListParkingZones lista las zonas de parqueo según los filtros
func (r *ParkingZoneRepository) ListParkingZones(ctx context.Context, filters domain.ParkingZoneFiltersDTO) (*domain.PaginatedParkingZonesDTO, error) {
	var zones []models.ParkingZone
	var total int64

	query := r.db.Conn(ctx).Model(&models.ParkingZone{})

	// Aplicar filtros
	query = query.Where("business_id = ?", filters.BusinessID)

	if filters.IsActive != nil {
		query = query.Where("is_active = ?", *filters.IsActive)
	}

	// Contar total
	if err := query.Count(&total).Error; err != nil {
		return nil, fmt.Errorf("error contando zonas de parqueo: %w", err)
	}

	// Aplicar paginación
	page := filters.Page
	if page < 1 {
		page = 1
	}
	pageSize := filters.PageSize
	if pageSize < 1 {
		pageSize = 10
	}
	offset := (page - 1) * pageSize

	if err := query.Offset(offset).Limit(pageSize).Find(&zones).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error listando zonas de parqueo")
		return nil, fmt.Errorf("error listando zonas de parqueo: %w", err)
	}

	// Mapear a DTOs
	zoneDTOs := make([]domain.ParkingZoneListDTO, len(zones))
	for i, zone := range zones {
		zoneDTOs[i] = domain.ParkingZoneListDTO{
			ID:         zone.ID,
			Name:       zone.Name,
			Code:       zone.Code,
			Location:   zone.Location,
			TotalSlots: zone.TotalSlots,
			IsActive:   zone.IsActive,
		}
	}

	totalPages := int(math.Ceil(float64(total) / float64(pageSize)))

	return &domain.PaginatedParkingZonesDTO{
		ParkingZones: zoneDTOs,
		Total:        total,
		Page:         page,
		PageSize:     pageSize,
		TotalPages:   totalPages,
	}, nil
}

// GetParkingZonesByBusinessID obtiene todas las zonas de parqueo de un negocio
func (r *ParkingZoneRepository) GetParkingZonesByBusinessID(ctx context.Context, businessID uint) ([]*domain.ParkingZone, error) {
	var zones []models.ParkingZone
	if err := r.db.Conn(ctx).Where("business_id = ?", businessID).Find(&zones).Error; err != nil {
		return nil, fmt.Errorf("error obteniendo zonas de parqueo: %w", err)
	}

	result := make([]*domain.ParkingZone, len(zones))
	for i, zone := range zones {
		result[i] = mapParkingZoneToDomain(&zone)
	}

	return result, nil
}

// mapParkingZoneToDomain mapea el modelo a la entidad de dominio
func mapParkingZoneToDomain(model *models.ParkingZone) *domain.ParkingZone {
	return &domain.ParkingZone{
		ID:          model.ID,
		BusinessID:  model.BusinessID,
		Name:        model.Name,
		Code:        model.Code,
		Description: model.Description,
		Location:    model.Location,
		TotalSlots:  model.TotalSlots,
		IsActive:    model.IsActive,
		CreatedAt:   model.CreatedAt,
		UpdatedAt:   model.UpdatedAt,
	}
}
