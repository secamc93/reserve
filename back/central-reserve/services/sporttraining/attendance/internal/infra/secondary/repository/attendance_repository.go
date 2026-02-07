package repository

import (
	"context"
	"fmt"
	"math"

	"central_reserve/services/sporttraining/attendance/internal/domain"
	"central_reserve/services/sporttraining/attendance/internal/infra/secondary/repository/mappers"
	"central_reserve/shared/db"
	"central_reserve/shared/log"
	"dbpostgres/app/infra/models"

	"gorm.io/gorm"
)

type AttendanceRepository struct {
	db     db.IDatabase
	logger log.ILogger
}

func New(db db.IDatabase, logger log.ILogger) domain.AttendanceRepository {
	return &AttendanceRepository{
		db:     db,
		logger: logger,
	}
}

func (r *AttendanceRepository) Create(ctx context.Context, record *domain.AttendanceRecord) (*domain.AttendanceRecord, error) {
	// Verificar si ya existe un registro para este jugador en esta sesión
	var existing models.STAttendanceRecord
	err := r.db.Conn(ctx).
		Where("training_session_id = ? AND player_id = ?", record.TrainingSessionID, record.PlayerID).
		First(&existing).Error

	if err == nil {
		// Ya existe un registro
		return nil, domain.ErrAttendanceAlreadyRecorded
	}

	if err != gorm.ErrRecordNotFound {
		return nil, fmt.Errorf("error verificando asistencia existente: %w", err)
	}

	model := &models.STAttendanceRecord{
		TrainingSessionID:  record.TrainingSessionID,
		PlayerID:           record.PlayerID,
		AttendanceStatusID: record.AttendanceStatusID,
		CheckInTime:        record.CheckInTime,
		CheckOutTime:       record.CheckOutTime,
		RecordedByCoachID:  record.RecordedByCoachID,
		RecordedAt:         record.RecordedAt,
		PerformanceRating:  record.PerformanceRating,
		CoachFeedback:      record.CoachFeedback,
		PlayerNotes:        record.PlayerNotes,
	}

	if err := r.db.Conn(ctx).Create(model).Error; err != nil {
		return nil, fmt.Errorf("error creando registro de asistencia: %w", err)
	}

	// Reload with relations
	if err := r.db.Conn(ctx).
		Preload("TrainingSession").
		Preload("Player").
		Preload("AttendanceStatus").
		Preload("RecordedByCoach").
		First(model, model.ID).Error; err != nil {
		return nil, fmt.Errorf("error cargando relaciones: %w", err)
	}

	return mappers.AttendanceToDomain(model), nil
}

func (r *AttendanceRepository) ListBySession(ctx context.Context, filters domain.AttendanceFiltersDTO) (*domain.PaginatedAttendanceDTO, error) {
	var total int64
	countQuery := r.db.Conn(ctx).Model(&models.STAttendanceRecord{})

	// Join con TrainingSession para filtrar por BusinessID
	countQuery = countQuery.
		Joins("JOIN sport_training.training_sessions ON st_attendance_records.training_session_id = training_sessions.id").
		Where("training_sessions.business_id = ?", filters.BusinessID)

	if filters.TrainingSessionID != nil {
		countQuery = countQuery.Where("st_attendance_records.training_session_id = ?", *filters.TrainingSessionID)
	}

	if err := countQuery.Count(&total).Error; err != nil {
		return nil, fmt.Errorf("error contando registros de asistencia: %w", err)
	}

	var records []models.STAttendanceRecord
	query := r.db.Conn(ctx).
		Preload("TrainingSession").
		Preload("Player").
		Preload("AttendanceStatus").
		Preload("RecordedByCoach")

	query = query.
		Joins("JOIN sport_training.training_sessions ON st_attendance_records.training_session_id = training_sessions.id").
		Where("training_sessions.business_id = ?", filters.BusinessID)

	if filters.TrainingSessionID != nil {
		query = query.Where("st_attendance_records.training_session_id = ?", *filters.TrainingSessionID)
	}

	offset := (filters.Page - 1) * filters.PageSize
	if err := query.Order("st_attendance_records.recorded_at DESC").Offset(offset).Limit(filters.PageSize).Find(&records).Error; err != nil {
		return nil, fmt.Errorf("error listando registros de asistencia: %w", err)
	}

	result := make([]domain.AttendanceListDTO, len(records))
	for i, rec := range records {
		result[i] = domain.AttendanceListDTO{
			ID:                rec.ID,
			TrainingSessionID: rec.TrainingSessionID,
			PlayerID:          rec.PlayerID,
			AttendanceStatusID: rec.AttendanceStatusID,
			CheckInTime:       rec.CheckInTime,
			CheckOutTime:      rec.CheckOutTime,
			PerformanceRating: rec.PerformanceRating,
			RecordedByCoachID: rec.RecordedByCoachID,
			RecordedAt:        rec.RecordedAt,
			CreatedAt:         rec.CreatedAt,
		}

		if rec.TrainingSession.ScheduledDate.IsZero() == false {
			result[i].SessionDate = rec.TrainingSession.ScheduledDate
			result[i].SessionLocation = rec.TrainingSession.Location
		}

		if rec.Player.ID != 0 {
			result[i].PlayerName = rec.Player.FirstName + " " + rec.Player.LastName
		}

		if rec.AttendanceStatus.ID != 0 {
			result[i].StatusName = rec.AttendanceStatus.Name
			result[i].StatusCode = rec.AttendanceStatus.Code
			result[i].StatusColor = rec.AttendanceStatus.Color
		}

		if rec.RecordedByCoach.ID != 0 {
			result[i].RecordedByCoachName = rec.RecordedByCoach.FirstName + " " + rec.RecordedByCoach.LastName
		}
	}

	return &domain.PaginatedAttendanceDTO{
		Records:    result,
		Total:      total,
		Page:       filters.Page,
		PageSize:   filters.PageSize,
		TotalPages: int(math.Ceil(float64(total) / float64(filters.PageSize))),
	}, nil
}

