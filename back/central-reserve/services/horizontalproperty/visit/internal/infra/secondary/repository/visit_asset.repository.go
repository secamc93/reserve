package repository

import (
	"context"
	"fmt"

	"central_reserve/services/horizontalproperty/visit/internal/domain"
	"central_reserve/services/horizontalproperty/visit/internal/infra/secondary/repository/mappers"
	"central_reserve/shared/db"
	"central_reserve/shared/log"
	"dbpostgres/app/infra/models"
)

type VisitAssetRepository struct {
	db     db.IDatabase
	logger log.ILogger
}

func NewVisitAssetRepository(db db.IDatabase, logger log.ILogger) domain.VisitAssetRepository {
	return &VisitAssetRepository{
		db:     db,
		logger: logger,
	}
}

// CreateAsset crea un nuevo activo
func (r *VisitAssetRepository) CreateAsset(ctx context.Context, asset *domain.VisitAsset) (*domain.VisitAsset, error) {
	model := &models.VisitAsset{
		VisitID:               asset.VisitID,
		AssetName:             asset.AssetName,
		AssetDescription:      asset.AssetDescription,
		AssetSerial:           asset.AssetSerial,
		AssetBrand:            asset.AssetBrand,
		EntryRegistered:       asset.EntryRegistered,
		EntryRegisteredAt:     asset.EntryRegisteredAt,
		ExitRegistered:        asset.ExitRegistered,
		ExitRegisteredAt:      asset.ExitRegisteredAt,
		EntryVerifiedByUserID: asset.EntryVerifiedByUserID,
		ExitVerifiedByUserID:  asset.ExitVerifiedByUserID,
		Notes:                 asset.Notes,
	}

	if err := r.db.Conn(ctx).Create(model).Error; err != nil {
		r.logger.Error().Err(err).Msg("Error creando activo")
		return nil, fmt.Errorf("error creando activo: %w", err)
	}

	return mappers.AssetToDomain(model), nil
}

// GetAssetsByVisitID obtiene todos los activos de una visita
func (r *VisitAssetRepository) GetAssetsByVisitID(ctx context.Context, visitID uint) ([]*domain.VisitAsset, error) {
	var assets []models.VisitAsset
	if err := r.db.Conn(ctx).Where("visit_id = ?", visitID).Find(&assets).Error; err != nil {
		return nil, fmt.Errorf("error obteniendo activos: %w", err)
	}

	result := make([]*domain.VisitAsset, len(assets))
	for i, a := range assets {
		result[i] = mappers.AssetToDomain(&a)
	}

	return result, nil
}

// UpdateAsset actualiza un activo
func (r *VisitAssetRepository) UpdateAsset(ctx context.Context, asset *domain.VisitAsset) error {
	updates := map[string]interface{}{
		"asset_name":                asset.AssetName,
		"asset_description":         asset.AssetDescription,
		"asset_serial":              asset.AssetSerial,
		"asset_brand":               asset.AssetBrand,
		"entry_registered":          asset.EntryRegistered,
		"exit_registered":           asset.ExitRegistered,
		"entry_verified_by_user_id": asset.EntryVerifiedByUserID,
		"exit_verified_by_user_id":  asset.ExitVerifiedByUserID,
		"notes":                     asset.Notes,
	}

	if asset.EntryRegisteredAt != nil {
		updates["entry_registered_at"] = asset.EntryRegisteredAt
	}
	if asset.ExitRegisteredAt != nil {
		updates["exit_registered_at"] = asset.ExitRegisteredAt
	}

	if err := r.db.Conn(ctx).Model(&models.VisitAsset{}).Where("id = ?", asset.ID).Updates(updates).Error; err != nil {
		return fmt.Errorf("error actualizando activo: %w", err)
	}

	return nil
}

// DeleteAsset elimina un activo
func (r *VisitAssetRepository) DeleteAsset(ctx context.Context, id uint) error {
	if err := r.db.Conn(ctx).Delete(&models.VisitAsset{}, id).Error; err != nil {
		return fmt.Errorf("error eliminando activo: %w", err)
	}
	return nil
}

// GetPendingExitAssets obtiene activos que tienen entrada registrada pero no salida
func (r *VisitAssetRepository) GetPendingExitAssets(ctx context.Context, visitID uint) ([]*domain.VisitAsset, error) {
	var assets []models.VisitAsset
	if err := r.db.Conn(ctx).
		Where("visit_id = ? AND entry_registered = ? AND exit_registered = ?", visitID, true, false).
		Find(&assets).Error; err != nil {
		return nil, fmt.Errorf("error obteniendo activos pendientes: %w", err)
	}

	result := make([]*domain.VisitAsset, len(assets))
	for i, a := range assets {
		result[i] = mappers.AssetToDomain(&a)
	}

	return result, nil
}

// mapAssetToDomain mapea modelo a entidad de dominio
