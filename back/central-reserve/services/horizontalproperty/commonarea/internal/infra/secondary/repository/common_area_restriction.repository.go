package repository

import (
	"context"
	"fmt"
	"time"

	"central_reserve/services/horizontalproperty/commonarea/internal/domain"
	"central_reserve/shared/db"
	"central_reserve/shared/log"
	"dbpostgres/app/infra/models"
)

type CommonAreaRestrictionRepository struct {
	db     db.IDatabase
	logger log.ILogger
}

func NewCommonAreaRestrictionRepository(db db.IDatabase, logger log.ILogger) domain.CommonAreaRestrictionRepository {
	return &CommonAreaRestrictionRepository{
		db:     db,
		logger: logger,
	}
}

// CreateRestriction crea una nueva restricción
func (r *CommonAreaRestrictionRepository) CreateRestriction(ctx context.Context, restriction *domain.CommonAreaRestriction) (*domain.CommonAreaRestriction, error) {
	model := &models.CommonAreaRestriction{
		CommonAreaID:    restriction.CommonAreaID,
		RestrictionType: restriction.RestrictionType,
		StartDate:       restriction.StartDate,
		EndDate:         restriction.EndDate,
		StartTime:       restriction.StartTime,
		EndTime:         restriction.EndTime,
		Reason:          restriction.Reason,
		CreatedByUserID: restriction.CreatedByUserID,
		IsActive:        restriction.IsActive,
	}

	if err := r.db.Conn(ctx).Create(model).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error creando restricción")
		return nil, fmt.Errorf("error creando restricción: %w", err)
	}

	return mapRestrictionToDomain(model), nil
}

// GetActiveRestrictions obtiene restricciones activas que afectan un horario específico
func (r *CommonAreaRestrictionRepository) GetActiveRestrictions(ctx context.Context, commonAreaID uint, date time.Time, startTime, endTime string) ([]*domain.CommonAreaRestriction, error) {
	var restrictions []models.CommonAreaRestriction

	query := r.db.Conn(ctx).
		Where("common_area_id = ? AND is_active = ?", commonAreaID, true).
		Where("start_date <= ? AND end_date >= ?", date, date)

	// Si hay horas específicas, verificar solapamiento
	if startTime != "" && endTime != "" {
		query = query.Where("(start_time IS NULL OR start_time <= ?) AND (end_time IS NULL OR end_time >= ?)", endTime, startTime)
	}

	if err := query.Find(&restrictions).Error; err != nil {
		return nil, fmt.Errorf("error obteniendo restricciones: %w", err)
	}

	result := make([]*domain.CommonAreaRestriction, len(restrictions))
	for i, res := range restrictions {
		result[i] = mapRestrictionToDomain(&res)
	}

	return result, nil
}

// DeleteRestriction elimina una restricción
func (r *CommonAreaRestrictionRepository) DeleteRestriction(ctx context.Context, id uint) error {
	if err := r.db.Conn(ctx).Delete(&models.CommonAreaRestriction{}, id).Error; err != nil {
		return fmt.Errorf("error eliminando restricción: %w", err)
	}
	return nil
}

// mapRestrictionToDomain mapea modelo a entidad de dominio
func mapRestrictionToDomain(m *models.CommonAreaRestriction) *domain.CommonAreaRestriction {
	return &domain.CommonAreaRestriction{
		ID:              m.ID,
		CommonAreaID:    m.CommonAreaID,
		RestrictionType: m.RestrictionType,
		StartDate:       m.StartDate,
		EndDate:         m.EndDate,
		StartTime:       m.StartTime,
		EndTime:         m.EndTime,
		Reason:          m.Reason,
		CreatedByUserID: m.CreatedByUserID,
		IsActive:        m.IsActive,
		CreatedAt:       m.CreatedAt,
		UpdatedAt:       m.UpdatedAt,
	}
}
