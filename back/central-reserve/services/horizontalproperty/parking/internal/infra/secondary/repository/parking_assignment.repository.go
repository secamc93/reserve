package repository

import (
	"context"
	"fmt"
	"math"

	"central_reserve/services/horizontalproperty/parking/internal/domain"
	"central_reserve/services/horizontalproperty/parking/internal/infra/secondary/repository/mappers"
	"central_reserve/shared/db"
	"central_reserve/shared/log"
	"dbpostgres/app/infra/models"

	"gorm.io/gorm"
)

type ParkingAssignmentRepository struct {
	db     db.IDatabase
	logger log.ILogger
}

func NewParkingAssignmentRepository(db db.IDatabase, logger log.ILogger) domain.ParkingAssignmentRepository {
	return &ParkingAssignmentRepository{
		db:     db,
		logger: logger,
	}
}

// CreateParkingAssignment crea una nueva asignación de parqueadero
func (r *ParkingAssignmentRepository) CreateParkingAssignment(ctx context.Context, assignment *domain.ParkingAssignment) (*domain.ParkingAssignment, error) {
	model := &models.ParkingAssignment{
		BusinessID:       assignment.BusinessID,
		ParkingSlotID:    assignment.ParkingSlotID,
		PropertyUnitID:   assignment.PropertyUnitID,
		ResidentID:       assignment.ResidentID,
		VehiclePlate:     assignment.VehiclePlate,
		VehicleBrand:     assignment.VehicleBrand,
		VehicleModel:     assignment.VehicleModel,
		VehicleColor:     assignment.VehicleColor,
		StartDate:        assignment.StartDate,
		EndDate:          assignment.EndDate,
		IsActive:         assignment.IsActive,
		Notes:            assignment.Notes,
		AssignedByUserID: assignment.AssignedByUserID,
	}

	if err := r.db.Conn(ctx).Create(model).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error creando asignación de parqueadero")
		return nil, fmt.Errorf("error creando asignación de parqueadero: %w", err)
	}

	return mappers.ParkingAssignmentToDomain(model), nil
}

// GetParkingAssignmentByID obtiene una asignación por ID
func (r *ParkingAssignmentRepository) GetParkingAssignmentByID(ctx context.Context, id uint) (*domain.ParkingAssignment, error) {
	var assignment models.ParkingAssignment
	if err := r.db.Conn(ctx).
		Preload("ParkingSlot").
		Preload("PropertyUnit").
		Preload("Resident").
		First(&assignment, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, fmt.Errorf("error obteniendo asignación: %w", err)
	}

	return mappers.ParkingAssignmentToDomain(&assignment), nil
}

// UpdateParkingAssignment actualiza una asignación
func (r *ParkingAssignmentRepository) UpdateParkingAssignment(ctx context.Context, assignment *domain.ParkingAssignment) error {
	updates := map[string]interface{}{
		"property_unit_id": assignment.PropertyUnitID,
		"resident_id":      assignment.ResidentID,
		"vehicle_plate":    assignment.VehiclePlate,
		"vehicle_brand":    assignment.VehicleBrand,
		"vehicle_model":    assignment.VehicleModel,
		"vehicle_color":    assignment.VehicleColor,
		"start_date":       assignment.StartDate,
		"end_date":         assignment.EndDate,
		"is_active":        assignment.IsActive,
		"notes":            assignment.Notes,
	}

	if err := r.db.Conn(ctx).Model(&models.ParkingAssignment{}).Where("id = ?", assignment.ID).Updates(updates).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error actualizando asignación")
		return fmt.Errorf("error actualizando asignación: %w", err)
	}

	return nil
}

// DeleteParkingAssignment elimina una asignación
func (r *ParkingAssignmentRepository) DeleteParkingAssignment(ctx context.Context, id uint) error {
	if err := r.db.Conn(ctx).Delete(&models.ParkingAssignment{}, id).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error eliminando asignación")
		return fmt.Errorf("error eliminando asignación: %w", err)
	}

	return nil
}

