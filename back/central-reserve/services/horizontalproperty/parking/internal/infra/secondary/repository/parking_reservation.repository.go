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

type ParkingReservationRepository struct {
	db     db.IDatabase
	logger log.ILogger
}

func NewParkingReservationRepository(db db.IDatabase, logger log.ILogger) domain.ParkingReservationRepository {
	return &ParkingReservationRepository{
		db:     db,
		logger: logger,
	}
}

// CreateParkingReservation crea una nueva reserva de parqueadero
func (r *ParkingReservationRepository) CreateParkingReservation(ctx context.Context, reservation *domain.ParkingReservation) (*domain.ParkingReservation, error) {
	model := &models.ParkingReservation{
		BusinessID:          reservation.BusinessID,
		ParkingSlotID:       reservation.ParkingSlotID,
		PropertyUnitID:      reservation.PropertyUnitID,
		ResidentID:          reservation.ResidentID,
		VisitorID:           reservation.VisitorID,
		VisitorVehicleID:    reservation.VisitorVehicleID,
		ReservationStatusID: reservation.ReservationStatusID,
		ReservationDate:     reservation.ReservationDate,
		StartTime:           reservation.StartTime,
		EndTime:             reservation.EndTime,
		DurationHours:       reservation.DurationHours,
		VehiclePlate:        reservation.VehiclePlate,
		VehicleBrand:        reservation.VehicleBrand,
		VehicleModel:        reservation.VehicleModel,
		VehicleColor:        reservation.VehicleColor,
		QRCode:              reservation.QRCode,
		AccessCode:          reservation.AccessCode,
		RequiresApproval:    reservation.RequiresApproval,
		NotifyResident:      reservation.NotifyResident,
		NotifyAdmin:         reservation.NotifyAdmin,
		Notes:               reservation.Notes,
		ResidentNotes:       reservation.ResidentNotes,
	}

	if err := r.db.Conn(ctx).Create(model).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error creando reserva de parqueadero")
		return nil, fmt.Errorf("error creando reserva de parqueadero: %w", err)
	}

	// Cargar relaciones
	if err := r.db.Conn(ctx).
		Preload("ParkingSlot").
		Preload("PropertyUnit").
		Preload("Resident").
		Preload("Visitor").
		Preload("ReservationStatus").
		First(model, model.ID).Error; err != nil {
		return nil, fmt.Errorf("error cargando relaciones de reserva: %w", err)
	}

	return mappers.ParkingReservationToDomain(model), nil
}

// GetParkingReservationByID obtiene una reserva por ID
func (r *ParkingReservationRepository) GetParkingReservationByID(ctx context.Context, id uint) (*domain.ParkingReservation, error) {
	var reservation models.ParkingReservation
	if err := r.db.Conn(ctx).
		Preload("ParkingSlot").
		Preload("PropertyUnit").
		Preload("Resident").
		Preload("Visitor").
		Preload("ReservationStatus").
		First(&reservation, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, fmt.Errorf("error obteniendo reserva: %w", err)
	}

	return mappers.ParkingReservationToDomain(&reservation), nil
}

// UpdateParkingReservation actualiza una reserva
func (r *ParkingReservationRepository) UpdateParkingReservation(ctx context.Context, reservation *domain.ParkingReservation) error {
	updates := map[string]interface{}{
		"reservation_status_id":  reservation.ReservationStatusID,
		"checked_in_by_user_id":  reservation.CheckedInByUserID,
		"checked_out_by_user_id": reservation.CheckedOutByUserID,
		"approved_by_user_id":    reservation.ApprovedByUserID,
		"rejected_by_user_id":    reservation.RejectedByUserID,
		"rejection_reason":       reservation.RejectionReason,
		"cancelled_by_user_id":   reservation.CancelledByUserID,
		"cancellation_reason":    reservation.CancellationReason,
		"qr_code":                reservation.QRCode,
		"access_code":            reservation.AccessCode,
	}

	if reservation.CheckedInAt != nil {
		updates["checked_in_at"] = reservation.CheckedInAt
	}
	if reservation.CheckedOutAt != nil {
		updates["checked_out_at"] = reservation.CheckedOutAt
	}
	if reservation.ApprovedAt != nil {
		updates["approved_at"] = reservation.ApprovedAt
	}
	if reservation.RejectedAt != nil {
		updates["rejected_at"] = reservation.RejectedAt
	}
	if reservation.CancelledAt != nil {
		updates["cancelled_at"] = reservation.CancelledAt
	}
	if reservation.NotificationSentAt != nil {
		updates["notification_sent_at"] = reservation.NotificationSentAt
	}
	if reservation.ReminderSentAt != nil {
		updates["reminder_sent_at"] = reservation.ReminderSentAt
	}

	if err := r.db.Conn(ctx).Model(&models.ParkingReservation{}).Where("id = ?", reservation.ID).Updates(updates).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error actualizando reserva")
		return fmt.Errorf("error actualizando reserva: %w", err)
	}

	return nil
}

