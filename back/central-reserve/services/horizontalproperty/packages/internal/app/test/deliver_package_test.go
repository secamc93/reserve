package app_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"central_reserve/services/horizontalproperty/packages/internal/app"
	"central_reserve/services/horizontalproperty/packages/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/packages/internal/domain"
)

func TestDeliverPackage_Success(t *testing.T) {
	// Arrange
	ctx := context.Background()
	packageID := uint(1)
	userID := uint(100)

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

	deliveredStatus := &domain.PackageStatus{
		ID:      2,
		Code:    "delivered",
		Name:    "Delivered",
		IsFinal: true,
	}

	updatedPkg := &domain.Package{
		ID:                packageID,
		BusinessID:        1,
		PropertyUnitID:    10,
		PackageStatusID:   2,
		DeliveredByUserID: &userID,
		PackageStatus: domain.PackageStatus{
			ID:      2,
			Code:    "delivered",
			Name:    "Delivered",
			IsFinal: true,
		},
	}

	mockRepo := &mocks.PackageRepositoryMock{
		GetPackageByIDFunc: func(ctx context.Context, id uint) (*domain.Package, error) {
			if id == packageID {
				return pkg, nil
			}
			return nil, domain.ErrPackageNotFound
		},
		GetPackageStatusByCodeFunc: func(ctx context.Context, code string) (*domain.PackageStatus, error) {
			if code == "delivered" {
				return deliveredStatus, nil
			}
			return nil, errors.New("status not found")
		},
		UpdatePackageFunc: func(ctx context.Context, p *domain.Package) error {
			return nil
		},
	}

	// Simular segunda llamada a GetPackageByID para retornar paquete actualizado
	callCount := 0
	originalGetByID := mockRepo.GetPackageByIDFunc
	mockRepo.GetPackageByIDFunc = func(ctx context.Context, id uint) (*domain.Package, error) {
		callCount++
		if callCount == 1 {
			return pkg, nil
		}
		return updatedPkg, nil
	}
	_ = originalGetByID // evitar warning

	mockLogger := mocks.NewLoggerMock()
	useCase := app.New(mockRepo, mockLogger)

	dto := domain.DeliverPackageDTO{
		PackageID:         packageID,
		DeliveredByUserID: userID,
		Notes:             "Entregado al residente",
	}

	// Act
	result, err := useCase.DeliverPackage(ctx, dto)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result.ID != packageID {
		t.Errorf("expected package ID %d, got %d", packageID, result.ID)
	}

	if result.PackageStatusID != 2 {
		t.Errorf("expected status ID 2, got %d", result.PackageStatusID)
	}

	if result.DeliveredByUserID == nil || *result.DeliveredByUserID != userID {
		t.Errorf("expected delivered by user ID %d, got %v", userID, result.DeliveredByUserID)
	}

	if result.PackageStatus.Code != "delivered" {
		t.Errorf("expected status code 'delivered', got '%s'", result.PackageStatus.Code)
	}
}

func TestDeliverPackage_AlreadyDelivered(t *testing.T) {
	// Arrange
	ctx := context.Background()
	packageID := uint(1)

	pkg := &domain.Package{
		ID:              packageID,
		BusinessID:      1,
		PropertyUnitID:  10,
		PackageStatusID: 2,
		PackageStatus: domain.PackageStatus{
			ID:      2,
			Code:    "delivered",
			Name:    "Delivered",
			IsFinal: true, // Ya está en estado final
		},
	}

	mockRepo := &mocks.PackageRepositoryMock{
		GetPackageByIDFunc: func(ctx context.Context, id uint) (*domain.Package, error) {
			return pkg, nil
		},
	}

	mockLogger := mocks.NewLoggerMock()
	useCase := app.New(mockRepo, mockLogger)

	dto := domain.DeliverPackageDTO{
		PackageID:         packageID,
		DeliveredByUserID: 100,
	}

	// Act
	result, err := useCase.DeliverPackage(ctx, dto)

	// Assert
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if !errors.Is(err, domain.ErrPackageAlreadyDelivered) {
		t.Errorf("expected ErrPackageAlreadyDelivered, got %v", err)
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}
}

