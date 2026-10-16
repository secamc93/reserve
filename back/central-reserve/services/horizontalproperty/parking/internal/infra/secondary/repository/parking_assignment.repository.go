package repository

import (
	"context"
	"fmt"
	"math"
	"strings"
	"time"

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

	query := r.db.Conn(ctx).Model(&models.ParkingAssignment{}).
		Select("parking_assignments.*, ps.slot_number as parking_slot_number, pz.name as parking_zone_name, pu.number as property_unit_number, pu.block as property_unit_block, r.name as resident_name").
		Joins("LEFT JOIN horizontal_property.parking_slots ps ON ps.id = parking_assignments.parking_slot_id").
		Joins("LEFT JOIN horizontal_property.parking_zones pz ON pz.id = ps.parking_zone_id").
		Joins("LEFT JOIN horizontal_property.property_units pu ON pu.id = parking_assignments.property_unit_id").
		Joins("LEFT JOIN horizontal_property.residents r ON r.id = parking_assignments.resident_id").
		Where("parking_assignments.business_id = ?", filters.BusinessID)

	if filters.ParkingSlotID != nil {
		query = query.Where("parking_assignments.parking_slot_id = ?", *filters.ParkingSlotID)
	}
	if filters.PropertyUnitID != nil {
		query = query.Where("parking_assignments.property_unit_id = ?", *filters.PropertyUnitID)
	}
	if filters.ResidentID != nil {
		query = query.Where("parking_assignments.resident_id = ?", *filters.ResidentID)
	}
	if filters.IsActive != nil {
		query = query.Where("parking_assignments.is_active = ?", *filters.IsActive)
	}
	query = applyAssignmentStatus(query, filters.Status, filters.Today)
	if q := strings.TrimSpace(filters.Search); q != "" {
		like := "%" + strings.ToLower(q) + "%"
		query = query.Where("(LOWER(parking_assignments.vehicle_plate) LIKE ? OR LOWER(pu.number) LIKE ? OR LOWER(r.name) LIKE ? OR LOWER(ps.slot_number) LIKE ?)", like, like, like, like)
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
		ParkingZoneName    string
		PropertyUnitNumber string
		PropertyUnitBlock  string
		ResidentName       string
	}

	var rows []row
	if err := query.Order("ps.slot_number ASC, parking_assignments.id DESC").Offset(offset).Limit(pageSize).Find(&rows).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error listando asignaciones")
		return nil, fmt.Errorf("error listando asignaciones: %w", err)
	}

	assignmentDTOs := make([]domain.ParkingAssignmentListDTO, len(rows))
	for i, row := range rows {
		assignmentDTOs[i] = domain.ParkingAssignmentListDTO{
			ID:                 row.ID,
			ParkingSlotID:      row.ParkingSlotID,
			ParkingSlotNumber:  row.ParkingSlotNumber,
			ParkingZoneName:    row.ParkingZoneName,
			PropertyUnitID:     row.PropertyUnitID,
			PropertyUnitNumber: row.PropertyUnitNumber,
			PropertyUnitBlock:  row.PropertyUnitBlock,
			ResidentID:         row.ResidentID,
			ResidentName:       row.ResidentName,
			VehiclePlate:       row.VehiclePlate,
			VehicleBrand:       row.VehicleBrand,
			VehicleModel:       row.VehicleModel,
			VehicleColor:       row.VehicleColor,
			Notes:              row.Notes,
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

// applyAssignmentStatus filtra por estado de vigencia respecto a `today` (solo asignaciones
// activas; las liberadas son historial):
//   - active: sin fecha de fin o que termina hoy o después.
//   - expiring: termina entre hoy y dentro de 30 días.
//   - expired: la fecha de fin ya pasó y no se liberó.
func applyAssignmentStatus(query *gorm.DB, status string, today time.Time) *gorm.DB {
	day := today.Format("2006-01-02")
	in30 := today.AddDate(0, 0, 30).Format("2006-01-02")
	switch status {
	case domain.AssignmentStatusActive:
		return query.Where("parking_assignments.is_active = TRUE AND (parking_assignments.end_date IS NULL OR parking_assignments.end_date::date >= ?)", day)
	case domain.AssignmentStatusExpiring:
		return query.Where("parking_assignments.is_active = TRUE AND parking_assignments.end_date::date BETWEEN ? AND ?", day, in30)
	case domain.AssignmentStatusExpired:
		return query.Where("parking_assignments.is_active = TRUE AND parking_assignments.end_date::date < ?", day)
	}
	return query
}

// GetAssignmentSummary cuenta asignaciones por estado y las unidades activas sin cupo.
// Tabla consultada fuera del módulo: property_units (solo lectura).
func (r *ParkingAssignmentRepository) GetAssignmentSummary(ctx context.Context, businessID uint, today time.Time) (*domain.ParkingAssignmentSummaryDTO, error) {
	base := func() *gorm.DB {
		return r.db.Conn(ctx).Model(&models.ParkingAssignment{}).Where("parking_assignments.business_id = ?", businessID)
	}
	out := &domain.ParkingAssignmentSummaryDTO{}
	for _, c := range []struct {
		status string
		dst    *int64
	}{
		{domain.AssignmentStatusActive, &out.Active},
		{domain.AssignmentStatusExpiring, &out.Expiring30},
		{domain.AssignmentStatusExpired, &out.Expired},
	} {
		if err := applyAssignmentStatus(base(), c.status, today).Count(c.dst).Error; err != nil {
			return nil, fmt.Errorf("error contando asignaciones (%s): %w", c.status, err)
		}
	}
	if err := r.db.Conn(ctx).Model(&models.PropertyUnit{}).
		Where("business_id = ? AND is_active = TRUE", businessID).
		Where("NOT EXISTS (SELECT 1 FROM horizontal_property.parking_assignments pa WHERE pa.property_unit_id = property_units.id AND pa.is_active = TRUE AND pa.deleted_at IS NULL)").
		Count(&out.UnitsWithoutSlot).Error; err != nil {
		return nil, fmt.Errorf("error contando unidades sin cupo: %w", err)
	}
	return out, nil
}
