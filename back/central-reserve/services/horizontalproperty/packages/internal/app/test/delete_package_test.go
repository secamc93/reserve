package app_test

import (
	"context"
	"errors"
	"testing"

	"central_reserve/services/horizontalproperty/packages/internal/app"
	"central_reserve/services/horizontalproperty/packages/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/packages/internal/domain"
)

func TestDeletePackage_Success(t *testing.T) {
	// Arrange
	ctx := context.Background()
	packageID := uint(1)

	pkg := &domain.Package{
		ID:              packageID,
		BusinessID:      1,
		PropertyUnitID:  10,
		PackageStatusID: 1,
		PackageStatus: domain.PackageStatus{
			ID:      1,
			Code:    "received",
			Name:    "Received",
			IsFinal: false,
		},
	}

	returnedStatus := &domain.PackageStatus{
		ID:      5,
		Code:    "returned",
		Name:    "Returned",
		IsFinal: true,
	}

	mockRepo := &mocks.PackageRepositoryMock{
		GetPackageByIDFunc: func(ctx context.Context, id uint) (*domain.Package, error) {
			if id == packageID {
				return pkg, nil
			}
			return nil, domain.ErrPackageNotFound
		},
		GetPackageStatusByCodeFunc: func(ctx context.Context, code string) (*domain.PackageStatus, error) {
			if code == "returned" {
				return returnedStatus, nil
			}
			return nil, errors.New("status not found")
		},
		UpdatePackageFunc: func(ctx context.Context, p *domain.Package) error {
			if p.PackageStatusID != returnedStatus.ID {
				return errors.New("expected returned status")
			}
			return nil
		},
	}

	mockLogger := mocks.NewLoggerMock()
	useCase := app.New(mockRepo, mockLogger)

	// Act
	err := useCase.DeletePackage(ctx, packageID)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
}

func TestDeletePackage_AlreadyFinal(t *testing.T) {
	// Arrange
	ctx := context.Background()
	packageID := uint(1)

	// Paquete ya en estado final (delivered)
	pkg := &domain.Package{
		ID:              packageID,
		BusinessID:      1,
		PropertyUnitID:  10,
		PackageStatusID: 2,
		PackageStatus: domain.PackageStatus{
			ID:      2,
			Code:    "delivered",
			Name:    "Delivered",
			IsFinal: true, // Estado final
		},
	}

	mockRepo := &mocks.PackageRepositoryMock{
		GetPackageByIDFunc: func(ctx context.Context, id uint) (*domain.Package, error) {
			return pkg, nil
		},
	}

	mockLogger := mocks.NewLoggerMock()
	useCase := app.New(mockRepo, mockLogger)

	// Act
	err := useCase.DeletePackage(ctx, packageID)

	// Assert
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if !errors.Is(err, domain.ErrPackageAlreadyFinal) {
		t.Errorf("expected ErrPackageAlreadyFinal, got %v", err)
	}
}

func TestDeletePackage_NotFound(t *testing.T) {
	// Arrange
	ctx := context.Background()
	packageID := uint(999)

	mockRepo := &mocks.PackageRepositoryMock{
		GetPackageByIDFunc: func(ctx context.Context, id uint) (*domain.Package, error) {
			return nil, domain.ErrPackageNotFound
		},
	}

	mockLogger := mocks.NewLoggerMock()
	useCase := app.New(mockRepo, mockLogger)

	// Act
	err := useCase.DeletePackage(ctx, packageID)

	// Assert
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if !errors.Is(err, domain.ErrPackageNotFound) {
		t.Errorf("expected ErrPackageNotFound, got %v", err)
	}
}

func TestDeletePackage_UpdateError(t *testing.T) {
	// Arrange
	ctx := context.Background()
	packageID := uint(1)
	updateError := errors.New("database error")

	pkg := &domain.Package{
		ID:              packageID,
		BusinessID:      1,
		PropertyUnitID:  10,
		PackageStatusID: 1,
		PackageStatus: domain.PackageStatus{
			ID:      1,
			Code:    "received",
			Name:    "Received",
			IsFinal: false,
		},
	}

	returnedStatus := &domain.PackageStatus{
		ID:      5,
		Code:    "returned",
		Name:    "Returned",
		IsFinal: true,
	}

	mockRepo := &mocks.PackageRepositoryMock{
		GetPackageByIDFunc: func(ctx context.Context, id uint) (*domain.Package, error) {
			return pkg, nil
		},
		GetPackageStatusByCodeFunc: func(ctx context.Context, code string) (*domain.PackageStatus, error) {
			if code == "returned" {
				return returnedStatus, nil
			}
			return nil, errors.New("status not found")
		},
		UpdatePackageFunc: func(ctx context.Context, p *domain.Package) error {
			return updateError
		},
	}

	mockLogger := mocks.NewLoggerMock()
	useCase := app.New(mockRepo, mockLogger)

	// Act
	err := useCase.DeletePackage(ctx, packageID)

	// Assert
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if !errors.Is(err, updateError) {
		t.Errorf("expected update error, got %v", err)
	}
}

func TestDeletePackage_StatusNotFound(t *testing.T) {
	// Arrange
	ctx := context.Background()
	packageID := uint(1)
	statusError := errors.New("status not found")

	pkg := &domain.Package{
		ID:              packageID,
		BusinessID:      1,
		PropertyUnitID:  10,
		PackageStatusID: 1,
		PackageStatus: domain.PackageStatus{
			ID:      1,
			Code:    "received",
			Name:    "Received",
			IsFinal: false,
		},
	}

	mockRepo := &mocks.PackageRepositoryMock{
		GetPackageByIDFunc: func(ctx context.Context, id uint) (*domain.Package, error) {
			return pkg, nil
		},
		GetPackageStatusByCodeFunc: func(ctx context.Context, code string) (*domain.PackageStatus, error) {
			return nil, statusError
		},
	}

	mockLogger := mocks.NewLoggerMock()
	useCase := app.New(mockRepo, mockLogger)

	// Act
	err := useCase.DeletePackage(ctx, packageID)

	// Assert
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if !errors.Is(err, statusError) {
		t.Errorf("expected status error, got %v", err)
	}
}
