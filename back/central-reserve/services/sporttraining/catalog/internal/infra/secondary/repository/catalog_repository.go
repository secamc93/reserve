package repository

import (
	"context"
	"fmt"

	"central_reserve/services/sporttraining/catalog/internal/domain"
	"central_reserve/shared/db"
	"central_reserve/shared/log"
	"dbpostgres/app/infra/models"
)

type CatalogRepository struct {
	db     db.IDatabase
	logger log.ILogger
}

func New(db db.IDatabase, logger log.ILogger) domain.CatalogRepository {
	return &CatalogRepository{
		db:     db,
		logger: logger,
	}
}

func (r *CatalogRepository) GetSkillLevels(ctx context.Context) ([]domain.PlayerSkillLevel, error) {
	var items []models.PlayerSkillLevel
	if err := r.db.Conn(ctx).Where("is_active = ?", true).Order("level ASC").Find(&items).Error; err != nil {
		return nil, fmt.Errorf("error obteniendo niveles de habilidad: %w", err)
	}

	result := make([]domain.PlayerSkillLevel, len(items))
	for i, item := range items {
		result[i] = domain.PlayerSkillLevel{
			ID:          item.ID,
			Name:        item.Name,
			Code:        item.Code,
			Description: item.Description,
			Level:       item.Level,
			Color:       item.Color,
			IsActive:    item.IsActive,
		}
	}
	return result, nil
}

func (r *CatalogRepository) GetCoachSpecialties(ctx context.Context) ([]domain.CoachSpecialty, error) {
	var items []models.CoachSpecialty
	if err := r.db.Conn(ctx).Where("is_active = ?", true).Order("name ASC").Find(&items).Error; err != nil {
		return nil, fmt.Errorf("error obteniendo especialidades: %w", err)
	}

	result := make([]domain.CoachSpecialty, len(items))
	for i, item := range items {
		result[i] = domain.CoachSpecialty{
			ID:          item.ID,
			Name:        item.Name,
			Code:        item.Code,
			Description: item.Description,
			Icon:        item.Icon,
			IsActive:    item.IsActive,
		}
	}
	return result, nil
}

func (r *CatalogRepository) GetSessionTypes(ctx context.Context) ([]domain.TrainingSessionType, error) {
	var items []models.TrainingSessionType
	if err := r.db.Conn(ctx).Where("is_active = ?", true).Order("name ASC").Find(&items).Error; err != nil {
		return nil, fmt.Errorf("error obteniendo tipos de sesión: %w", err)
	}

	result := make([]domain.TrainingSessionType, len(items))
	for i, item := range items {
		result[i] = domain.TrainingSessionType{
			ID:               item.ID,
			Name:             item.Name,
			Code:             item.Code,
			Description:      item.Description,
			DefaultDuration:  item.DefaultDuration,
			DefaultPrice:     item.DefaultPrice,
			AllowsIndividual: item.AllowsIndividual,
			AllowsGroup:      item.AllowsGroup,
			Icon:             item.Icon,
			Color:            item.Color,
			IsActive:         item.IsActive,
		}
	}
	return result, nil
}

func (r *CatalogRepository) GetBookingStatuses(ctx context.Context) ([]domain.BookingStatus, error) {
	var items []models.STBookingStatus
	if err := r.db.Conn(ctx).Where("is_active = ?", true).Order("id ASC").Find(&items).Error; err != nil {
		return nil, fmt.Errorf("error obteniendo estados de reserva: %w", err)
	}

	result := make([]domain.BookingStatus, len(items))
	for i, item := range items {
		result[i] = domain.BookingStatus{
			ID:          item.ID,
			Name:        item.Name,
			Code:        item.Code,
			Description: item.Description,
			Color:       item.Color,
			Icon:        item.Icon,
			IsFinal:     item.IsFinal,
			IsActive:    item.IsActive,
		}
	}
	return result, nil
}

func (r *CatalogRepository) GetAttendanceStatuses(ctx context.Context) ([]domain.AttendanceStatus, error) {
	var items []models.STAttendanceStatus
	if err := r.db.Conn(ctx).Where("is_active = ?", true).Order("id ASC").Find(&items).Error; err != nil {
		return nil, fmt.Errorf("error obteniendo estados de asistencia: %w", err)
	}

	result := make([]domain.AttendanceStatus, len(items))
	for i, item := range items {
		result[i] = domain.AttendanceStatus{
			ID:          item.ID,
			Name:        item.Name,
			Code:        item.Code,
			Description: item.Description,
			Color:       item.Color,
			Icon:        item.Icon,
			IsActive:    item.IsActive,
		}
	}
	return result, nil
}
