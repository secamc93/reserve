package repository

import (
	"context"
	"fmt"
	"time"

	"central_reserve/services/horizontalproperty/visit/internal/domain"
	"central_reserve/shared/db"
	"central_reserve/shared/log"
	"dbpostgres/app/infra/models"

	"gorm.io/gorm"
	"central_reserve/services/horizontalproperty/visit/internal/infra/secondary/repository/mappers"
)

type VisitBlacklistRepository struct {
	db     db.IDatabase
	logger log.ILogger
}

func NewVisitBlacklistRepository(db db.IDatabase, logger log.ILogger) domain.VisitBlacklistRepository {
	return &VisitBlacklistRepository{
		db:     db,
		logger: logger,
	}
}

// CreateBlacklistEntry crea una nueva entrada en la lista negra
func (r *VisitBlacklistRepository) CreateBlacklistEntry(ctx context.Context, entry *domain.VisitBlacklist) (*domain.VisitBlacklist, error) {
	model := &models.VisitBlacklist{
		BusinessID:      entry.BusinessID,
		VisitorID:       entry.VisitorID,
		Reason:          entry.Reason,
		BlockedByUserID: entry.BlockedByUserID,
		BlockedAt:       entry.BlockedAt,
		IsActive:        entry.IsActive,
		Notes:           entry.Notes,
	}

	if err := r.db.Conn(ctx).Create(model).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error creando entrada en lista negra")
		return nil, fmt.Errorf("error creando entrada en lista negra: %w", err)
	}

	// Actualizar flag has_blacklist en Visitor
	if err := r.db.Conn(ctx).Model(&models.Visitor{}).
		Where("id = ?", entry.VisitorID).
		Update("has_blacklist", true).Error; err != nil {
		r.logger.Warn().Err(err).Uint("visitor_id", entry.VisitorID).Msg("Error actualizando flag has_blacklist")
	}

	return mappers.BlacklistToDomain(model), nil
}

// GetBlacklistEntry obtiene una entrada de lista negra
func (r *VisitBlacklistRepository) GetBlacklistEntry(ctx context.Context, businessID uint, visitorID uint) (*domain.VisitBlacklist, error) {
	var entry models.VisitBlacklist
	if err := r.db.Conn(ctx).
		Where("business_id = ? AND visitor_id = ? AND is_active = ?", businessID, visitorID, true).
		First(&entry).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil // No está en lista negra
		}
		return nil, fmt.Errorf("error obteniendo entrada de lista negra: %w", err)
	}

	return mappers.BlacklistToDomain(&entry), nil
}

// IsVisitorBlacklisted verifica si un visitante está en lista negra
func (r *VisitBlacklistRepository) IsVisitorBlacklisted(ctx context.Context, businessID uint, visitorID uint) (bool, error) {
	var count int64
	if err := r.db.Conn(ctx).Model(&models.VisitBlacklist{}).
		Where("business_id = ? AND visitor_id = ? AND is_active = ?", businessID, visitorID, true).
		Count(&count).Error; err != nil {
		return false, fmt.Errorf("error verificando lista negra: %w", err)
	}

	return count > 0, nil
}

// UnblockVisitor desbloquea un visitante
func (r *VisitBlacklistRepository) UnblockVisitor(ctx context.Context, businessID uint, visitorID uint, unblockedByUserID uint, reason string) error {
	updates := map[string]interface{}{
		"is_active":            false,
		"unblocked_at":         time.Now(),
		"unblocked_by_user_id": unblockedByUserID,
		"unblock_reason":       reason,
	}

	if err := r.db.Conn(ctx).Model(&models.VisitBlacklist{}).
		Where("business_id = ? AND visitor_id = ? AND is_active = ?", businessID, visitorID, true).
		Updates(updates).Error; err != nil {
		return fmt.Errorf("error desbloqueando visitante: %w", err)
	}

	// Verificar si hay otras entradas activas para este visitante
	var activeCount int64
	if err := r.db.Conn(ctx).Model(&models.VisitBlacklist{}).
		Where("visitor_id = ? AND is_active = ?", visitorID, true).
		Count(&activeCount).Error; err != nil {
		r.logger.Warn().Err(err).Uint("visitor_id", visitorID).Msg("Error verificando otras entradas activas")
	}

	// Si no hay más entradas activas, actualizar flag has_blacklist
	if activeCount == 0 {
		if err := r.db.Conn(ctx).Model(&models.Visitor{}).
			Where("id = ?", visitorID).
			Update("has_blacklist", false).Error; err != nil {
			r.logger.Warn().Err(err).Uint("visitor_id", visitorID).Msg("Error actualizando flag has_blacklist")
		}
	}

	return nil
}

// ListBlacklist lista todas las entradas activas de lista negra para un negocio
func (r *VisitBlacklistRepository) ListBlacklist(ctx context.Context, businessID uint) ([]*domain.VisitBlacklist, error) {
	var entries []models.VisitBlacklist
	if err := r.db.Conn(ctx).
		Preload("Visitor").
		Where("business_id = ? AND is_active = ?", businessID, true).
		Order("blocked_at DESC").
		Find(&entries).Error; err != nil {
		return nil, fmt.Errorf("error listando lista negra: %w", err)
	}

	result := make([]*domain.VisitBlacklist, len(entries))
	for i, e := range entries {
		result[i] = mappers.BlacklistToDomain(&e)
	}

	return result, nil
}

// mapBlacklistToDomain mapea modelo a entidad de dominio
