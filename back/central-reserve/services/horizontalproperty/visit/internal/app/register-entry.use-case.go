package app

import (
	"context"
	"fmt"

	"central_reserve/services/horizontalproperty/visit/internal/domain"
	"central_reserve/services/horizontalproperty/visit/internal/infra/secondary/repository"
	"central_reserve/shared/log"
	"dbpostgres/app/infra/models"

	"gorm.io/gorm"
)

// RegisterEntry registra la entrada de una visita
func (uc *visitUseCase) RegisterEntry(ctx context.Context, visitID uint, userID uint, gate string, method string) (*domain.Visit, error) {
	ctx = log.WithFunctionCtx(ctx, "RegisterEntry")

	// Obtener repositorio con acceso a DB
	visitRepo, ok := uc.visitRepo.(*repository.VisitRepository)
	if !ok {
		return nil, fmt.Errorf("repositorio de visitas no es del tipo esperado")
	}

	// Cargar el modelo completo para usar el método RegisterEntry
	var visitModel models.Visit
	db := visitRepo.GetDB(ctx)
	if err := db.Preload("VisitStatus").Preload("VisitType").First(&visitModel, visitID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, domain.ErrVisitNotFound
		}
		return nil, fmt.Errorf("error obteniendo visita: %w", err)
	}

	// Usar la función del dominio para registrar entrada
	if err := domain.RegisterVisitEntry(&visitModel, userID, gate, method, db); err != nil {
		uc.logger.Error(ctx).Err(err).Uint("visit_id", visitID).Msg("Error registrando entrada")
		return nil, err
	}

	// Obtener visita actualizada
	updated, err := uc.visitRepo.GetVisitByID(ctx, visitID)
	if err != nil {
		return nil, err
	}

	uc.logger.Info(ctx).Uint("visit_id", visitID).Uint("user_id", userID).Msg("Entrada registrada exitosamente")

	return updated, nil
}
