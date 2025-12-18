package repository

import (
	"context"
	"fmt"
	"math"
	"time"

	"central_reserve/services/horizontalproperty/commonarea/internal/domain"
	"central_reserve/shared/db"
	"central_reserve/shared/log"
	"dbpostgres/app/infra/models"

	"gorm.io/gorm"
)

type CommonAreaReservationRepository struct {
	db     db.IDatabase
	logger log.ILogger
}

func NewCommonAreaReservationRepository(db db.IDatabase, logger log.ILogger) domain.CommonAreaReservationRepository {
	return &CommonAreaReservationRepository{
		db:     db,
		logger: logger,
	}
}

// CreateReservation crea una nueva reserva
func (r *CommonAreaReservationRepository) CreateReservation(ctx context.Context, reservation *domain.CommonAreaReservation) (*domain.CommonAreaReservation, error) {
	model := &models.CommonAreaReservation{
		BusinessID:          reservation.BusinessID,
		CommonAreaID:        reservation.CommonAreaID,
		PropertyUnitID:      reservation.PropertyUnitID,
		ResidentID:          reservation.ResidentID,
		ReservationStatusID: reservation.ReservationStatusID,
		ReservationDate:     reservation.ReservationDate,
		StartTime:           reservation.StartTime,
		EndTime:             reservation.EndTime,
		DurationHours:       reservation.DurationHours,
		RequiresApproval:    reservation.RequiresApproval,
		NumberOfGuests:      reservation.NumberOfGuests,
		Purpose:             reservation.Purpose,
		SpecialRequests:     reservation.SpecialRequests,
		IsRecurring:         reservation.IsRecurring,
		RecurringPatternID:  reservation.RecurringPatternID,
		ParentReservationID: reservation.ParentReservationID,
		TotalAmount:         reservation.TotalAmount,
		DepositAmount:       reservation.DepositAmount,
		NotifyResident:      reservation.NotifyResident,
		NotifyAdmin:         reservation.NotifyAdmin,
		Notes:               reservation.Notes,
		ResidentNotes:       reservation.ResidentNotes,
	}

	if err := r.db.Conn(ctx).Create(model).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error creando reserva")
		return nil, fmt.Errorf("error creando reserva: %w", err)
	}

	// Cargar relaciones
	if err := r.db.Conn(ctx).
		Preload("CommonArea").
		Preload("PropertyUnit").
		Preload("Resident").
		Preload("ReservationStatus").
		First(model, model.ID).Error; err != nil {
		return nil, fmt.Errorf("error cargando relaciones de reserva: %w", err)
	}

	return mapReservationToDomain(model), nil
}

// GetReservationByID obtiene una reserva por ID
func (r *CommonAreaReservationRepository) GetReservationByID(ctx context.Context, id uint) (*domain.CommonAreaReservation, error) {
	var reservation models.CommonAreaReservation
	if err := r.db.Conn(ctx).
		Preload("CommonArea").
		Preload("PropertyUnit").
		Preload("Resident").
		Preload("ReservationStatus").
		First(&reservation, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, domain.ErrReservationNotFound
		}
		return nil, fmt.Errorf("error obteniendo reserva: %w", err)
	}

	return mapReservationToDomain(&reservation), nil
}

