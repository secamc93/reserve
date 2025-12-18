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

type ParkingSlotRepository struct {
	db     db.IDatabase
	logger log.ILogger
}

func NewParkingSlotRepository(db db.IDatabase, logger log.ILogger) domain.ParkingSlotRepository {
	return &ParkingSlotRepository{
		db:     db,
		logger: logger,
	}
}

// CreateParkingSlot crea un nuevo espacio de parqueo
func (r *ParkingSlotRepository) CreateParkingSlot(ctx context.Context, slot *domain.ParkingSlot) (*domain.ParkingSlot, error) {
	model := &models.ParkingSlot{
		ParkingZoneID: slot.ParkingZoneID,
		ParkingTypeID: slot.ParkingTypeID,
		SlotNumber:    slot.SlotNumber,
		IsCovered:     slot.IsCovered,
		Width:         slot.Width,
		Length:        slot.Length,
		Height:        slot.Height,
		HasCharger:    slot.HasCharger,
		IsActive:      slot.IsActive,
	}

	if err := r.db.Conn(ctx).Create(model).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error creando espacio de parqueo")
		return nil, fmt.Errorf("error creando espacio de parqueo: %w", err)
	}

	return mapParkingSlotToDomain(model), nil
}

// GetParkingSlotByID obtiene un espacio de parqueo por ID
func (r *ParkingSlotRepository) GetParkingSlotByID(ctx context.Context, id uint) (*domain.ParkingSlot, error) {
	var slot models.ParkingSlot
	if err := r.db.Conn(ctx).
		Preload("ParkingZone").
		Preload("ParkingType").
		First(&slot, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, fmt.Errorf("error obteniendo espacio de parqueo: %w", err)
	}

	return mapParkingSlotToDomain(&slot), nil
}

// UpdateParkingSlot actualiza un espacio de parqueo
func (r *ParkingSlotRepository) UpdateParkingSlot(ctx context.Context, slot *domain.ParkingSlot) error {
	updates := map[string]interface{}{
		"parking_zone_id": slot.ParkingZoneID,
		"parking_type_id": slot.ParkingTypeID,
		"slot_number":     slot.SlotNumber,
		"is_covered":      slot.IsCovered,
		"has_charger":     slot.HasCharger,
		"is_active":       slot.IsActive,
	}

	if slot.Width != nil {
		updates["width"] = slot.Width
	}
	if slot.Length != nil {
		updates["length"] = slot.Length
	}
	if slot.Height != nil {
		updates["height"] = slot.Height
	}

	if err := r.db.Conn(ctx).Model(&models.ParkingSlot{}).Where("id = ?", slot.ID).Updates(updates).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error actualizando espacio de parqueo")
		return fmt.Errorf("error actualizando espacio de parqueo: %w", err)
	}

	return nil
}

// DeleteParkingSlot elimina un espacio de parqueo
func (r *ParkingSlotRepository) DeleteParkingSlot(ctx context.Context, id uint) error {
	if err := r.db.Conn(ctx).Delete(&models.ParkingSlot{}, id).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error eliminando espacio de parqueo")
		return fmt.Errorf("error eliminando espacio de parqueo: %w", err)
	}

	return nil
}

// ListParkingSlots lista los espacios de parqueo según los filtros
func (r *ParkingSlotRepository) ListParkingSlots(ctx context.Context, filters domain.ParkingSlotFiltersDTO) (*domain.PaginatedParkingSlotsDTO, error) {
	var total int64

	query := r.db.Conn(ctx).Table("horizontal_property.parking_slots ps").
		Select("ps.*, pz.name as parking_zone_name, pt.name as parking_type_name").
		Joins("JOIN horizontal_property.parking_zones pz ON pz.id = ps.parking_zone_id").
		Joins("JOIN horizontal_property.parking_types pt ON pt.id = ps.parking_type_id").
		Where("pz.business_id = ?", filters.BusinessID)

	if filters.ParkingZoneID != nil {
		query = query.Where("ps.parking_zone_id = ?", *filters.ParkingZoneID)
	}
	if filters.ParkingTypeID != nil {
		query = query.Where("ps.parking_type_id = ?", *filters.ParkingTypeID)
	}
	if filters.IsActive != nil {
		query = query.Where("ps.is_active = ?", *filters.IsActive)
	}

	// Contar total
	if err := query.Count(&total).Error; err != nil {
		return nil, fmt.Errorf("error contando espacios de parqueo: %w", err)
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

	type row struct {
		models.ParkingSlot
		ParkingZoneName string
		ParkingTypeName string
	}

	var rows []row
	if err := query.Offset(offset).Limit(pageSize).Find(&rows).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error listando espacios de parqueo")
		return nil, fmt.Errorf("error listando espacios de parqueo: %w", err)
	}

	// Verificar disponibilidad para cada slot
	slotDTOs := make([]domain.ParkingSlotListDTO, len(rows))
	for i, row := range rows {
		// Verificar si está asignado
		var activeAssignment models.ParkingAssignment
		isAssigned := r.db.Conn(ctx).
			Where("parking_slot_id = ? AND is_active = ?", row.ID, true).
			First(&activeAssignment).Error == nil

		// Verificar si está ocupado
		var activeOccupancy models.ParkingOccupancy
		isOccupied := r.db.Conn(ctx).
			Where("parking_slot_id = ? AND is_active = ?", row.ID, true).
			First(&activeOccupancy).Error == nil

		isAvailable := row.IsActive && !isAssigned && !isOccupied

		slotDTOs[i] = domain.ParkingSlotListDTO{
			ID:              row.ID,
			ParkingZoneID:   row.ParkingZoneID,
			ParkingZoneName: row.ParkingZoneName,
			ParkingTypeID:   row.ParkingTypeID,
			ParkingTypeName: row.ParkingTypeName,
			SlotNumber:      row.SlotNumber,
			IsCovered:       row.IsCovered,
			HasCharger:      row.HasCharger,
			IsActive:        row.IsActive,
			IsAvailable:     isAvailable,
			IsAssigned:      isAssigned,
			IsOccupied:      isOccupied,
		}
	}

	totalPages := int(math.Ceil(float64(total) / float64(pageSize)))

	return &domain.PaginatedParkingSlotsDTO{
		ParkingSlots: slotDTOs,
		Total:        total,
		Page:         page,
		PageSize:     pageSize,
		TotalPages:   totalPages,
	}, nil
}

