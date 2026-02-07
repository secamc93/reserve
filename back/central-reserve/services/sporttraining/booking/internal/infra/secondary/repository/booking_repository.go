package repository

import (
	"context"
	"fmt"
	"math"

	"central_reserve/services/sporttraining/booking/internal/domain"
	"central_reserve/services/sporttraining/booking/internal/infra/secondary/repository/mappers"
	"central_reserve/shared/db"
	"central_reserve/shared/log"
	"dbpostgres/app/infra/models"

	"gorm.io/gorm"
)

type BookingRepository struct {
	db     db.IDatabase
	logger log.ILogger
}

func New(db db.IDatabase, logger log.ILogger) domain.BookingRepository {
	return &BookingRepository{
		db:     db,
		logger: logger,
	}
}

func (r *BookingRepository) Create(ctx context.Context, booking *domain.Booking) (*domain.Booking, error) {
	model := &models.SessionBooking{
		TrainingSessionID: booking.TrainingSessionID,
		PlayerID:          booking.PlayerID,
		BookedByUserID:    booking.BookedByUserID,
		BookingStatusID:   booking.BookingStatusID,
		BookingDate:       booking.BookingDate,
		RequestNotes:      booking.RequestNotes,
		IsPaid:            booking.IsPaid,
	}

	if err := r.db.Conn(ctx).Create(model).Error; err != nil {
		return nil, fmt.Errorf("error creando reserva: %w", err)
	}

	// Reload with relations
	if err := r.db.Conn(ctx).
		Preload("TrainingSession").
		Preload("Player").
		Preload("BookingStatus").
		First(model, model.ID).Error; err != nil {
		return nil, fmt.Errorf("error cargando relaciones: %w", err)
	}

	return mappers.BookingToDomain(model), nil
}

func (r *BookingRepository) GetByID(ctx context.Context, id uint, businessID uint) (*domain.Booking, error) {
	var model models.SessionBooking
	query := r.db.Conn(ctx).
		Preload("TrainingSession").
		Preload("Player").
		Preload("BookingStatus").
		Preload("BookedByUser")

	// Join with training_session to filter by business_id
	query = query.Joins("JOIN sport_training.training_sessions ts ON ts.id = session_bookings.training_session_id")
	if businessID != 0 {
		query = query.Where("ts.business_id = ?", businessID)
	}

	if err := query.First(&model, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, domain.ErrBookingNotFound
		}
		return nil, fmt.Errorf("error obteniendo reserva: %w", err)
	}

	return mappers.BookingToDomain(&model), nil
}

func (r *BookingRepository) Update(ctx context.Context, booking *domain.Booking) (*domain.Booking, error) {
	// Verify existence
	var existing models.SessionBooking
	if err := r.db.Conn(ctx).First(&existing, booking.ID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, domain.ErrBookingNotFound
		}
		return nil, fmt.Errorf("error buscando reserva: %w", err)
	}

	updates := map[string]interface{}{
		"booking_status_id":    booking.BookingStatusID,
		"request_notes":        booking.RequestNotes,
		"reviewed_at":          booking.ReviewedAt,
		"reviewed_by_coach_id": booking.ReviewedByCoachID,
		"response_notes":       booking.ResponseNotes,
		"cancelled_at":         booking.CancelledAt,
		"cancelled_by_user_id": booking.CancelledByUserID,
		"cancellation_reason":  booking.CancellationReason,
		"price":                booking.Price,
		"is_paid":              booking.IsPaid,
		"payment_date":         booking.PaymentDate,
		"payment_method":       booking.PaymentMethod,
	}

	if err := r.db.Conn(ctx).Model(&models.SessionBooking{}).Where("id = ?", booking.ID).Updates(updates).Error; err != nil {
		return nil, fmt.Errorf("error actualizando reserva: %w", err)
	}

	// Fetch business_id from training_session
	var session models.TrainingSession
	if err := r.db.Conn(ctx).First(&session, existing.TrainingSessionID).Error; err != nil {
		return nil, fmt.Errorf("error obteniendo sesión: %w", err)
	}

	return r.GetByID(ctx, booking.ID, session.BusinessID)
}