func (r *AttendanceRepository) ListByPlayer(ctx context.Context, filters domain.AttendanceFiltersDTO) (*domain.PaginatedAttendanceDTO, error) {
	var total int64
	countQuery := r.db.Conn(ctx).Model(&models.STAttendanceRecord{})

	// Join con TrainingSession para filtrar por BusinessID
	countQuery = countQuery.
		Joins("JOIN sport_training.training_sessions ON st_attendance_records.training_session_id = training_sessions.id").
		Where("training_sessions.business_id = ?", filters.BusinessID)

	if filters.PlayerID != nil {
		countQuery = countQuery.Where("st_attendance_records.player_id = ?", *filters.PlayerID)
	}

	if err := countQuery.Count(&total).Error; err != nil {
		return nil, fmt.Errorf("error contando registros de asistencia: %w", err)
	}

	var records []models.STAttendanceRecord
	query := r.db.Conn(ctx).
		Preload("TrainingSession").
		Preload("Player").
		Preload("AttendanceStatus").
		Preload("RecordedByCoach")

	query = query.
		Joins("JOIN sport_training.training_sessions ON st_attendance_records.training_session_id = training_sessions.id").
		Where("training_sessions.business_id = ?", filters.BusinessID)

	if filters.PlayerID != nil {
		query = query.Where("st_attendance_records.player_id = ?", *filters.PlayerID)
	}

	offset := (filters.Page - 1) * filters.PageSize
	if err := query.Order("st_attendance_records.recorded_at DESC").Offset(offset).Limit(filters.PageSize).Find(&records).Error; err != nil {
		return nil, fmt.Errorf("error listando registros de asistencia: %w", err)
	}

	result := make([]domain.AttendanceListDTO, len(records))
	for i, rec := range records {
		result[i] = domain.AttendanceListDTO{
			ID:                rec.ID,
			TrainingSessionID: rec.TrainingSessionID,
			PlayerID:          rec.PlayerID,
			AttendanceStatusID: rec.AttendanceStatusID,
			CheckInTime:       rec.CheckInTime,
			CheckOutTime:      rec.CheckOutTime,
			PerformanceRating: rec.PerformanceRating,
			RecordedByCoachID: rec.RecordedByCoachID,
			RecordedAt:        rec.RecordedAt,
			CreatedAt:         rec.CreatedAt,
		}

		if rec.TrainingSession.ScheduledDate.IsZero() == false {
			result[i].SessionDate = rec.TrainingSession.ScheduledDate
			result[i].SessionLocation = rec.TrainingSession.Location
		}

		if rec.Player.ID != 0 {
			result[i].PlayerName = rec.Player.FirstName + " " + rec.Player.LastName
		}

		if rec.AttendanceStatus.ID != 0 {
			result[i].StatusName = rec.AttendanceStatus.Name
			result[i].StatusCode = rec.AttendanceStatus.Code
			result[i].StatusColor = rec.AttendanceStatus.Color
		}

		if rec.RecordedByCoach.ID != 0 {
			result[i].RecordedByCoachName = rec.RecordedByCoach.FirstName + " " + rec.RecordedByCoach.LastName
		}
	}

	return &domain.PaginatedAttendanceDTO{
		Records:    result,
		Total:      total,
		Page:       filters.Page,
		PageSize:   filters.PageSize,
		TotalPages: int(math.Ceil(float64(total) / float64(filters.PageSize))),
	}, nil
}
