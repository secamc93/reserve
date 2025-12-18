package repository

import (
	"context"
	"fmt"

	"central_reserve/services/horizontalproperty/visit/internal/domain"
	"central_reserve/shared/db"
	"central_reserve/shared/log"
	"dbpostgres/app/infra/models"
)

type VisitCompanionRepository struct {
	db     db.IDatabase
	logger log.ILogger
}

func NewVisitCompanionRepository(db db.IDatabase, logger log.ILogger) domain.VisitCompanionRepository {
	return &VisitCompanionRepository{
		db:     db,
		logger: logger,
	}
}

// CreateCompanion crea un nuevo acompañante
func (r *VisitCompanionRepository) CreateCompanion(ctx context.Context, companion *domain.VisitCompanion) (*domain.VisitCompanion, error) {
	model := &models.VisitCompanion{
		VisitID:        companion.VisitID,
		VisitorID:      companion.VisitorID,
		CompanionName:  companion.CompanionName,
		CompanionDNI:   companion.CompanionDNI,
		CompanionPhone: companion.CompanionPhone,
		IsMinor:        companion.IsMinor,
		Relationship:   companion.Relationship,
		Notes:          companion.Notes,
	}

	if err := r.db.Conn(ctx).Create(model).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error creando acompañante")
		return nil, fmt.Errorf("error creando acompañante: %w", err)
	}

	return mapCompanionToDomain(model), nil
}

// GetCompanionsByVisitID obtiene todos los acompañantes de una visita
func (r *VisitCompanionRepository) GetCompanionsByVisitID(ctx context.Context, visitID uint) ([]*domain.VisitCompanion, error) {
	var companions []models.VisitCompanion
	if err := r.db.Conn(ctx).Where("visit_id = ?", visitID).Find(&companions).Error; err != nil {
		return nil, fmt.Errorf("error obteniendo acompañantes: %w", err)
	}

	result := make([]*domain.VisitCompanion, len(companions))
	for i, c := range companions {
		result[i] = mapCompanionToDomain(&c)
	}

	return result, nil
}

// UpdateCompanion actualiza un acompañante
func (r *VisitCompanionRepository) UpdateCompanion(ctx context.Context, companion *domain.VisitCompanion) error {
	updates := map[string]interface{}{
		"companion_name":  companion.CompanionName,
		"companion_dni":   companion.CompanionDNI,
		"companion_phone": companion.CompanionPhone,
		"is_minor":        companion.IsMinor,
		"relationship":    companion.Relationship,
		"notes":           companion.Notes,
	}

	if companion.VisitorID != nil {
		updates["visitor_id"] = companion.VisitorID
	}

	if err := r.db.Conn(ctx).Model(&models.VisitCompanion{}).Where("id = ?", companion.ID).Updates(updates).Error; err != nil {
		return fmt.Errorf("error actualizando acompañante: %w", err)
	}

	return nil
}

// DeleteCompanion elimina un acompañante
func (r *VisitCompanionRepository) DeleteCompanion(ctx context.Context, id uint) error {
	if err := r.db.Conn(ctx).Delete(&models.VisitCompanion{}, id).Error; err != nil {
		return fmt.Errorf("error eliminando acompañante: %w", err)
	}
	return nil
}

// mapCompanionToDomain mapea modelo a entidad de dominio
func mapCompanionToDomain(m *models.VisitCompanion) *domain.VisitCompanion {
	return &domain.VisitCompanion{
		ID:             m.ID,
		VisitID:        m.VisitID,
		VisitorID:      m.VisitorID,
		CompanionName:  m.CompanionName,
		CompanionDNI:   m.CompanionDNI,
		CompanionPhone: m.CompanionPhone,
		IsMinor:        m.IsMinor,
		Relationship:   m.Relationship,
		Notes:          m.Notes,
		CreatedAt:      m.CreatedAt,
		UpdatedAt:      m.UpdatedAt,
	}
}
