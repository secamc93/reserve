package app

import (
	"context"
	"fmt"

	"central_reserve/services/horizontalproperty/visit/internal/domain"
	"central_reserve/shared/log"
)

// RegisterEntry registra la entrada de una visita
func (uc *visitUseCase) RegisterEntry(ctx context.Context, visitID uint, userID uint, gate string, method string) (*domain.Visit, error) {
	ctx = log.WithFunctionCtx(ctx, "RegisterEntry")

	// 1. Obtener visita con relaciones completas
	visit, visitType, visitStatus, err := uc.visitRepo.GetVisitWithRelations(ctx, visitID)
	if err != nil {
		return nil, err
	}

	// 2. Crear máquina de estados
	stateMachine := domain.NewVisitStateMachine()

	// 3. Determinar nuevo estado según tipo de visita
	currentStatusCode := visitStatus.Code
	newStatusCode := "in_progress"

	// Si está en pending y requiere autorización, auto-autorizar primero
	if currentStatusCode == "pending" && visitType.RequiresAuthorization {
		// Validar transición a authorized
		if err := stateMachine.ValidateTransition(visitStatus, "authorized"); err != nil {
			return nil, err
		}
		// Cambiar a authorized
		if err := uc.visitRepo.ChangeVisitStatus(ctx, visitID, "authorized"); err != nil {
			return nil, fmt.Errorf("error auto-autorizando visita: %w", err)
		}
		// Actualizar status local
		visitStatus.Code = "authorized"
	}

	// 4. Validar transición a in_progress
	if err := stateMachine.ValidateTransition(visitStatus, newStatusCode); err != nil {
		return nil, err
	}

	// 5. Aplicar efectos de entrada (lógica de dominio pura)
	if err := stateMachine.ApplyEntryEffects(visit, visitType, userID, gate, method); err != nil {
		uc.logger.Error(ctx).Err(err).Uint("visit_id", visitID).Msg("Error aplicando efectos de entrada")
		return nil, err
	}

	// 6. Cambiar estado a in_progress
	if err := uc.visitRepo.ChangeVisitStatus(ctx, visitID, newStatusCode); err != nil {
		return nil, err
	}

	// 7. Guardar cambios de la visita
	if err := uc.visitRepo.SaveVisit(ctx, visit); err != nil {
		return nil, err
	}

	uc.logger.Info(ctx).Uint("visit_id", visitID).Uint("user_id", userID).Msg("Entrada registrada exitosamente")

	// 8. Retornar visita actualizada
	return uc.visitRepo.GetVisitByID(ctx, visitID)
}
