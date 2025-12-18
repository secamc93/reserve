package repository

import (
	"context"
	"fmt"

	"central_reserve/services/horizontalproperty/commonarea/internal/domain"
	"central_reserve/shared/db"
	"central_reserve/shared/log"
	"dbpostgres/app/infra/models"

	"gorm.io/gorm"
)

type CommonAreaScheduleRepository struct {
	db     db.IDatabase
	logger log.ILogger
}

func NewCommonAreaScheduleRepository(db db.IDatabase, logger log.ILogger) domain.CommonAreaScheduleRepository {
	return &CommonAreaScheduleRepository{
		db:     db,
		logger: logger,
	}
}

// CreateSchedule crea un nuevo horario
func (r *CommonAreaScheduleRepository) CreateSchedule(ctx context.Context, schedule *domain.CommonAreaSchedule) (*domain.CommonAreaSchedule, error) {
	model := &models.CommonAreaSchedule{
		CommonAreaID: schedule.CommonAreaID,
		DayOfWeek:    schedule.DayOfWeek,
		StartTime:    schedule.StartTime,
		EndTime:      schedule.EndTime,
		IsActive:     schedule.IsActive,
	}

	if err := r.db.Conn(ctx).Create(model).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error creando horario")
		return nil, fmt.Errorf("error creando horario: %w", err)
	}

	return mapScheduleToDomain(model), nil
}

// GetSchedulesByCommonAreaID obtiene todos los horarios de una zona común
func (r *CommonAreaScheduleRepository) GetSchedulesByCommonAreaID(ctx context.Context, commonAreaID uint) ([]*domain.CommonAreaSchedule, error) {
	var schedules []models.CommonAreaSchedule
	if err := r.db.Conn(ctx).
		Where("common_area_id = ? AND is_active = ?", commonAreaID, true).
		Order("day_of_week ASC").
		Find(&schedules).Error; err != nil {
		return nil, fmt.Errorf("error obteniendo horarios: %w", err)
	}

	result := make([]*domain.CommonAreaSchedule, len(schedules))
	for i, s := range schedules {
		result[i] = mapScheduleToDomain(&s)
	}

	return result, nil
}

// GetScheduleForDay obtiene el horario para un día específico
func (r *CommonAreaScheduleRepository) GetScheduleForDay(ctx context.Context, commonAreaID uint, dayOfWeek int) (*domain.CommonAreaSchedule, error) {
	var schedule models.CommonAreaSchedule
	if err := r.db.Conn(ctx).
		Where("common_area_id = ? AND day_of_week = ? AND is_active = ?", commonAreaID, dayOfWeek, true).
		First(&schedule).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil // No hay horario configurado para este día
		}
		return nil, fmt.Errorf("error obteniendo horario: %w", err)
	}

	return mapScheduleToDomain(&schedule), nil
}

// UpdateSchedule actualiza un horario
func (r *CommonAreaScheduleRepository) UpdateSchedule(ctx context.Context, schedule *domain.CommonAreaSchedule) error {
	updates := map[string]interface{}{
		"start_time": schedule.StartTime,
		"end_time":   schedule.EndTime,
		"is_active":  schedule.IsActive,
	}

	if err := r.db.Conn(ctx).Model(&models.CommonAreaSchedule{}).Where("id = ?", schedule.ID).Updates(updates).Error; err != nil {
		return fmt.Errorf("error actualizando horario: %w", err)
	}

	return nil
}

// DeleteSchedule elimina un horario
func (r *CommonAreaScheduleRepository) DeleteSchedule(ctx context.Context, id uint) error {
	if err := r.db.Conn(ctx).Delete(&models.CommonAreaSchedule{}, id).Error; err != nil {
		return fmt.Errorf("error eliminando horario: %w", err)
	}
	return nil
}

// mapScheduleToDomain mapea modelo a entidad de dominio
func mapScheduleToDomain(m *models.CommonAreaSchedule) *domain.CommonAreaSchedule {
	return &domain.CommonAreaSchedule{
		ID:           m.ID,
		CommonAreaID: m.CommonAreaID,
		DayOfWeek:    m.DayOfWeek,
		StartTime:    m.StartTime,
		EndTime:      m.EndTime,
		IsActive:     m.IsActive,
		CreatedAt:    m.CreatedAt,
		UpdatedAt:    m.UpdatedAt,
	}
}
