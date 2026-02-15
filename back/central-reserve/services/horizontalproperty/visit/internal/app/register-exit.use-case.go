package app

import (
	"context"
	"fmt"

	"central_reserve/services/horizontalproperty/visit/internal/domain"
	"central_reserve/shared/log"
)

// RegisterExit registra la salida de una visita
func (uc *visitUseCase) RegisterExit(ctx context.Context, visitID uint, userID uint, gate string) (*domain.Visit, error) {
	ctx = log.WithFunctionCtx(ctx, "RegisterExit")

	// 1. Obtener visita con relaciones completas
	visit, visitType, visitStatus, err := uc.visitRepo.GetVisitWithRelations(ctx, visitID)
	if err != nil {
		return nil, err
	}

	// 2. Verificar que todos los assets tengan salida registrada (si aplica)
	if visit.HasAssets {
		pendingAssets, err := uc.assetRepo.GetPendingExitAssets(ctx, visitID)
		if err != nil {
			return nil, fmt.Errorf("error verificando activos pendientes: %w", err)
		}
		if len(pendingAssets) > 0 {
			return nil, domain.ErrAssetsPendingExit
		}
	}

	// 3. Validar que esté en estado "in_progress"
	if visitStatus.Code != "in_progress" {
		return nil, fmt.Errorf("solo se puede registrar salida de visitas en curso (estado actual: %s)", visitStatus.Code)
	}

	// 4. Crear máquina de estados y validar transición
	stateMachine := domain.NewVisitStateMachine()
	if err := stateMachine.ValidateTransition(visitStatus, "completed"); err != nil {
		return nil, err
	}

	// 5. Aplicar efectos de salida (lógica de dominio pura)
	if err := stateMachine.ApplyExitEffects(visit, visitType, userID, gate); err != nil {
		uc.logger.Error(ctx).Err(err).Uint("visit_id", visitID).Msg("Error aplicando efectos de salida")
		return nil, err
	}

	// 6. Cambiar estado a completed
	if err := uc.visitRepo.ChangeVisitStatus(ctx, visitID, "completed"); err != nil {
		return nil, err
	}

	// 7. Guardar cambios de la visita
	if err := uc.visitRepo.SaveVisit(ctx, visit); err != nil {
		return nil, err
	}

	uc.logger.Info(ctx).Uint("visit_id", visitID).Uint("user_id", userID).Msg("Salida registrada exitosamente")

	// 8. Retornar visita actualizada
	return uc.visitRepo.GetVisitByID(ctx, visitID)
}