// UpdateReservation actualiza una reserva
func (r *CommonAreaReservationRepository) UpdateReservation(ctx context.Context, reservation *domain.CommonAreaReservation) error {
	updates := map[string]interface{}{
		"reservation_status_id":  reservation.ReservationStatusID,
		"approved_by_user_id":    reservation.ApprovedByUserID,
		"rejected_by_user_id":    reservation.RejectedByUserID,
		"rejection_reason":       reservation.RejectionReason,
		"checked_in_by_user_id":  reservation.CheckedInByUserID,
		"checked_out_by_user_id": reservation.CheckedOutByUserID,
		"cancelled_by_user_id":   reservation.CancelledByUserID,
		"cancellation_reason":    reservation.CancellationReason,
		"qr_code":                reservation.QRCode,
		"access_code":            reservation.AccessCode,
		"deposit_paid":           reservation.DepositPaid,
		"full_payment_paid":      reservation.FullPaymentPaid,
		"refund_amount":          reservation.RefundAmount,
	}

	if reservation.ApprovedAt != nil {
		updates["approved_at"] = reservation.ApprovedAt
	}
	if reservation.RejectedAt != nil {
		updates["rejected_at"] = reservation.RejectedAt
	}
	if reservation.CheckedInAt != nil {
		updates["checked_in_at"] = reservation.CheckedInAt
	}
	if reservation.CheckedOutAt != nil {
		updates["checked_out_at"] = reservation.CheckedOutAt
	}
	if reservation.CancelledAt != nil {
		updates["cancelled_at"] = reservation.CancelledAt
	}
	if reservation.DepositPaidAt != nil {
		updates["deposit_paid_at"] = reservation.DepositPaidAt
	}
	if reservation.FullPaymentPaidAt != nil {
		updates["full_payment_paid_at"] = reservation.FullPaymentPaidAt
	}
	if reservation.NotificationSentAt != nil {
		updates["notification_sent_at"] = reservation.NotificationSentAt
	}
	if reservation.ReminderSentAt != nil {
		updates["reminder_sent_at"] = reservation.ReminderSentAt
	}

	if err := r.db.Conn(ctx).Model(&models.CommonAreaReservation{}).Where("id = ?", reservation.ID).Updates(updates).Error; err != nil {
		return fmt.Errorf("error actualizando reserva: %w", err)
	}

	return nil
}

// ListReservations lista reservas con filtros y paginación
func (r *CommonAreaReservationRepository) ListReservations(ctx context.Context, filters domain.ReservationFiltersDTO) (*domain.PaginatedReservationsDTO, error) {
	// Conteo total
	var total int64
	countQuery := r.db.Conn(ctx).Model(&models.CommonAreaReservation{}).Where("business_id = ?", filters.BusinessID)

	if filters.CommonAreaID != nil {
		countQuery = countQuery.Where("common_area_id = ?", *filters.CommonAreaID)
	}
	if filters.PropertyUnitID != nil {
		countQuery = countQuery.Where("property_unit_id = ?", *filters.PropertyUnitID)
	}
	if filters.ResidentID != nil {
		countQuery = countQuery.Where("resident_id = ?", *filters.ResidentID)
	}
	if filters.ReservationStatusID != nil {
		countQuery = countQuery.Where("reservation_status_id = ?", *filters.ReservationStatusID)
	}
	if filters.StartDate != nil {
		countQuery = countQuery.Where("reservation_date >= ?", *filters.StartDate)
	}
	if filters.EndDate != nil {
		countQuery = countQuery.Where("reservation_date <= ?", *filters.EndDate)
	}

	if err := countQuery.Count(&total).Error; err != nil {
		return nil, fmt.Errorf("error contando reservas: %w", err)
	}

	// Consulta paginada
	type row struct {
		ID                 uint
		CommonAreaName     string
		PropertyUnitNumber string
		ResidentName       string
		StatusName         string
		ReservationDate    time.Time
		StartTime          string
		EndTime            string
		NumberOfGuests     int
		CreatedAt          time.Time
	}

	rows := []row{}
	query := r.db.Conn(ctx).Table("horizontal_property.common_area_reservations r").
		Select("r.id, ca.name as common_area_name, pu.number as property_unit_number, "+
			"COALESCE(res.name, '') as resident_name, rs.name as status_name, "+
			"r.reservation_date, r.start_time, r.end_time, r.number_of_guests, r.created_at").
		Joins("JOIN horizontal_property.common_areas ca ON ca.id = r.common_area_id").
		Joins("JOIN horizontal_property.property_units pu ON pu.id = r.property_unit_id").
		Joins("LEFT JOIN horizontal_property.residents res ON res.id = r.resident_id").
		Joins("JOIN horizontal_property.common_area_reservation_statuses rs ON rs.id = r.reservation_status_id").
		Where("r.business_id = ?", filters.BusinessID)

	if filters.CommonAreaID != nil {
		query = query.Where("r.common_area_id = ?", *filters.CommonAreaID)
	}
	if filters.PropertyUnitID != nil {
		query = query.Where("r.property_unit_id = ?", *filters.PropertyUnitID)
	}
	if filters.ResidentID != nil {
		query = query.Where("r.resident_id = ?", *filters.ResidentID)
	}
	if filters.ReservationStatusID != nil {
		query = query.Where("r.reservation_status_id = ?", *filters.ReservationStatusID)
	}
	if filters.StartDate != nil {
		query = query.Where("r.reservation_date >= ?", *filters.StartDate)
	}
	if filters.EndDate != nil {
		query = query.Where("r.reservation_date <= ?", *filters.EndDate)
	}

	offset := (filters.Page - 1) * filters.PageSize
	if err := query.Order("r.reservation_date DESC, r.start_time ASC").
		Limit(filters.PageSize).
		Offset(offset).
		Scan(&rows).Error; err != nil {
		return nil, fmt.Errorf("error listando reservas: %w", err)
	}

	reservations := make([]domain.ReservationListDTO, len(rows))
	for i, rw := range rows {
		reservations[i] = domain.ReservationListDTO{
			ID:                 rw.ID,
			CommonAreaName:     rw.CommonAreaName,
			PropertyUnitNumber: rw.PropertyUnitNumber,
			ResidentName:       rw.ResidentName,
			StatusName:         rw.StatusName,
			ReservationDate:    rw.ReservationDate,
			StartTime:          rw.StartTime,
			EndTime:            rw.EndTime,
			NumberOfGuests:     rw.NumberOfGuests,
			CreatedAt:          rw.CreatedAt,
		}
	}

	return &domain.PaginatedReservationsDTO{
		Reservations: reservations,
		Total:        total,
		Page:         filters.Page,
		PageSize:     filters.PageSize,
		TotalPages:   int(math.Ceil(float64(total) / float64(filters.PageSize))),
	}, nil
}

