package app

import (
	"context"

	"central_reserve/services/horizontalproperty/packages/internal/domain"
	"central_reserve/shared/log"
)

// GetPackageStatuses obtiene todos los estados de paquete activos
func (uc *packageUseCase) GetPackageStatuses(ctx context.Context) ([]*domain.PackageStatus, error) {
	ctx = log.WithFunctionCtx(ctx, "GetPackageStatuses")

	statuses, err := uc.packageRepo.GetPackageStatuses(ctx)
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msg("Error obteniendo estados de paquete")
		return nil, err
	}

	return statuses, nil
}
