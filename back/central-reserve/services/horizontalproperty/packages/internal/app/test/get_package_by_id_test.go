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

func TestGetPackageByID_Success(t *testing.T) {
	// Arrange
	ctx := context.Background()
	packageID := uint(1)

	now := time.Now()
	expectedPkg := &domain.Package{
		ID:              packageID,
		BusinessID:      1,
		PropertyUnitID:  10,
		PackageStatusID: 1,
		Carrier:         "DHL",
		TrackingNumber:  "TRK001",
		QRCode:          "QR123456",
		ReceivedAt:      &now,
		CreatedAt:       now,
		PackageStatus: domain.PackageStatus{
			ID:      1,
			Code:    "received",
			Name:    "Received",
			IsFinal: false,
		},
		PropertyUnit: domain.PropertyUnit{
			ID:     10,
			Number: "101",
		},
	}

	mockRepo := &mocks.PackageRepositoryMock{
		GetPackageByIDFunc: func(ctx context.Context, id uint) (*domain.Package, error) {
			if id == packageID {
				return expectedPkg, nil
			}
			return nil, domain.ErrPackageNotFound
		},
	}

	mockLogger := mocks.NewLoggerMock()
	useCase := app.New(mockRepo, mockLogger)

	// Act
	result, err := useCase.GetPackageByID(ctx, packageID)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result.ID != packageID {
		t.Errorf("expected ID %d, got %d", packageID, result.ID)
	}

	if result.Carrier != "DHL" {
		t.Errorf("expected carrier 'DHL', got '%s'", result.Carrier)
	}

	if result.TrackingNumber != "TRK001" {
		t.Errorf("expected tracking number 'TRK001', got '%s'", result.TrackingNumber)
	}

	if result.PackageStatus.Code != "received" {
		t.Errorf("expected status code 'received', got '%s'", result.PackageStatus.Code)
	}
}

func TestGetPackageByID_NotFound(t *testing.T) {
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
	result, err := useCase.GetPackageByID(ctx, packageID)

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

func TestGetPackageByID_RepositoryError(t *testing.T) {
	// Arrange
	ctx := context.Background()
	packageID := uint(1)
	expectedError := errors.New("database connection failed")

	mockRepo := &mocks.PackageRepositoryMock{
		GetPackageByIDFunc: func(ctx context.Context, id uint) (*domain.Package, error) {
			return nil, expectedError
		},
	}

	mockLogger := mocks.NewLoggerMock()
	useCase := app.New(mockRepo, mockLogger)

	// Act
	result, err := useCase.GetPackageByID(ctx, packageID)

	// Assert
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if !errors.Is(err, expectedError) {
		t.Errorf("expected error %v, got %v", expectedError, err)
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}
}

func TestUpdatePackageStatus_Success(t *testing.T) {
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

	updatedPkg := &domain.Package{
		ID:              packageID,
		BusinessID:      1,
		PropertyUnitID:  10,
		PackageStatusID: 2,
		Notes:           "Status updated",
		PackageStatus: domain.PackageStatus{
			ID:      2,
			Code:    "in_storage",
			Name:    "In Storage",
			IsFinal: false,
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
		UpdatePackageFunc: func(ctx context.Context, p *domain.Package) error {
			return nil
		},
	}

	mockLogger := mocks.NewLoggerMock()
	useCase := app.New(mockRepo, mockLogger)

	dto := domain.UpdatePackageStatusDTO{
		PackageID:       packageID,
		PackageStatusID: 2,
		UpdatedByUserID: userID,
		Notes:           "Status updated",
	}

	// Act
	result, err := useCase.UpdatePackageStatus(ctx, dto)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result.PackageStatusID != 2 {
		t.Errorf("expected status ID 2, got %d", result.PackageStatusID)
	}

	if result.PackageStatus.Code != "in_storage" {
		t.Errorf("expected status code 'in_storage', got '%s'", result.PackageStatus.Code)
	}
}

func TestUpdatePackageStatus_FinalState(t *testing.T) {
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
			IsFinal: true, // Estado final, no se puede cambiar
		},
	}

	mockRepo := &mocks.PackageRepositoryMock{
		GetPackageByIDFunc: func(ctx context.Context, id uint) (*domain.Package, error) {
			return pkg, nil
		},
	}

	mockLogger := mocks.NewLoggerMock()
	useCase := app.New(mockRepo, mockLogger)

	dto := domain.UpdatePackageStatusDTO{
		PackageID:       packageID,
		PackageStatusID: 3,
		UpdatedByUserID: 100,
	}

	// Act
	result, err := useCase.UpdatePackageStatus(ctx, dto)

	// Assert
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if !errors.Is(err, domain.ErrInvalidStatusTransition) {
		t.Errorf("expected ErrInvalidStatusTransition, got %v", err)
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}
}

func TestUpdatePackageStatus_PackageNotFound(t *testing.T) {
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

	dto := domain.UpdatePackageStatusDTO{
		PackageID:       packageID,
		PackageStatusID: 2,
		UpdatedByUserID: 100,
	}

	// Act
	result, err := useCase.UpdatePackageStatus(ctx, dto)

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

func TestUpdatePackageStatus_UpdateError(t *testing.T) {
	// Arrange
	ctx := context.Background()
	packageID := uint(1)
	updateError := errors.New("database update failed")

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
		UpdatePackageFunc: func(ctx context.Context, p *domain.Package) error {
			return updateError
		},
	}

	mockLogger := mocks.NewLoggerMock()
	useCase := app.New(mockRepo, mockLogger)

	dto := domain.UpdatePackageStatusDTO{
		PackageID:       packageID,
		PackageStatusID: 2,
		UpdatedByUserID: 100,
	}

	// Act
	result, err := useCase.UpdatePackageStatus(ctx, dto)

	// Assert
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if !errors.Is(err, updateError) {
		t.Errorf("expected update error, got %v", err)
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}
}

func TestUpdatePackageStatus_WithNotes(t *testing.T) {
	// Arrange
	ctx := context.Background()
	packageID := uint(1)
	notes := "Package moved to storage room B"

	pkg := &domain.Package{
		ID:              packageID,
		BusinessID:      1,
		PropertyUnitID:  10,
		PackageStatusID: 1,
		Notes:           "",
		PackageStatus: domain.PackageStatus{
			ID:      1,
			Code:    "received",
			Name:    "Received",
			IsFinal: false,
		},
	}

	var updatedNotes string
	mockRepo := &mocks.PackageRepositoryMock{
		GetPackageByIDFunc: func(ctx context.Context, id uint) (*domain.Package, error) {
			return pkg, nil
		},
		UpdatePackageFunc: func(ctx context.Context, p *domain.Package) error {
			updatedNotes = p.Notes
			return nil
		},
	}

	mockLogger := mocks.NewLoggerMock()
	useCase := app.New(mockRepo, mockLogger)

	dto := domain.UpdatePackageStatusDTO{
		PackageID:       packageID,
		PackageStatusID: 2,
		UpdatedByUserID: 100,
		Notes:           notes,
	}

	// Act
	_, err := useCase.UpdatePackageStatus(ctx, dto)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if updatedNotes != notes {
		t.Errorf("expected notes '%s', got '%s'", notes, updatedNotes)
	}
}