// ListParkingAssignments lista las asignaciones según los filtros
func (r *ParkingAssignmentRepository) ListParkingAssignments(ctx context.Context, filters domain.ParkingAssignmentFiltersDTO) (*domain.PaginatedParkingAssignmentsDTO, error) {
	var total int64

	query := r.db.Conn(ctx).Table("horizontal_property.parking_assignments pa").
		Select("pa.*, ps.slot_number as parking_slot_number, pu.number as property_unit_number, r.name as resident_name").
		Joins("LEFT JOIN horizontal_property.parking_slots ps ON ps.id = pa.parking_slot_id").
		Joins("LEFT JOIN horizontal_property.property_units pu ON pu.id = pa.property_unit_id").
		Joins("LEFT JOIN horizontal_property.residents r ON r.id = pa.resident_id").
		Where("pa.business_id = ?", filters.BusinessID)

	if filters.ParkingSlotID != nil {
		query = query.Where("pa.parking_slot_id = ?", *filters.ParkingSlotID)
	}
	if filters.PropertyUnitID != nil {
		query = query.Where("pa.property_unit_id = ?", *filters.PropertyUnitID)
	}
	if filters.ResidentID != nil {
		query = query.Where("pa.resident_id = ?", *filters.ResidentID)
	}
	if filters.IsActive != nil {
		query = query.Where("pa.is_active = ?", *filters.IsActive)
	}

	// Contar total
	if err := query.Count(&total).Error; err != nil {
		return nil, fmt.Errorf("error contando asignaciones: %w", err)
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
		models.ParkingAssignment
		ParkingSlotNumber  string
		PropertyUnitNumber string
		ResidentName       string
	}

	var rows []row
	if err := query.Offset(offset).Limit(pageSize).Find(&rows).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error listando asignaciones")
		return nil, fmt.Errorf("error listando asignaciones: %w", err)
	}

	assignmentDTOs := make([]domain.ParkingAssignmentListDTO, len(rows))
	for i, row := range rows {
		assignmentDTOs[i] = domain.ParkingAssignmentListDTO{
			ID:                 row.ID,
			ParkingSlotID:      row.ParkingSlotID,
			ParkingSlotNumber:  row.ParkingSlotNumber,
			PropertyUnitID:     row.PropertyUnitID,
			PropertyUnitNumber: row.PropertyUnitNumber,
			ResidentID:         row.ResidentID,
			ResidentName:       row.ResidentName,
			VehiclePlate:       row.VehiclePlate,
			VehicleBrand:       row.VehicleBrand,
			VehicleModel:       row.VehicleModel,
			StartDate:          row.StartDate,
			EndDate:            row.EndDate,
			IsActive:           row.IsActive,
		}
	}

	totalPages := int(math.Ceil(float64(total) / float64(pageSize)))

	return &domain.PaginatedParkingAssignmentsDTO{
		ParkingAssignments: assignmentDTOs,
		Total:              total,
		Page:               page,
		PageSize:           pageSize,
		TotalPages:         totalPages,
	}, nil
}

// GetActiveAssignmentBySlotID obtiene la asignación activa de un espacio
func (r *ParkingAssignmentRepository) GetActiveAssignmentBySlotID(ctx context.Context, slotID uint) (*domain.ParkingAssignment, error) {
	var assignment models.ParkingAssignment
	if err := r.db.Conn(ctx).
		Where("parking_slot_id = ? AND is_active = ?", slotID, true).
		First(&assignment).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, fmt.Errorf("error obteniendo asignación activa: %w", err)
	}

	return mappers.ParkingAssignmentToDomain(&assignment), nil
}

// GetAssignmentsByPropertyUnitID obtiene las asignaciones de una unidad
func (r *ParkingAssignmentRepository) GetAssignmentsByPropertyUnitID(ctx context.Context, propertyUnitID uint) ([]*domain.ParkingAssignment, error) {
	var assignments []models.ParkingAssignment
	if err := r.db.Conn(ctx).
		Where("property_unit_id = ? AND is_active = ?", propertyUnitID, true).
		Find(&assignments).Error; err != nil {
		return nil, fmt.Errorf("error obteniendo asignaciones: %w", err)
	}

	result := make([]*domain.ParkingAssignment, len(assignments))
	for i, assignment := range assignments {
		result[i] = mappers.ParkingAssignmentToDomain(&assignment)
	}

	return result, nil
}

// GetAssignmentsByResidentID obtiene las asignaciones de un residente
func (r *ParkingAssignmentRepository) GetAssignmentsByResidentID(ctx context.Context, residentID uint) ([]*domain.ParkingAssignment, error) {
	var assignments []models.ParkingAssignment
	if err := r.db.Conn(ctx).
		Where("resident_id = ? AND is_active = ?", residentID, true).
		Find(&assignments).Error; err != nil {
		return nil, fmt.Errorf("error obteniendo asignaciones: %w", err)
	}

	result := make([]*domain.ParkingAssignment, len(assignments))
	for i, assignment := range assignments {
		result[i] = mappers.ParkingAssignmentToDomain(&assignment)
	}

	return result, nil
}

