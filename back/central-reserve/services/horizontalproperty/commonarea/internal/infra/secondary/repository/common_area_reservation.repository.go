package repository

import (
	"context"
	"fmt"
	"math"
	"time"

	"central_reserve/services/horizontalproperty/commonarea/internal/domain"
	"central_reserve/services/horizontalproperty/commonarea/internal/infra/secondary/repository/mappers"
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

	return mappers.ReservationToDomain(model), nil
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

	return mappers.ReservationToDomain(&reservation), nil
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

// ChangeReservationStatus cambia el estado de una reserva validando las transiciones permitidas
func (r *CommonAreaReservationRepository) ChangeReservationStatus(ctx context.Context, reservationID uint, newStatusCode string) error {
	// Obtener reserva con su status actual
	var reservationModel models.CommonAreaReservation
	if err := r.db.Conn(ctx).Preload("ReservationStatus").First(&reservationModel, reservationID).Error; err != nil {
		return fmt.Errorf("error obteniendo reserva: %w", err)
	}

	// Obtener nuevo status
	var newStatusModel models.CommonAreaReservationStatus
	if err := r.db.Conn(ctx).Where("code = ?", newStatusCode).First(&newStatusModel).Error; err != nil {
		return fmt.Errorf("estado no encontrado: %s", newStatusCode)
	}

	// Convertir status actual a dominio
	currentStatus := &domain.CommonAreaReservationStatus{
		ID:          reservationModel.ReservationStatus.ID,
		Code:        reservationModel.ReservationStatus.Code,
		Name:        reservationModel.ReservationStatus.Name,
		Description: reservationModel.ReservationStatus.Description,
		IsFinal:     reservationModel.ReservationStatus.IsFinal,
		IsActive:    reservationModel.ReservationStatus.IsActive,
	}

	// Convertir nuevo status a dominio
	newStatus := &domain.CommonAreaReservationStatus{
		ID:          newStatusModel.ID,
		Code:        newStatusModel.Code,
		Name:        newStatusModel.Name,
		Description: newStatusModel.Description,
		IsFinal:     newStatusModel.IsFinal,
		IsActive:    newStatusModel.IsActive,
	}

	// Crear state machine y validar transición
	stateMachine := domain.NewReservationStateMachine()
	if err := stateMachine.ValidateTransition(currentStatus, newStatusCode); err != nil {
		return err
	}

	// Convertir reserva a dominio para preparar transición
	reservation := mappers.ReservationToDomain(&reservationModel)

	// Preparar cambios de la transición
	transition := stateMachine.PrepareTransition(reservation, newStatus, newStatusCode)

	// Aplicar cambios al modelo
	reservationModel.ReservationStatusID = transition.NewStatusID
	if transition.ApprovedAt != nil {
		reservationModel.ApprovedAt = transition.ApprovedAt
	}
	if transition.QRCode != "" {
		reservationModel.QRCode = transition.QRCode
		reservationModel.AccessCode = transition.AccessCode
	}
	if transition.CheckedInAt != nil {
		reservationModel.CheckedInAt = transition.CheckedInAt
	}
	if transition.CheckedOutAt != nil {
		reservationModel.CheckedOutAt = transition.CheckedOutAt
	}
	if transition.RejectedAt != nil {
		reservationModel.RejectedAt = transition.RejectedAt
	}
	if transition.CancelledAt != nil {
		reservationModel.CancelledAt = transition.CancelledAt
	}

	// Persistir cambios
	return r.db.Conn(ctx).Save(&reservationModel).Error
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

	// Consulta paginada usando modelos GORM con Preload
	var reservationsModels []models.CommonAreaReservation
	query := r.db.Conn(ctx).
		Model(&models.CommonAreaReservation{}).
		Preload("CommonArea").
		Preload("PropertyUnit").
		Preload("Resident").
		Preload("ReservationStatus").
		Where("business_id = ?", filters.BusinessID)

	if filters.CommonAreaID != nil {
		query = query.Where("common_area_id = ?", *filters.CommonAreaID)
	}
	if filters.PropertyUnitID != nil {
		query = query.Where("property_unit_id = ?", *filters.PropertyUnitID)
	}
	if filters.ResidentID != nil {
		query = query.Where("resident_id = ?", *filters.ResidentID)
	}
	if filters.ReservationStatusID != nil {
		query = query.Where("reservation_status_id = ?", *filters.ReservationStatusID)
	}
	if filters.StartDate != nil {
		query = query.Where("reservation_date >= ?", *filters.StartDate)
	}
	if filters.EndDate != nil {
		query = query.Where("reservation_date <= ?", *filters.EndDate)
	}

	offset := (filters.Page - 1) * filters.PageSize
	if err := query.Order("reservation_date DESC, start_time ASC").
		Limit(filters.PageSize).
		Offset(offset).
		Find(&reservationsModels).Error; err != nil {
		return nil, fmt.Errorf("error listando reservas: %w", err)
	}

	reservations := make([]domain.ReservationListDTO, len(reservationsModels))
	for i, r := range reservationsModels {
		commonAreaName := ""
		if r.CommonArea != nil {
			commonAreaName = r.CommonArea.Name
		}

		propertyUnitNumber := ""
		if r.PropertyUnit != nil {
			propertyUnitNumber = r.PropertyUnit.Number
		}

		residentName := ""
		if r.Resident != nil {
			residentName = r.Resident.Name
		}

		statusName := ""
		if r.ReservationStatus != nil {
			statusName = r.ReservationStatus.Name
		}

		reservations[i] = domain.ReservationListDTO{
			ID:                 r.ID,
			CommonAreaName:     commonAreaName,
			PropertyUnitNumber: propertyUnitNumber,
			ResidentName:       residentName,
			StatusName:         statusName,
			ReservationDate:    r.ReservationDate,
			StartTime:          r.StartTime,
			EndTime:            r.EndTime,
			NumberOfGuests:     r.NumberOfGuests,
			CreatedAt:          r.CreatedAt,
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

// mapReservationToDomain está deprecada - usar mappers.ReservationToDomain
// Se mantiene temporalmente para compatibilidad
func mapReservationToDomain(m *models.CommonAreaReservation) *domain.CommonAreaReservation {
	return mappers.ReservationToDomain(m)
}
