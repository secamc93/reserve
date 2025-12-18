package app

import (
	"context"
	"fmt"
	"time"

	"central_reserve/services/horizontalproperty/visit/internal/domain"
	"central_reserve/shared/log"
)

// RegisterAssets registra activos para una visita
func (uc *visitUseCase) RegisterAssets(ctx context.Context, visitID uint, assets []domain.CreateVisitAssetDTO) error {
	ctx = log.WithFunctionCtx(ctx, "RegisterAssets")

	// Verificar que la visita existe
	visit, err := uc.visitRepo.GetVisitByID(ctx, visitID)
	if err != nil {
		return err
	}

	// Registrar cada activo
	now := time.Now()
	for _, assetDTO := range assets {
		asset := &domain.VisitAsset{
			VisitID:           visitID,
			AssetName:         assetDTO.AssetName,
			AssetDescription:  assetDTO.AssetDescription,
			AssetSerial:       assetDTO.AssetSerial,
			AssetBrand:        assetDTO.AssetBrand,
			EntryRegistered:   true,
			EntryRegisteredAt: &now,
		}

		if _, err := uc.assetRepo.CreateAsset(ctx, asset); err != nil {
			uc.logger.Error(ctx).Err(err).Uint("visit_id", visitID).Str("asset_name", assetDTO.AssetName).Msg("Error registrando activo")
			return fmt.Errorf("error registrando activo %s: %w", assetDTO.AssetName, err)
		}
	}

	uc.logger.Info(ctx).Uint("visit_id", visitID).Int("assets_count", len(assets)).Msg("Activos registrados exitosamente")

	// Actualizar flag HasAssets en la visita si es necesario
	if !visit.HasAssets && len(assets) > 0 {
		visit.HasAssets = true
		if err := uc.visitRepo.UpdateVisit(ctx, visit); err != nil {
			uc.logger.Warn(ctx).Err(err).Uint("visit_id", visitID).Msg("Error actualizando flag HasAssets")
		}
	}

	return nil
}
