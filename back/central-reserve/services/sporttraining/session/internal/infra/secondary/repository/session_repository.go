package repository

import (
	"context"
	"fmt"
	"math"

	"central_reserve/services/sporttraining/session/internal/domain"
	"central_reserve/services/sporttraining/session/internal/infra/secondary/repository/mappers"
	"central_reserve/shared/db"
	"central_reserve/shared/log"
	"dbpostgres/app/infra/models"

	"gorm.io/gorm"
)

type SessionRepository struct {
	db     db.IDatabase
	logger log.ILogger
}

func New(db db.IDatabase, logger log.ILogger) domain.SessionRepository {
	return &SessionRepository{
		db:     db,
		logger: logger,
	}
}

func (r *SessionRepository) Create(ctx context.Context, session *domain.TrainingSession) (*domain.TrainingSession, error) {
	model := &models.TrainingSession{
		BusinessID:            session.BusinessID,
		TrainingSessionTypeID: session.TrainingSessionTypeID,
		CoachID:               session.CoachID,
		TrainingGroupID:       session.TrainingGroupID,
		SessionMode:           session.SessionMode,
		ScheduledDate:         session.ScheduledDate,
		StartTime:             session.StartTime,
		EndTime:               session.EndTime,
		Duration:              session.Duration,
		Location:              session.Location,
		Field:                 session.Field,
		MaxParticipants:       session.MaxParticipants,
		CurrentParticipants:   0,
		Price:                 session.Price,
		Status:                "scheduled",
		IsRecurring:           session.IsRecurring,
		CoachNotes:            session.CoachNotes,
		PublicNotes:           session.PublicNotes,
	}

	if err := r.db.Conn(ctx).Create(model).Error; err != nil {
		return nil, fmt.Errorf("error creando sesión: %w", err)
	}

	// Reload with relations
	if err := r.db.Conn(ctx).
		Preload("TrainingSessionType").
		Preload("Coach").
		Preload("TrainingGroup").
		First(model, model.ID).Error; err != nil {
		return nil, fmt.Errorf("error cargando relaciones: %w", err)
	}

	return mappers.SessionToDomain(model), nil
}

func (r *SessionRepository) GetByID(ctx context.Context, id uint, businessID uint) (*domain.TrainingSession, error) {
	var model models.TrainingSession
	query := r.db.Conn(ctx).
		Preload("TrainingSessionType").
		Preload("Coach").
		Preload("TrainingGroup")

	if businessID != 0 {
		query = query.Where("business_id = ?", businessID)
	}

	if err := query.First(&model, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, domain.ErrSessionNotFound
		}
		return nil, fmt.Errorf("error obteniendo sesión: %w", err)
	}

	return mappers.SessionToDomain(&model), nil
}

func (r *SessionRepository) Update(ctx context.Context, session *domain.TrainingSession) (*domain.TrainingSession, error) {
	// Verify existence
	var existing models.TrainingSession
	query := r.db.Conn(ctx).Where("business_id = ?", session.BusinessID)
	if err := query.First(&existing, session.ID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, domain.ErrSessionNotFound
		}
		return nil, fmt.Errorf("error buscando sesión: %w", err)
	}

	updates := map[string]interface{}{
		"training_session_type_id": session.TrainingSessionTypeID,
		"coach_id":                 session.CoachID,
		"training_group_id":        session.TrainingGroupID,
		"session_mode":             session.SessionMode,
		"scheduled_date":           session.ScheduledDate,
		"start_time":               session.StartTime,
		"end_time":                 session.EndTime,
		"duration":                 session.Duration,
		"location":                 session.Location,
		"field":                    session.Field,
		"max_participants":         session.MaxParticipants,
		"price":                    session.Price,
		"is_recurring":             session.IsRecurring,
		"coach_notes":              session.CoachNotes,
		"public_notes":             session.PublicNotes,
	}

	if err := r.db.Conn(ctx).Model(&models.TrainingSession{}).Where("id = ?", session.ID).Updates(updates).Error; err != nil {
		return nil, fmt.Errorf("error actualizando sesión: %w", err)
	}

	return r.GetByID(ctx, session.ID, session.BusinessID)
}

func (r *SessionRepository) Cancel(ctx context.Context, dto domain.CancelSessionDTO) (*domain.TrainingSession, error) {
	// Verify existence and check if already cancelled
	var existing models.TrainingSession
	query := r.db.Conn(ctx).Where("business_id = ?", dto.BusinessID)
	if err := query.First(&existing, dto.ID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, domain.ErrSessionNotFound
		}
		return nil, fmt.Errorf("error buscando sesión: %w", err)
	}

	if existing.Status == "cancelled" {
		return nil, domain.ErrSessionAlreadyCancelled
	}

	updates := map[string]interface{}{
		"status":              "cancelled",
		"cancellation_reason": dto.Reason,
	}

	if err := r.db.Conn(ctx).Model(&models.TrainingSession{}).Where("id = ?", dto.ID).Updates(updates).Error; err != nil {
		return nil, fmt.Errorf("error cancelando sesión: %w", err)
	}

	return r.GetByID(ctx, dto.ID, dto.BusinessID)
}

