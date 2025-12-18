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

// RegisterExit registra la salida de una visita
func (uc *visitUseCase) RegisterExit(ctx context.Context, visitID uint, userID uint, gate string) (*domain.Visit, error) {
	ctx = log.WithFunctionCtx(ctx, "RegisterExit")

	// Obtener repositorio con acceso a DB
	visitRepo, ok := uc.visitRepo.(*repository.VisitRepository)
	if !ok {
		return nil, fmt.Errorf("repositorio de visitas no es del tipo esperado")
	}

	// Cargar el modelo completo para usar el método RegisterExit
	var visitModel models.Visit
	db := visitRepo.GetDB(ctx)
	if err := db.Preload("VisitStatus").Preload("VisitType").First(&visitModel, visitID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, domain.ErrVisitNotFound
		}
		return nil, fmt.Errorf("error obteniendo visita: %w", err)
	}

	// Verificar que todos los assets tengan salida registrada (si aplica)
	if visitModel.HasAssets {
		pendingAssets, err := uc.assetRepo.GetPendingExitAssets(ctx, visitID)
		if err != nil {
			return nil, fmt.Errorf("error verificando activos pendientes: %w", err)
		}
		if len(pendingAssets) > 0 {
			return nil, domain.ErrAssetsPendingExit
		}
	}

	// Usar la función del dominio para registrar salida
	if err := domain.RegisterVisitExit(&visitModel, userID, gate, db); err != nil {
		uc.logger.Error(ctx).Err(err).Uint("visit_id", visitID).Msg("Error registrando salida")
		return nil, err
	}

	// Obtener visita actualizada
	updated, err := uc.visitRepo.GetVisitByID(ctx, visitID)
	if err != nil {
		return nil, err
	}

	uc.logger.Info(ctx).Uint("visit_id", visitID).Uint("user_id", userID).Msg("Salida registrada exitosamente")

	return updated, nil
}
