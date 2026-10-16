package app_test

import (
	"context"
	"strings"
	"testing"

	"central_reserve/services/horizontalproperty/packages/internal/app"
	"central_reserve/services/horizontalproperty/packages/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/packages/internal/domain"
)

// La guía es opcional (diseño P2): un sobre o un domicilio sin guía también se recibe.
func TestReceivePackage_SinGuiaSeRecibeConQRDeLaUnidad(t *testing.T) {
	var created *domain.Package
	repo := &mocks.PackageRepositoryMock{
		CreatePackageFunc: func(ctx context.Context, pkg *domain.Package) (*domain.Package, error) {
			created = pkg
			pkg.ID = 10
			return pkg, nil
		},
	}
	uc := app.New(repo, mocks.NewLoggerMock())
	_, err := uc.ReceivePackage(context.Background(), domain.CreatePackageDTO{BusinessID: 1, PropertyUnitID: 40, Carrier: "Rappi", TrackingNumber: "  "})
	if err != nil {
		t.Fatalf("error inesperado: %v", err)
	}
	if created.TrackingNumber != "" {
		t.Errorf("guía = %q, se esperaba vacía", created.TrackingNumber)
	}
	if !strings.HasPrefix(created.QRCode, "PKG-U40-") {
		t.Errorf("QR = %q, se esperaba con la unidad", created.QRCode)
	}
}

func TestReceivePackage_SigueExigiendoUnidadYTransportadora(t *testing.T) {
	uc := app.New(&mocks.PackageRepositoryMock{}, mocks.NewLoggerMock())
	if _, err := uc.ReceivePackage(context.Background(), domain.CreatePackageDTO{BusinessID: 1, Carrier: "Rappi"}); err == nil {
		t.Error("sin unidad debía fallar")
	}
	if _, err := uc.ReceivePackage(context.Background(), domain.CreatePackageDTO{BusinessID: 1, PropertyUnitID: 40}); err == nil {
		t.Error("sin transportadora debía fallar")
	}
}