func TestDeliverPackage_NotDeliverable(t *testing.T) {
	// Arrange
	ctx := context.Background()
	packageID := uint(1)

	// Paquete en estado "notified" que no permite entrega directa
	pkg := &domain.Package{
		ID:              packageID,
		BusinessID:      1,
		PropertyUnitID:  10,
		PackageStatusID: 3,
		PackageStatus: domain.PackageStatus{
			ID:      3,
			Code:    "notified",
			Name:    "Notified",
			IsFinal: false,
		},
	}

	mockRepo := &mocks.PackageRepositoryMock{
		GetPackageByIDFunc: func(ctx context.Context, id uint) (*domain.Package, error) {
			return pkg, nil
		},
	}

	mockLogger := mocks.NewLoggerMock()
	useCase := app.New(mockRepo, mockLogger)

	dto := domain.DeliverPackageDTO{
		PackageID:         packageID,
		DeliveredByUserID: 100,
	}

	// Act
	result, err := useCase.DeliverPackage(ctx, dto)

	// Assert
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if !errors.Is(err, domain.ErrPackageNotDeliverable) {
		t.Errorf("expected ErrPackageNotDeliverable, got %v", err)
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}
}

func TestDeliverPackage_PackageNotFound(t *testing.T) {
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

	dto := domain.DeliverPackageDTO{
		PackageID:         packageID,
		DeliveredByUserID: 100,
	}

	// Act
	result, err := useCase.DeliverPackage(ctx, dto)

	// Assert
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if !errors.Is(err, domain.ErrPackageNotFound) {
		t.Errorf("expected ErrPackageNotFound, got %v", err)
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}
}

func TestDeliverPackage_InStorageStatus(t *testing.T) {
	// Arrange
	ctx := context.Background()
	packageID := uint(1)
	userID := uint(100)

	pkg := &domain.Package{
		ID:              packageID,
		BusinessID:      1,
		PropertyUnitID:  10,
		PackageStatusID: 1,
		PackageStatus: domain.PackageStatus{
			ID:      1,
			Code:    "in_storage", // También permitido para entrega
			Name:    "In Storage",
			IsFinal: false,
		},
	}

	deliveredStatus := &domain.PackageStatus{
		ID:      2,
		Code:    "delivered",
		Name:    "Delivered",
		IsFinal: true,
	}

	now := time.Now()
	updatedPkg := &domain.Package{
		ID:                packageID,
		BusinessID:        1,
		PropertyUnitID:    10,
		PackageStatusID:   2,
		DeliveredByUserID: &userID,
		DeliveredAt:       &now,
		PackageStatus: domain.PackageStatus{
			ID:      2,
			Code:    "delivered",
			Name:    "Delivered",
			IsFinal: true,
		},
	}

	callCount := 0
	mockRepo := &mocks.PackageRepositoryMock{
		GetPackageByIDFunc: func(ctx context.Context, id uint) (*domain.Package, error) {
			callCount++
			if callCount == 1 {
				return pkg, nil
			}
			return updatedPkg, nil
		},
		GetPackageStatusByCodeFunc: func(ctx context.Context, code string) (*domain.PackageStatus, error) {
			if code == "delivered" {
				return deliveredStatus, nil
			}
			return nil, errors.New("status not found")
		},
		UpdatePackageFunc: func(ctx context.Context, p *domain.Package) error {
			return nil
		},
	}

	mockLogger := mocks.NewLoggerMock()
	useCase := app.New(mockRepo, mockLogger)

	dto := domain.DeliverPackageDTO{
		PackageID:         packageID,
		DeliveredByUserID: userID,
	}

	// Act
	result, err := useCase.DeliverPackage(ctx, dto)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result.PackageStatus.Code != "delivered" {
		t.Errorf("expected status code 'delivered', got '%s'", result.PackageStatus.Code)
	}
}
