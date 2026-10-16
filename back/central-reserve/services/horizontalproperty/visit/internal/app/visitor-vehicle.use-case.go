package app

import (
	"context"
	"errors"
	"strings"

	"central_reserve/services/horizontalproperty/visit/internal/domain"
	"central_reserve/shared/log"
)

// ErrVehicleInvalid - faltan negocio o placa para registrar el vehículo del visitante
var ErrVehicleInvalid = errors.New("se requieren el negocio y la placa del vehículo")

// CreateOrGetVisitorVehicle registra (o reutiliza por placa) el vehículo con que llega un
// visitante. La placa se guarda en mayúsculas y sin espacios.
func (uc *visitUseCase) CreateOrGetVisitorVehicle(ctx context.Context, vehicle domain.VisitorVehicle) (*domain.VisitorVehicle, error) {
	ctx = log.WithFunctionCtx(ctx, "CreateOrGetVisitorVehicle")

	vehicle.Plate = strings.ToUpper(strings.ReplaceAll(strings.TrimSpace(vehicle.Plate), " ", ""))
	vehicle.Brand = strings.TrimSpace(vehicle.Brand)
	vehicle.Color = strings.TrimSpace(vehicle.Color)
	if vehicle.BusinessID == 0 || vehicle.Plate == "" {
		return nil, ErrVehicleInvalid
	}
	vehicle.IsActive = true

	saved, err := uc.visitorRepo.UpsertVehicle(ctx, &vehicle)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Str("plate", vehicle.Plate).Msg("Error registrando vehículo de visitante")
		return nil, err
	}
	return saved, nil
}

// GetAssetsByVisitID lista los activos (equipos) declarados de una visita.
func (uc *visitUseCase) GetAssetsByVisitID(ctx context.Context, visitID uint) ([]*domain.VisitAsset, error) {
	ctx = log.WithFunctionCtx(ctx, "GetAssetsByVisitID")
	assets, err := uc.assetRepo.GetAssetsByVisitID(ctx, visitID)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Uint("visit_id", visitID).Msg("Error listando activos")
		return nil, err
	}
	return assets, nil
}