// DeleteParkingReservation elimina una reserva
func (r *ParkingReservationRepository) DeleteParkingReservation(ctx context.Context, id uint) error {
	if err := r.db.Conn(ctx).Delete(&models.ParkingReservation{}, id).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error eliminando reserva")
		return fmt.Errorf("error eliminando reserva: %w", err)
	}

	return nil
}

// ListParkingReservations lista las reservas según los filtros
func (r *ParkingReservationRepository) ListParkingReservations(ctx context.Context, filters domain.ParkingReservationFiltersDTO) (*domain.PaginatedParkingReservationsDTO, error) {
	var total int64

	query := r.db.Conn(ctx).Model(&models.ParkingReservation{}).
		Select("parking_reservations.*, ps.slot_number as parking_slot_number, pu.number as property_unit_number, r.name as resident_name, v.full_name as visitor_name, prs.name as status_name").
		Joins("LEFT JOIN horizontal_property.parking_slots ps ON ps.id = parking_reservations.parking_slot_id").
		Joins("LEFT JOIN horizontal_property.property_units pu ON pu.id = parking_reservations.property_unit_id").
		Joins("LEFT JOIN horizontal_property.residents r ON r.id = parking_reservations.resident_id").
		Joins("LEFT JOIN horizontal_property.visitors v ON v.id = parking_reservations.visitor_id").
		Joins("LEFT JOIN horizontal_property.parking_reservation_statuses prs ON prs.id = parking_reservations.reservation_status_id").
		Where("parking_reservations.business_id = ?", filters.BusinessID)

	if filters.ParkingSlotID != nil {
		query = query.Where("parking_reservations.parking_slot_id = ?", *filters.ParkingSlotID)
	}
	if filters.PropertyUnitID != nil {
		query = query.Where("parking_reservations.property_unit_id = ?", *filters.PropertyUnitID)
	}
	if filters.ResidentID != nil {
		query = query.Where("parking_reservations.resident_id = ?", *filters.ResidentID)
	}
	if filters.VisitorID != nil {
		query = query.Where("parking_reservations.visitor_id = ?", *filters.VisitorID)
	}
	if filters.ReservationStatusID != nil {
		query = query.Where("parking_reservations.reservation_status_id = ?", *filters.ReservationStatusID)
	}
	if filters.StartDate != nil {
		query = query.Where("parking_reservations.reservation_date >= ?", *filters.StartDate)
	}
	if filters.EndDate != nil {
		query = query.Where("parking_reservations.reservation_date <= ?", *filters.EndDate)
	}

	// Contar total
	if err := query.Count(&total).Error; err != nil {
		return nil, fmt.Errorf("error contando reservas: %w", err)
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
		models.ParkingReservation
		ParkingSlotNumber  string
		PropertyUnitNumber string
		ResidentName       string
		VisitorName        string
		StatusName         string
	}

	var rows []row
	if err := query.Order("pr.reservation_date DESC, pr.start_time DESC").
		Offset(offset).
		Limit(pageSize).
		Find(&rows).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error listando reservas")
		return nil, fmt.Errorf("error listando reservas: %w", err)
	}

	reservationDTOs := make([]domain.ParkingReservationListDTO, len(rows))
	for i, row := range rows {
		reservationDTOs[i] = domain.ParkingReservationListDTO{
			ID:                 row.ID,
			ParkingSlotID:      row.ParkingSlotID,
			ParkingSlotNumber:  row.ParkingSlotNumber,
			PropertyUnitID:     row.PropertyUnitID,
			PropertyUnitNumber: row.PropertyUnitNumber,
			ResidentID:         row.ResidentID,
			ResidentName:       row.ResidentName,
			VisitorID:          row.VisitorID,
			VisitorName:        row.VisitorName,
			StatusName:         row.StatusName,
			ReservationDate:    row.ReservationDate,
			StartTime:          row.StartTime,
			EndTime:            row.EndTime,
			VehiclePlate:       row.VehiclePlate,
			CheckedInAt:        row.CheckedInAt,
			CheckedOutAt:       row.CheckedOutAt,
			CreatedAt:          row.CreatedAt,
		}
	}

	totalPages := int(math.Ceil(float64(total) / float64(pageSize)))

	return &domain.PaginatedParkingReservationsDTO{
		ParkingReservations: reservationDTOs,
		Total:               total,
		Page:                page,
		PageSize:            pageSize,
		TotalPages:          totalPages,
	}, nil
}