// CheckAvailability verifica si una zona está disponible en un horario específico
func (r *CommonAreaReservationRepository) CheckAvailability(ctx context.Context, dto domain.CheckAvailabilityDTO) (bool, error) {
	// Verificar solapamiento con otras reservas
	overlapping, err := r.GetOverlappingReservations(ctx, dto.CommonAreaID, dto.ReservationDate, dto.StartTime, dto.EndTime, dto.ExcludeReservationID)
	if err != nil {
		return false, err
	}

	// Si hay reservas solapadas, no está disponible
	if len(overlapping) > 0 {
		return false, nil
	}

	return true, nil
}

// GetOverlappingReservations obtiene reservas que se solapan con el horario dado
func (r *CommonAreaReservationRepository) GetOverlappingReservations(ctx context.Context, commonAreaID uint, date time.Time, startTime, endTime string, excludeID *uint) ([]*domain.CommonAreaReservation, error) {
	var reservations []models.CommonAreaReservation

	query := r.db.Conn(ctx).
		Where("common_area_id = ? AND reservation_date = ?", commonAreaID, date).
		Where("reservation_status_id NOT IN (SELECT id FROM horizontal_property.common_area_reservation_statuses WHERE code IN ('cancelled', 'rejected', 'expired'))").
		Where("(start_time < ? AND end_time > ?)", endTime, startTime) // Solapamiento

	if excludeID != nil {
		query = query.Where("id != ?", *excludeID)
	}

	if err := query.Find(&reservations).Error; err != nil {
		return nil, fmt.Errorf("error obteniendo reservas solapadas: %w", err)
	}

	result := make([]*domain.CommonAreaReservation, len(reservations))
	for i, res := range reservations {
		result[i] = mapReservationToDomain(&res)
	}

	return result, nil
}

// GetReservationsByDateRange obtiene reservas en un rango de fechas
func (r *CommonAreaReservationRepository) GetReservationsByDateRange(ctx context.Context, commonAreaID uint, startDate, endDate time.Time) ([]*domain.CommonAreaReservation, error) {
	var reservations []models.CommonAreaReservation
	if err := r.db.Conn(ctx).
		Preload("ReservationStatus").
		Where("common_area_id = ? AND reservation_date >= ? AND reservation_date <= ?", commonAreaID, startDate, endDate).
		Order("reservation_date ASC, start_time ASC").
		Find(&reservations).Error; err != nil {
		return nil, fmt.Errorf("error obteniendo reservas: %w", err)
	}

	result := make([]*domain.CommonAreaReservation, len(reservations))
	for i, res := range reservations {
		result[i] = mapReservationToDomain(&res)
	}

	return result, nil
}

