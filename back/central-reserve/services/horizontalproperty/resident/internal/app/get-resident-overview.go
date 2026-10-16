package app

import (
	"context"
	"time"

	"central_reserve/services/horizontalproperty/resident/internal/domain"
	"central_reserve/shared/log"
)

// GetResidentOverview devuelve las cifras, los otros residentes de la unidad y la actividad
// reciente de un residente. El residente debe pertenecer a la propiedad (si no, "no encontrado").
func (uc *residentUseCase) GetResidentOverview(ctx context.Context, businessID, residentID uint) (*domain.ResidentOverviewDTO, error) {
	ctx = log.WithFunctionCtx(ctx, "GetResidentOverview")
	if businessID == 0 {
		return nil, domain.ErrBusinessIDRequired
	}
	resident, err := uc.repo.GetResidentByID(ctx, residentID)
	if err != nil {
		return nil, err
	}
	if resident == nil || resident.BusinessID != businessID {
		return nil, domain.ErrResidentNotFound
	}
	overview, err := uc.repo.GetResidentOverview(ctx, businessID, residentID, time.Now())
	if err != nil {
		uc.logger.Error(ctx).Err(err).Uint("resident_id", residentID).Msg("Error obteniendo resumen del residente")
		return nil, err
	}
	if overview.Housemates == nil {
		overview.Housemates = []domain.HousemateDTO{}
	}
	if overview.Activity == nil {
		overview.Activity = []domain.ActivityDTO{}
	}
	return overview, nil
}
