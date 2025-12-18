package app

import (
	"context"

	"central_reserve/services/horizontalproperty/packages/internal/domain"
	"central_reserve/shared/log"
)

// GetPackageByID obtiene un paquete por ID
func (uc *packageUseCase) GetPackageByID(ctx context.Context, id uint) (*domain.Package, error) {
	ctx = log.WithFunctionCtx(ctx, "GetPackageByID")

	pkg, err := uc.packageRepo.GetPackageByID(ctx, id)
	if err != nil {
		return nil, err
	}

	return pkg, nil
}

// GetPackageByQRCode obtiene un paquete por código QR
func (uc *packageUseCase) GetPackageByQRCode(ctx context.Context, qrCode string) (*domain.Package, error) {
	ctx = log.WithFunctionCtx(ctx, "GetPackageByQRCode")

	pkg, err := uc.packageRepo.GetPackageByQRCode(ctx, qrCode)
	if err != nil {
		return nil, err
	}

	return pkg, nil
}

// UpdatePackageStatus actualiza el estado de un paquete
func (uc *packageUseCase) UpdatePackageStatus(ctx context.Context, dto domain.UpdatePackageStatusDTO) (*domain.Package, error) {
	ctx = log.WithFunctionCtx(ctx, "UpdatePackageStatus")

	// Obtener el paquete
	pkg, err := uc.packageRepo.GetPackageByID(ctx, dto.PackageID)
	if err != nil {
		return nil, err
	}

	// Validar transición de estado (si el estado actual es final, no se puede cambiar)
	if pkg.PackageStatus.IsFinal {
		return nil, domain.ErrInvalidStatusTransition
	}

	// Actualizar estado
	pkg.PackageStatusID = dto.PackageStatusID
	if dto.Notes != "" {
		pkg.Notes = dto.Notes
	}

	// Actualizar en repositorio
	if err := uc.packageRepo.UpdatePackage(ctx, pkg); err != nil {
		return nil, err
	}

	// Obtener paquete actualizado
	updated, err := uc.packageRepo.GetPackageByID(ctx, dto.PackageID)
	if err != nil {
		return nil, err
	}

	return updated, nil
}

// getPackageStatusByCode obtiene un estado de paquete por código
func (uc *packageUseCase) getPackageStatusByCode(ctx context.Context, code string) (*domain.PackageStatus, error) {
	status, err := uc.packageRepo.GetPackageStatusByCode(ctx, code)
	if err != nil {
		return nil, err
	}
	return status, nil
}