// GetPendingReservations obtiene reservas pendientes de aprobación
func (r *CommonAreaReservationRepository) GetPendingReservations(ctx context.Context, businessID uint) ([]*domain.CommonAreaReservation, error) {
	var status models.CommonAreaReservationStatus
	if err := r.db.Conn(ctx).Where("code = ?", "pending").First(&status).Error; err != nil {
		return nil, fmt.Errorf("error obteniendo estado pending: %w", err)
	}

	var reservations []models.CommonAreaReservation
	if err := r.db.Conn(ctx).
		Preload("CommonArea").
		Preload("PropertyUnit").
		Preload("Resident").
		Preload("ReservationStatus").
		Where("business_id = ? AND reservation_status_id = ?", businessID, status.ID).
		Order("reservation_date ASC, start_time ASC").
		Find(&reservations).Error; err != nil {
		return nil, fmt.Errorf("error obteniendo reservas pendientes: %w", err)
	}

	result := make([]*domain.CommonAreaReservation, len(reservations))
	for i, res := range reservations {
		result[i] = mapReservationToDomain(&res)
	}

	return result, nil
}

// GetDB retorna la conexión de base de datos (helper para casos de uso)
func (r *CommonAreaReservationRepository) GetDB(ctx context.Context) *gorm.DB {
	return r.db.Conn(ctx)
}

// mapReservationToDomain mapea modelo a entidad de dominio
func mapReservationToDomain(m *models.CommonAreaReservation) *domain.CommonAreaReservation {
	return &domain.CommonAreaReservation{
		ID:                  m.ID,
		BusinessID:          m.BusinessID,
		CommonAreaID:        m.CommonAreaID,
		PropertyUnitID:      m.PropertyUnitID,
		ResidentID:          m.ResidentID,
		ReservationStatusID: m.ReservationStatusID,
		ReservationDate:     m.ReservationDate,
		StartTime:           m.StartTime,
		EndTime:             m.EndTime,
		DurationHours:       m.DurationHours,
		RequiresApproval:    m.RequiresApproval,
		ApprovedByUserID:    m.ApprovedByUserID,
		ApprovedAt:          m.ApprovedAt,
		RejectedByUserID:    m.RejectedByUserID,
		RejectedAt:          m.RejectedAt,
		RejectionReason:     m.RejectionReason,
		NumberOfGuests:      m.NumberOfGuests,
		Purpose:             m.Purpose,
		SpecialRequests:     m.SpecialRequests,
		IsRecurring:         m.IsRecurring,
		RecurringPatternID:  m.RecurringPatternID,
		ParentReservationID: m.ParentReservationID,
		TotalAmount:         m.TotalAmount,
		DepositAmount:       m.DepositAmount,
		DepositPaid:         m.DepositPaid,
		DepositPaidAt:       m.DepositPaidAt,
		FullPaymentPaid:     m.FullPaymentPaid,
		FullPaymentPaidAt:   m.FullPaymentPaidAt,
		QRCode:              m.QRCode,
		AccessCode:          m.AccessCode,
		CheckedInAt:         m.CheckedInAt,
		CheckedOutAt:        m.CheckedOutAt,
		CheckedInByUserID:   m.CheckedInByUserID,
		CheckedOutByUserID:  m.CheckedOutByUserID,
		NotifyResident:      m.NotifyResident,
		NotifyAdmin:         m.NotifyAdmin,
		NotificationSentAt:  m.NotificationSentAt,
		ReminderSentAt:      m.ReminderSentAt,
		CancelledAt:         m.CancelledAt,
		CancelledByUserID:   m.CancelledByUserID,
		CancellationReason:  m.CancellationReason,
		RefundAmount:        m.RefundAmount,
		Notes:               m.Notes,
		ResidentNotes:       m.ResidentNotes,
		CreatedAt:           m.CreatedAt,
		UpdatedAt:           m.UpdatedAt,
	}
}
