package app

import (
	"context"
	"fmt"

	"central_reserve/services/horizontalproperty/packages/internal/domain"
	"central_reserve/shared/log"
	"time"
)

// DeliverPackage registra la entrega de un paquete
func (uc *packageUseCase) DeliverPackage(ctx context.Context, dto domain.DeliverPackageDTO) (*domain.Package, error) {
	ctx = log.WithFunctionCtx(ctx, "DeliverPackage")

	// Obtener el paquete
	pkg, err := uc.packageRepo.GetPackageByID(ctx, dto.PackageID)
	if err != nil {
		return nil, err
	}

	// Validar que el paquete no esté ya entregado
	if pkg.PackageStatus.IsFinal {
		return nil, domain.ErrPackageAlreadyDelivered
	}

	// Validar que el paquete esté en estado entregable (received o in_storage)
	if pkg.PackageStatus.Code != "received" && pkg.PackageStatus.Code != "in_storage" {
		return nil, domain.ErrPackageNotDeliverable
	}

	// Obtener estado "delivered"
	status, err := uc.getPackageStatusByCode(ctx, "delivered")
	if err != nil {
		return nil, fmt.Errorf("error obteniendo estado delivered: %w", err)
	}

	// Actualizar paquete
	now := time.Now()
	pkg.PackageStatusID = status.ID
	pkg.DeliveredByUserID = &dto.DeliveredByUserID
	pkg.DeliveredAt = &now
	if dto.Notes != "" {
		pkg.Notes = dto.Notes
	}

	// Actualizar en repositorio
	if err := uc.packageRepo.UpdatePackage(ctx, pkg); err != nil {
		uc.logger.Error(ctx).Err(err).Uint("package_id", dto.PackageID).Msg("Error actualizando paquete")
		return nil, fmt.Errorf("error actualizando paquete: %w", err)
	}

	// Obtener paquete actualizado con relaciones
	updated, err := uc.packageRepo.GetPackageByID(ctx, dto.PackageID)
	if err != nil {
		return nil, err
	}

	uc.logger.Info(ctx).Uint("package_id", dto.PackageID).Msg("Paquete entregado exitosamente")

	return updated, nil
}
