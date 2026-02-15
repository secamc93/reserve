package mocks

import (
	"context"

	"central_reserve/services/horizontalproperty/packages/internal/domain"
)

// PackageRepositoryMock - Mock del repositorio de paquetes
type PackageRepositoryMock struct {
	CreatePackageFunc             func(ctx context.Context, pkg *domain.Package) (*domain.Package, error)
	GetPackageByIDFunc            func(ctx context.Context, id uint) (*domain.Package, error)
	GetPackageByQRCodeFunc        func(ctx context.Context, qrCode string) (*domain.Package, error)
	UpdatePackageFunc             func(ctx context.Context, pkg *domain.Package) error
	ListPackagesFunc              func(ctx context.Context, filters domain.PackageFiltersDTO) (*domain.PaginatedPackagesDTO, error)
	GetPackageStatusByCodeFunc    func(ctx context.Context, code string) (*domain.PackageStatus, error)
	GetPackageStatusesFunc        func(ctx context.Context) ([]*domain.PackageStatus, error)
	GetPropertyUnitBusinessIDFunc func(ctx context.Context, propertyUnitID uint) (uint, error)
}

func (m *PackageRepositoryMock) CreatePackage(ctx context.Context, pkg *domain.Package) (*domain.Package, error) {
	if m.CreatePackageFunc != nil {
		return m.CreatePackageFunc(ctx, pkg)
	}
	return pkg, nil
}

func (m *PackageRepositoryMock) GetPackageByID(ctx context.Context, id uint) (*domain.Package, error) {
	if m.GetPackageByIDFunc != nil {
		return m.GetPackageByIDFunc(ctx, id)
	}
	return nil, domain.ErrPackageNotFound
}

func (m *PackageRepositoryMock) GetPackageByQRCode(ctx context.Context, qrCode string) (*domain.Package, error) {
	if m.GetPackageByQRCodeFunc != nil {
		return m.GetPackageByQRCodeFunc(ctx, qrCode)
	}
	return nil, domain.ErrPackageNotFound
}

func (m *PackageRepositoryMock) UpdatePackage(ctx context.Context, pkg *domain.Package) error {
	if m.UpdatePackageFunc != nil {
		return m.UpdatePackageFunc(ctx, pkg)
	}
	return nil
}

func (m *PackageRepositoryMock) ListPackages(ctx context.Context, filters domain.PackageFiltersDTO) (*domain.PaginatedPackagesDTO, error) {
	if m.ListPackagesFunc != nil {
		return m.ListPackagesFunc(ctx, filters)
	}
	return &domain.PaginatedPackagesDTO{
		Packages:   []domain.PackageListDTO{},
		Total:      0,
		Page:       filters.Page,
		PageSize:   filters.PageSize,
		TotalPages: 0,
	}, nil
}

func (m *PackageRepositoryMock) GetPackageStatusByCode(ctx context.Context, code string) (*domain.PackageStatus, error) {
	if m.GetPackageStatusByCodeFunc != nil {
		return m.GetPackageStatusByCodeFunc(ctx, code)
	}
	return &domain.PackageStatus{
		ID:          1,
		Code:        code,
		Name:        code,
		Description: code,
		IsFinal:     false,
		IsActive:    true,
	}, nil
}

func (m *PackageRepositoryMock) GetPackageStatuses(ctx context.Context) ([]*domain.PackageStatus, error) {
	if m.GetPackageStatusesFunc != nil {
		return m.GetPackageStatusesFunc(ctx)
	}
	return []*domain.PackageStatus{}, nil
}

func (m *PackageRepositoryMock) GetPropertyUnitBusinessID(ctx context.Context, propertyUnitID uint) (uint, error) {
	if m.GetPropertyUnitBusinessIDFunc != nil {
		return m.GetPropertyUnitBusinessIDFunc(ctx, propertyUnitID)
	}
	return 1, nil
}