// CheckAvailability verifica la disponibilidad de un espacio en un horario específico
func (r *ParkingReservationRepository) CheckAvailability(ctx context.Context, dto domain.CheckParkingAvailabilityDTO) (bool, error) {
	// Verificar reservas que se solapen
	var count int64
	query := r.db.Conn(ctx).Model(&models.ParkingReservation{}).
		Where("parking_slot_id = ?", dto.ParkingSlotID).
		Where("reservation_date = ?", dto.ReservationDate).
		Where("cancelled_at IS NULL").
		Where("(start_time < ? AND end_time > ?)", dto.EndTime, dto.StartTime)

	if dto.ExcludeReservationID != nil {
		query = query.Where("id != ?", *dto.ExcludeReservationID)
	}

	if err := query.Count(&count).Error; err != nil {
		return false, fmt.Errorf("error verificando disponibilidad: %w", err)
	}

	return count == 0, nil
}

// GetOverlappingReservations obtiene reservas que se solapan con un horario
func (r *ParkingReservationRepository) GetOverlappingReservations(ctx context.Context, slotID uint, date string, startTime, endTime string, excludeID *uint) ([]*domain.ParkingReservation, error) {
	var reservations []models.ParkingReservation
	query := r.db.Conn(ctx).
		Where("parking_slot_id = ?", slotID).
		Where("reservation_date = ?", date).
		Where("cancelled_at IS NULL").
		Where("(start_time < ? AND end_time > ?)", endTime, startTime)

	if excludeID != nil {
		query = query.Where("id != ?", *excludeID)
	}

	if err := query.Find(&reservations).Error; err != nil {
		return nil, fmt.Errorf("error obteniendo reservas solapadas: %w", err)
	}

	result := make([]*domain.ParkingReservation, len(reservations))
	for i, reservation := range reservations {
		result[i] = mappers.ParkingReservationToDomain(&reservation)
	}

	return result, nil
}

// GetReservationsByDateRange obtiene reservas en un rango de fechas
func (r *ParkingReservationRepository) GetReservationsByDateRange(ctx context.Context, slotID uint, startDate, endDate string) ([]*domain.ParkingReservation, error) {
	var reservations []models.ParkingReservation
	if err := r.db.Conn(ctx).
		Where("parking_slot_id = ?", slotID).
		Where("reservation_date >= ? AND reservation_date <= ?", startDate, endDate).
		Where("cancelled_at IS NULL").
		Find(&reservations).Error; err != nil {
		return nil, fmt.Errorf("error obteniendo reservas: %w", err)
	}

	result := make([]*domain.ParkingReservation, len(reservations))
	for i, reservation := range reservations {
		result[i] = mappers.ParkingReservationToDomain(&reservation)
	}

	return result, nil
}

// GetPendingReservations obtiene las reservas pendientes de aprobación
func (r *ParkingReservationRepository) GetPendingReservations(ctx context.Context, businessID uint) ([]*domain.ParkingReservation, error) {
	var reservations []models.ParkingReservation
	if err := r.db.Conn(ctx).
		Joins("JOIN horizontal_property.parking_reservation_statuses prs ON prs.id = parking_reservations.reservation_status_id").
		Where("parking_reservations.business_id = ?", businessID).
		Where("prs.code = ?", "pending").
		Where("parking_reservations.cancelled_at IS NULL").
		Find(&reservations).Error; err != nil {
		return nil, fmt.Errorf("error obteniendo reservas pendientes: %w", err)
	}

	result := make([]*domain.ParkingReservation, len(reservations))
	for i, reservation := range reservations {
		result[i] = mappers.ParkingReservationToDomain(&reservation)
	}

	return result, nil
}
