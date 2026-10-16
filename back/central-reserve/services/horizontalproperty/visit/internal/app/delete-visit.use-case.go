package app

import (
	"context"

	"central_reserve/services/horizontalproperty/visit/internal/domain"
	"central_reserve/shared/log"
)

// visitStatusCancelled es el código del estado de una visita cancelada. Se cambia por código
// (ChangeVisitStatus): los ids de visit_statuses cambian entre bases.
const visitStatusCancelled = "cancelled"

// DeleteVisit cancela una visita (no la borra: cambia su estado a cancelled).
// No se puede cancelar una visita con el visitante dentro (hay que registrar la salida) ni
// una visita en estado final.
func (uc *visitUseCase) DeleteVisit(ctx context.Context, visitID uint) error {
	ctx = log.WithFunctionCtx(ctx, "DeleteVisit")

	visit, _, status, err := uc.visitRepo.GetVisitWithRelations(ctx, visitID)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Uint("visit_id", visitID).Msg("Error obteniendo visita para cancelar")
		return err
	}
	if visit == nil || status == nil {
		return domain.ErrVisitNotFound
	}

	// Visitante dentro: primero se registra la salida
	if visit.ActualEntryTime != nil && visit.ActualExitTime == nil {
		return domain.ErrVisitNotInProgress
	}

	if err := domain.NewVisitStateMachine().ValidateTransition(status, visitStatusCancelled); err != nil {
		return err
	}

	if err := uc.visitRepo.ChangeVisitStatus(ctx, visitID, visitStatusCancelled); err != nil {
		uc.logger.Error(ctx).Err(err).Uint("visit_id", visitID).Msg("Error cancelando visita")
		return err
	}

	uc.logger.Info(ctx).Uint("visit_id", visitID).Msg("Visita cancelada correctamente")
	return nil
}
