package app

import (
	"context"

	"central_reserve/services/horizontalproperty/visit/internal/domain"
	"central_reserve/shared/log"
)

// StatusCancelled ID del estado "cancelled" en la base de datos
const StatusCancelled uint = 5

// DeleteVisit elimina una visita (soft delete - cambia estado a cancelled)
func (uc *visitUseCase) DeleteVisit(ctx context.Context, visitID uint) error {
	ctx = log.WithFunctionCtx(ctx, "DeleteVisit")

	// Obtener la visita existente
	visit, err := uc.visitRepo.GetVisitByID(ctx, visitID)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Uint("visit_id", visitID).Msg("Error obteniendo visita para eliminar")
		return err
	}

	if visit == nil {
		return domain.ErrVisitNotFound
	}

	// Validar que la visita no esté en progreso (entrada registrada pero no salida)
	if visit.ActualEntryTime != nil && visit.ActualExitTime == nil {
		return domain.ErrVisitNotInProgress
	}

	// Cambiar estado a cancelled (soft delete)
	visit.VisitStatusID = StatusCancelled

	err = uc.visitRepo.UpdateVisit(ctx, visit)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Uint("visit_id", visitID).Msg("Error cancelando visita")
		return err
	}

	uc.logger.Info(ctx).Uint("visit_id", visitID).Msg("Visita cancelada correctamente")
	return nil
}
