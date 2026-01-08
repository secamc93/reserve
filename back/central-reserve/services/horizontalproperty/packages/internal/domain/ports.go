package domain

import "context"

// PackageRepository - Puerto para repositorio de paquetes
type PackageRepository interface {
	CreatePackage(ctx context.Context, pkg *Package) (*Package, error)
	GetPackageByID(ctx context.Context, id uint) (*Package, error)
	GetPackageByQRCode(ctx context.Context, qrCode string) (*Package, error)
	UpdatePackage(ctx context.Context, pkg *Package) error
	ListPackages(ctx context.Context, filters PackageFiltersDTO) (*PaginatedPackagesDTO, error)
	GetPackageStatusByCode(ctx context.Context, code string) (*PackageStatus, error)
	GetPackageStatuses(ctx context.Context) ([]*PackageStatus, error)
	GetPropertyUnitBusinessID(ctx context.Context, propertyUnitID uint) (uint, error)
}

// PackageUseCase - Puerto para casos de uso de paquetes
type PackageUseCase interface {
	ReceivePackage(ctx context.Context, dto CreatePackageDTO) (*Package, error)
	DeliverPackage(ctx context.Context, dto DeliverPackageDTO) (*Package, error)
	ListPackages(ctx context.Context, filters PackageFiltersDTO) (*PaginatedPackagesDTO, error)
	GetPackageByID(ctx context.Context, id uint) (*Package, error)
	GetPackageByQRCode(ctx context.Context, qrCode string) (*Package, error)
	UpdatePackageStatus(ctx context.Context, dto UpdatePackageStatusDTO) (*Package, error)
	GetPackageStatuses(ctx context.Context) ([]*PackageStatus, error)
	DeletePackage(ctx context.Context, id uint) error
}
