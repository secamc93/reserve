package domain

import (
	"context"
	"time"
)

// PackageRepository - Puerto para repositorio de paquetes
type PackageRepository interface {
	CreatePackage(ctx context.Context, pkg *Package) (*Package, error)
	GetPackageByID(ctx context.Context, id uint) (*Package, error)
	GetPackageByQRCode(ctx context.Context, qrCode string) (*Package, error)
	UpdatePackage(ctx context.Context, pkg *Package) error
	ListPackages(ctx context.Context, filters PackageFiltersDTO) (*PaginatedPackagesDTO, error)
	// CountPackagesByStatusCodes cuenta los paquetes del negocio (0 = todos) con esos estados;
	// si receivedBefore no es nil, solo los recibidos antes; si deliveredSince no es nil, solo los
	// entregados desde esa hora.
	CountPackagesByStatusCodes(ctx context.Context, businessID uint, codes []string, receivedBefore *time.Time, deliveredSince *time.Time) (int64, error)
	GetPackageStatusByCode(ctx context.Context, code string) (*PackageStatus, error)
	GetPackageStatuses(ctx context.Context) ([]*PackageStatus, error)
	GetPropertyUnitBusinessID(ctx context.Context, propertyUnitID uint) (uint, error)
}

// PackageUseCase - Puerto para casos de uso de paquetes
type PackageUseCase interface {
	ReceivePackage(ctx context.Context, dto CreatePackageDTO) (*Package, error)
	DeliverPackage(ctx context.Context, dto DeliverPackageDTO) (*Package, error)
	ListPackages(ctx context.Context, filters PackageFiltersDTO) (*PaginatedPackagesDTO, error)
	GetPackagesSummary(ctx context.Context, businessID uint, now time.Time) (*PackagesSummaryDTO, error)
	GetPackageByID(ctx context.Context, id uint) (*Package, error)
	GetPackageByQRCode(ctx context.Context, qrCode string) (*Package, error)
	UpdatePackageStatus(ctx context.Context, dto UpdatePackageStatusDTO) (*Package, error)
	GetPackageStatuses(ctx context.Context) ([]*PackageStatus, error)
	DeletePackage(ctx context.Context, id uint) error
}
