package app

import (
	"context"

	"central_reserve/services/horizontalproperty/visit/internal/domain"
	"central_reserve/shared/log"
)

// UpdateVisit actualiza una visita existente
func (uc *visitUseCase) UpdateVisit(ctx context.Context, visitID uint, dto domain.UpdateVisitDTO) (*domain.Visit, error) {
	ctx = log.WithFunctionCtx(ctx, "UpdateVisit")

	// Obtener la visita existente
	visit, err := uc.visitRepo.GetVisitByID(ctx, visitID)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Uint("visit_id", visitID).Msg("Error obteniendo visita para actualizar")
		return nil, err
	}

	if visit == nil {
		return nil, domain.ErrVisitNotFound
	}

	// Validar que la visita no esté en un estado final
	if visit.ActualExitTime != nil {
		return nil, domain.ErrVisitAlreadyCompleted
	}

	// Aplicar actualizaciones
	if dto.PropertyUnitID != nil {
		visit.PropertyUnitID = *dto.PropertyUnitID
	}
	if dto.ResidentID != nil {
		visit.ResidentID = dto.ResidentID
	}
	if dto.VisitTypeID != nil {
		visit.VisitTypeID = *dto.VisitTypeID
	}
	if dto.ScheduledDate != nil {
		visit.ScheduledDate = *dto.ScheduledDate
	}
	if dto.ScheduledStartTime != nil {
		visit.ScheduledStartTime = *dto.ScheduledStartTime
	}
	if dto.ScheduledEndTime != nil {
		visit.ScheduledEndTime = dto.ScheduledEndTime
	}
	if dto.Purpose != nil {
		visit.Purpose = *dto.Purpose
	}
	if dto.NumberOfVisitors != nil {
		visit.NumberOfVisitors = *dto.NumberOfVisitors
	}
	if dto.Notes != nil {
		visit.Notes = *dto.Notes
	}
	if dto.NotifyResident != nil {
		visit.NotifyResident = *dto.NotifyResident
	}
	if dto.NotifySecurity != nil {
		visit.NotifySecurity = *dto.NotifySecurity
	}

	// Guardar cambios
	err = uc.visitRepo.UpdateVisit(ctx, visit)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Uint("visit_id", visitID).Msg("Error actualizando visita")
		return nil, err
	}

	uc.logger.Info(ctx).Uint("visit_id", visitID).Msg("Visita actualizada correctamente")
	return visit, nil
}
