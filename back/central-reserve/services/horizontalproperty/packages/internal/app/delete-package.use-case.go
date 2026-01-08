package app

import (
	"context"

	"central_reserve/services/horizontalproperty/packages/internal/domain"
	"central_reserve/shared/log"
)

// DeletePackage elimina (soft delete) un paquete cambiando su estado a "returned"
func (uc *packageUseCase) DeletePackage(ctx context.Context, id uint) error {
	ctx = log.WithFunctionCtx(ctx, "DeletePackage")

	// Obtener el paquete
	pkg, err := uc.packageRepo.GetPackageByID(ctx, id)
	if err != nil {
		return err
	}

	// Verificar que no este en un estado final
	if pkg.PackageStatus.IsFinal {
		return domain.ErrPackageAlreadyFinal
	}

	// Obtener el estado "returned"
	returnedStatus, err := uc.packageRepo.GetPackageStatusByCode(ctx, "returned")
	if err != nil {
		uc.logger.Error(ctx).Err(err).Msg("Error obteniendo estado returned")
		return err
	}

	// Actualizar el estado
	pkg.PackageStatusID = returnedStatus.ID
	if err := uc.packageRepo.UpdatePackage(ctx, pkg); err != nil {
		uc.logger.Error(ctx).Err(err).Msg("Error eliminando paquete")
		return err
	}

	uc.logger.Info(ctx).Uint("package_id", id).Msg("Paquete marcado como retornado")
	return nil
}