// GetParkingSlotsByZoneID obtiene todos los espacios de una zona
func (r *ParkingSlotRepository) GetParkingSlotsByZoneID(ctx context.Context, zoneID uint) ([]*domain.ParkingSlot, error) {
	var slots []models.ParkingSlot
	if err := r.db.Conn(ctx).Where("parking_zone_id = ?", zoneID).Find(&slots).Error; err != nil {
		return nil, fmt.Errorf("error obteniendo espacios de parqueo: %w", err)
	}

	result := make([]*domain.ParkingSlot, len(slots))
	for i, slot := range slots {
		result[i] = mapParkingSlotToDomain(&slot)
	}

	return result, nil
}

// GetParkingSlotsByBusinessID obtiene todos los espacios de un negocio
func (r *ParkingSlotRepository) GetParkingSlotsByBusinessID(ctx context.Context, businessID uint) ([]*domain.ParkingSlot, error) {
	var slots []models.ParkingSlot
	if err := r.db.Conn(ctx).
		Joins("JOIN horizontal_property.parking_zones pz ON pz.id = parking_slots.parking_zone_id").
		Where("pz.business_id = ?", businessID).
		Find(&slots).Error; err != nil {
		return nil, fmt.Errorf("error obteniendo espacios de parqueo: %w", err)
	}

	result := make([]*domain.ParkingSlot, len(slots))
	for i, slot := range slots {
		result[i] = mapParkingSlotToDomain(&slot)
	}

	return result, nil
}

// IsSlotAvailable verifica si un espacio está disponible en un horario específico
func (r *ParkingSlotRepository) IsSlotAvailable(ctx context.Context, slotID uint, date string, startTime, endTime string, excludeReservationID *uint) (bool, error) {
	// Verificar asignaciones activas
	var assignment models.ParkingAssignment
	if err := r.db.Conn(ctx).
		Where("parking_slot_id = ? AND is_active = ?", slotID, true).
		First(&assignment).Error; err == nil {
		return false, nil // No disponible si hay asignación activa
	}

	// Verificar reservas que se solapen
	var count int64
	query := r.db.Conn(ctx).Model(&models.ParkingReservation{}).
		Where("parking_slot_id = ?", slotID).
		Where("reservation_date = ?", date).
		Where("cancelled_at IS NULL").
		Where("(start_time < ? AND end_time > ?)", endTime, startTime)

	if excludeReservationID != nil {
		query = query.Where("id != ?", *excludeReservationID)
	}

	if err := query.Count(&count).Error; err != nil {
		return false, fmt.Errorf("error verificando disponibilidad: %w", err)
	}

	return count == 0, nil
}

// mapParkingSlotToDomain mapea el modelo a la entidad de dominio
func mapParkingSlotToDomain(model *models.ParkingSlot) *domain.ParkingSlot {
	return &domain.ParkingSlot{
		ID:            model.ID,
		ParkingZoneID: model.ParkingZoneID,
		ParkingTypeID: model.ParkingTypeID,
		SlotNumber:    model.SlotNumber,
		IsCovered:     model.IsCovered,
		Width:         model.Width,
		Length:        model.Length,
		Height:        model.Height,
		HasCharger:    model.HasCharger,
		IsActive:      model.IsActive,
		CreatedAt:     model.CreatedAt,
		UpdatedAt:     model.UpdatedAt,
	}
}
