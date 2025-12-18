package repository

import (
	"context"
	"fmt"

	"central_reserve/services/horizontalproperty/parking/internal/domain"
	"central_reserve/shared/db"
	"central_reserve/shared/log"
	"dbpostgres/app/infra/models"

	"gorm.io/gorm"
)

type ParkingOccupancyRepository struct {
	db     db.IDatabase
	logger log.ILogger
}

func NewParkingOccupancyRepository(db db.IDatabase, logger log.ILogger) domain.ParkingOccupancyRepository {
	return &ParkingOccupancyRepository{
		db:     db,
		logger: logger,
	}
}

// CreateParkingOccupancy crea un nuevo registro de ocupación
func (r *ParkingOccupancyRepository) CreateParkingOccupancy(ctx context.Context, occupancy *domain.ParkingOccupancy) (*domain.ParkingOccupancy, error) {
	model := &models.ParkingOccupancy{
		ParkingSlotID:        occupancy.ParkingSlotID,
		ParkingReservationID: occupancy.ParkingReservationID,
		VehiclePlate:         occupancy.VehiclePlate,
		EntryTime:            occupancy.EntryTime,
		ExitTime:             occupancy.ExitTime,
		IsActive:             occupancy.IsActive,
		EntryMethod:          occupancy.EntryMethod,
		EntryGate:            occupancy.EntryGate,
		ExitGate:             occupancy.ExitGate,
		RegisteredByUserID:   occupancy.RegisteredByUserID,
		Notes:                occupancy.Notes,
	}

	if err := r.db.Conn(ctx).Create(model).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error creando registro de ocupación")
		return nil, fmt.Errorf("error creando registro de ocupación: %w", err)
	}

	return mapParkingOccupancyToDomain(model), nil
}

// GetParkingOccupancyByID obtiene un registro de ocupación por ID
func (r *ParkingOccupancyRepository) GetParkingOccupancyByID(ctx context.Context, id uint) (*domain.ParkingOccupancy, error) {
	var occupancy models.ParkingOccupancy
	if err := r.db.Conn(ctx).
		Preload("ParkingSlot").
		Preload("ParkingReservation").
		First(&occupancy, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, fmt.Errorf("error obteniendo registro de ocupación: %w", err)
	}

	return mapParkingOccupancyToDomain(&occupancy), nil
}

// UpdateParkingOccupancy actualiza un registro de ocupación
func (r *ParkingOccupancyRepository) UpdateParkingOccupancy(ctx context.Context, occupancy *domain.ParkingOccupancy) error {
	updates := map[string]interface{}{
		"vehicle_plate": occupancy.VehiclePlate,
		"exit_time":     occupancy.ExitTime,
		"is_active":     occupancy.IsActive,
		"entry_method":  occupancy.EntryMethod,
		"entry_gate":    occupancy.EntryGate,
		"exit_gate":     occupancy.ExitGate,
		"notes":         occupancy.Notes,
	}

	if err := r.db.Conn(ctx).Model(&models.ParkingOccupancy{}).Where("id = ?", occupancy.ID).Updates(updates).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error actualizando registro de ocupación")
		return fmt.Errorf("error actualizando registro de ocupación: %w", err)
	}

	return nil
}

// GetActiveOccupancyBySlotID obtiene la ocupación activa de un espacio
func (r *ParkingOccupancyRepository) GetActiveOccupancyBySlotID(ctx context.Context, slotID uint) (*domain.ParkingOccupancy, error) {
	var occupancy models.ParkingOccupancy
	if err := r.db.Conn(ctx).
		Where("parking_slot_id = ? AND is_active = ?", slotID, true).
		First(&occupancy).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, fmt.Errorf("error obteniendo ocupación activa: %w", err)
	}

	return mapParkingOccupancyToDomain(&occupancy), nil
}

// GetOccupanciesBySlotID obtiene los registros de ocupación de un espacio en un rango de fechas
func (r *ParkingOccupancyRepository) GetOccupanciesBySlotID(ctx context.Context, slotID uint, startDate, endDate string) ([]*domain.ParkingOccupancy, error) {
	var occupancies []models.ParkingOccupancy
	if err := r.db.Conn(ctx).
		Where("parking_slot_id = ?", slotID).
		Where("entry_time >= ? AND entry_time <= ?", startDate, endDate).
		Order("entry_time DESC").
		Find(&occupancies).Error; err != nil {
		return nil, fmt.Errorf("error obteniendo registros de ocupación: %w", err)
	}

	result := make([]*domain.ParkingOccupancy, len(occupancies))
	for i, occupancy := range occupancies {
		result[i] = mapParkingOccupancyToDomain(&occupancy)
	}

	return result, nil
}

// mapParkingOccupancyToDomain mapea el modelo a la entidad de dominio
func mapParkingOccupancyToDomain(model *models.ParkingOccupancy) *domain.ParkingOccupancy {
	return &domain.ParkingOccupancy{
		ID:                   model.ID,
		ParkingSlotID:        model.ParkingSlotID,
		ParkingReservationID: model.ParkingReservationID,
		VehiclePlate:         model.VehiclePlate,
		EntryTime:            model.EntryTime,
		ExitTime:             model.ExitTime,
		IsActive:             model.IsActive,
		EntryMethod:          model.EntryMethod,
		EntryGate:            model.EntryGate,
		ExitGate:             model.ExitGate,
		RegisteredByUserID:   model.RegisteredByUserID,
		Notes:                model.Notes,
		CreatedAt:            model.CreatedAt,
		UpdatedAt:            model.UpdatedAt,
	}
}