func (r *BookingRepository) List(ctx context.Context, filters domain.BookingFiltersDTO) (*domain.PaginatedBookingsDTO, error) {
	var total int64
	countQuery := r.db.Conn(ctx).Model(&models.SessionBooking{}).
		Joins("JOIN sport_training.training_sessions ts ON ts.id = session_bookings.training_session_id")

	if filters.BusinessID != 0 {
		countQuery = countQuery.Where("ts.business_id = ?", filters.BusinessID)
	}
	if filters.Status != "" {
		countQuery = countQuery.Joins("JOIN sport_training.st_booking_statuses bs ON bs.id = session_bookings.booking_status_id").
			Where("bs.code = ?", filters.Status)
	}
	if filters.PlayerID != nil {
		countQuery = countQuery.Where("session_bookings.player_id = ?", *filters.PlayerID)
	}
	if filters.CoachID != nil {
		countQuery = countQuery.Where("ts.coach_id = ?", *filters.CoachID)
	}
	if filters.StartDate != nil {
		countQuery = countQuery.Where("ts.scheduled_date >= ?", *filters.StartDate)
	}
	if filters.EndDate != nil {
		countQuery = countQuery.Where("ts.scheduled_date <= ?", *filters.EndDate)
	}

	if err := countQuery.Count(&total).Error; err != nil {
		return nil, fmt.Errorf("error contando reservas: %w", err)
	}

	var bookings []models.SessionBooking
	query := r.db.Conn(ctx).
		Preload("TrainingSession").
		Preload("Player").
		Preload("BookingStatus").
		Joins("JOIN sport_training.training_sessions ts ON ts.id = session_bookings.training_session_id")

	if filters.BusinessID != 0 {
		query = query.Where("ts.business_id = ?", filters.BusinessID)
	}
	if filters.Status != "" {
		query = query.Joins("JOIN sport_training.st_booking_statuses bs ON bs.id = session_bookings.booking_status_id").
			Where("bs.code = ?", filters.Status)
	}
	if filters.PlayerID != nil {
		query = query.Where("session_bookings.player_id = ?", *filters.PlayerID)
	}
	if filters.CoachID != nil {
		query = query.Where("ts.coach_id = ?", *filters.CoachID)
	}
	if filters.StartDate != nil {
		query = query.Where("ts.scheduled_date >= ?", *filters.StartDate)
	}
	if filters.EndDate != nil {
		query = query.Where("ts.scheduled_date <= ?", *filters.EndDate)
	}

	offset := (filters.Page - 1) * filters.PageSize
	if err := query.Order("session_bookings.created_at DESC").Offset(offset).Limit(filters.PageSize).Find(&bookings).Error; err != nil {
		return nil, fmt.Errorf("error listando reservas: %w", err)
	}

	result := make([]domain.BookingListDTO, len(bookings))
	for i, b := range bookings {
		var statusName, statusCode, statusColor string
		if b.BookingStatus.ID != 0 {
			statusName = b.BookingStatus.Name
			statusCode = b.BookingStatus.Code
			statusColor = b.BookingStatus.Color
		}

		var playerName string
		var sessionDate models.TrainingSession
		var sessionMode, location string
		if b.Player.ID != 0 {
			playerName = b.Player.FirstName + " " + b.Player.LastName
		}
		if b.TrainingSession.ID != 0 {
			sessionDate = b.TrainingSession
			sessionMode = b.TrainingSession.SessionMode
			location = b.TrainingSession.Location
		}

		result[i] = domain.BookingListDTO{
			ID:                b.ID,
			TrainingSessionID: b.TrainingSessionID,
			PlayerID:          b.PlayerID,
			PlayerName:        playerName,
			SessionDate:       sessionDate.ScheduledDate,
			SessionMode:       sessionMode,
			Location:          location,
			StatusName:        statusName,
			StatusCode:        statusCode,
			StatusColor:       statusColor,
			BookingDate:       b.BookingDate,
			IsPaid:            b.IsPaid,
			Price:             b.Price,
			CreatedAt:         b.CreatedAt,
		}
	}

	return &domain.PaginatedBookingsDTO{
		Bookings:   result,
		Total:      total,
		Page:       filters.Page,
		PageSize:   filters.PageSize,
		TotalPages: int(math.Ceil(float64(total) / float64(filters.PageSize))),
	}, nil
}

func (r *BookingRepository) GetBookingStatusByCode(ctx context.Context, code string) (*domain.StatusRef, error) {
	var status models.STBookingStatus
	if err := r.db.Conn(ctx).Where("code = ?", code).First(&status).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("estado de reserva no encontrado: %s", code)
		}
		return nil, fmt.Errorf("error obteniendo estado de reserva: %w", err)
	}

	return &domain.StatusRef{
		ID:      status.ID,
		Name:    status.Name,
		Code:    status.Code,
		Color:   status.Color,
		IsFinal: status.IsFinal,
	}, nil
}