func (r *SessionRepository) List(ctx context.Context, filters domain.SessionFiltersDTO) (*domain.PaginatedSessionsDTO, error) {
	var total int64
	countQuery := r.db.Conn(ctx).Model(&models.TrainingSession{})

	// Apply filters for count
	if filters.BusinessID != 0 {
		countQuery = countQuery.Where("business_id = ?", filters.BusinessID)
	}
	if filters.CoachID != nil {
		countQuery = countQuery.Where("coach_id = ?", *filters.CoachID)
	}
	if filters.TrainingGroupID != nil {
		countQuery = countQuery.Where("training_group_id = ?", *filters.TrainingGroupID)
	}
	if filters.SessionTypeID != nil {
		countQuery = countQuery.Where("training_session_type_id = ?", *filters.SessionTypeID)
	}
	if filters.Status != "" {
		countQuery = countQuery.Where("status = ?", filters.Status)
	}
	if filters.StartDate != nil {
		countQuery = countQuery.Where("scheduled_date >= ?", *filters.StartDate)
	}
	if filters.EndDate != nil {
		countQuery = countQuery.Where("scheduled_date <= ?", *filters.EndDate)
	}

	if err := countQuery.Count(&total).Error; err != nil {
		return nil, fmt.Errorf("error contando sesiones: %w", err)
	}

	var sessions []models.TrainingSession
	query := r.db.Conn(ctx).
		Preload("TrainingSessionType").
		Preload("Coach").
		Preload("TrainingGroup")

	// Apply same filters for query
	if filters.BusinessID != 0 {
		query = query.Where("business_id = ?", filters.BusinessID)
	}
	if filters.CoachID != nil {
		query = query.Where("coach_id = ?", *filters.CoachID)
	}
	if filters.TrainingGroupID != nil {
		query = query.Where("training_group_id = ?", *filters.TrainingGroupID)
	}
	if filters.SessionTypeID != nil {
		query = query.Where("training_session_type_id = ?", *filters.SessionTypeID)
	}
	if filters.Status != "" {
		query = query.Where("status = ?", filters.Status)
	}
	if filters.StartDate != nil {
		query = query.Where("scheduled_date >= ?", *filters.StartDate)
	}
	if filters.EndDate != nil {
		query = query.Where("scheduled_date <= ?", *filters.EndDate)
	}

	offset := (filters.Page - 1) * filters.PageSize
	if err := query.Order("scheduled_date DESC, start_time DESC").Offset(offset).Limit(filters.PageSize).Find(&sessions).Error; err != nil {
		return nil, fmt.Errorf("error listando sesiones: %w", err)
	}

	result := make([]domain.SessionListDTO, len(sessions))
	for i, s := range sessions {
		var sessionTypeName, sessionTypeCode string
		if s.TrainingSessionType.ID != 0 {
			sessionTypeName = s.TrainingSessionType.Name
			sessionTypeCode = s.TrainingSessionType.Code
		}

		var coachName string
		if s.Coach.ID != 0 {
			coachName = s.Coach.FirstName + " " + s.Coach.LastName
		}

		var groupName string
		if s.TrainingGroup != nil {
			groupName = s.TrainingGroup.Name
		}

		result[i] = domain.SessionListDTO{
			ID:                  s.ID,
			SessionTypeName:     sessionTypeName,
			SessionTypeCode:     sessionTypeCode,
			CoachName:           coachName,
			GroupName:           groupName,
			SessionMode:         s.SessionMode,
			ScheduledDate:       s.ScheduledDate,
			StartTime:           s.StartTime,
			EndTime:             s.EndTime,
			Duration:            s.Duration,
			Location:            s.Location,
			Field:               s.Field,
			MaxParticipants:     s.MaxParticipants,
			CurrentParticipants: s.CurrentParticipants,
			Price:               s.Price,
			Status:              s.Status,
			IsRecurring:         s.IsRecurring,
			CreatedAt:           s.CreatedAt,
		}
	}

	return &domain.PaginatedSessionsDTO{
		Sessions:   result,
		Total:      total,
		Page:       filters.Page,
		PageSize:   filters.PageSize,
		TotalPages: int(math.Ceil(float64(total) / float64(filters.PageSize))),
	}, nil
}
