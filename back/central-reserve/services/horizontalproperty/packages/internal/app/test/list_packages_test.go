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

func TestListPackages_Success(t *testing.T) {
	// Arrange
	ctx := context.Background()

	now := time.Now()
	packages := []domain.PackageListDTO{
		{
			ID:                 1,
			TrackingNumber:     "TRK001",
			Carrier:            "DHL",
			PropertyUnitNumber: "101",
			ResidentName:       "John Doe",
			StatusName:         "Received",
			StatusCode:         "received",
			ReceivedAt:         &now,
			CreatedAt:          now,
		},
		{
			ID:                 2,
			TrackingNumber:     "TRK002",
			Carrier:            "FedEx",
			PropertyUnitNumber: "102",
			ResidentName:       "Jane Smith",
			StatusName:         "Delivered",
			StatusCode:         "delivered",
			ReceivedAt:         &now,
			DeliveredAt:        &now,
			CreatedAt:          now,
		},
	}

	expectedResult := &domain.PaginatedPackagesDTO{
		Packages:   packages,
		Total:      20,
		Page:       1,
		PageSize:   10,
		TotalPages: 2,
	}

	mockRepo := &mocks.PackageRepositoryMock{
		ListPackagesFunc: func(ctx context.Context, filters domain.PackageFiltersDTO) (*domain.PaginatedPackagesDTO, error) {
			return expectedResult, nil
		},
	}

	mockLogger := mocks.NewLoggerMock()
	useCase := app.New(mockRepo, mockLogger)

	filters := domain.PackageFiltersDTO{
		BusinessID: 1,
		Page:       1,
		PageSize:   10,
	}

	// Act
	result, err := useCase.ListPackages(ctx, filters)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result.Total != 20 {
		t.Errorf("expected total 20, got %d", result.Total)
	}

	if result.Page != 1 {
		t.Errorf("expected page 1, got %d", result.Page)
	}

	if result.PageSize != 10 {
		t.Errorf("expected page size 10, got %d", result.PageSize)
	}

	if result.TotalPages != 2 {
		t.Errorf("expected total pages 2, got %d", result.TotalPages)
	}

	if len(result.Packages) != 2 {
		t.Errorf("expected 2 packages, got %d", len(result.Packages))
	}
}

func TestListPackages_DefaultPagination(t *testing.T) {
	// Arrange
	ctx := context.Background()

	var capturedFilters domain.PackageFiltersDTO

	mockRepo := &mocks.PackageRepositoryMock{
		ListPackagesFunc: func(ctx context.Context, filters domain.PackageFiltersDTO) (*domain.PaginatedPackagesDTO, error) {
			capturedFilters = filters
			return &domain.PaginatedPackagesDTO{
				Packages:   []domain.PackageListDTO{},
				Total:      0,
				Page:       filters.Page,
				PageSize:   filters.PageSize,
				TotalPages: 0,
			}, nil
		},
	}

	mockLogger := mocks.NewLoggerMock()
	useCase := app.New(mockRepo, mockLogger)

	// Test con Page < 1
	filters := domain.PackageFiltersDTO{
		BusinessID: 1,
		Page:       0, // Inválido, debe defaultear a 1
		PageSize:   5,
	}

	// Act
	result, err := useCase.ListPackages(ctx, filters)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if capturedFilters.Page != 1 {
		t.Errorf("expected page to default to 1, got %d", capturedFilters.Page)
	}

	if result.Page != 1 {
		t.Errorf("expected result page 1, got %d", result.Page)
	}

	// Test con PageSize < 1
	filters = domain.PackageFiltersDTO{
		BusinessID: 1,
		Page:       2,
		PageSize:   0, // Inválido, debe defaultear a 10
	}

	// Act
	result, err = useCase.ListPackages(ctx, filters)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if capturedFilters.PageSize != 10 {
		t.Errorf("expected page size to default to 10, got %d", capturedFilters.PageSize)
	}
}

func TestListPackages_MaxPageSize(t *testing.T) {
	// Arrange
	ctx := context.Background()

	var capturedFilters domain.PackageFiltersDTO

	mockRepo := &mocks.PackageRepositoryMock{
		ListPackagesFunc: func(ctx context.Context, filters domain.PackageFiltersDTO) (*domain.PaginatedPackagesDTO, error) {
			capturedFilters = filters
			return &domain.PaginatedPackagesDTO{
				Packages:   []domain.PackageListDTO{},
				Total:      0,
				Page:       filters.Page,
				PageSize:   filters.PageSize,
				TotalPages: 0,
			}, nil
		},
	}

	mockLogger := mocks.NewLoggerMock()
	useCase := app.New(mockRepo, mockLogger)

	// Test con PageSize > 100
	filters := domain.PackageFiltersDTO{
		BusinessID: 1,
		Page:       1,
		PageSize:   200, // Excede el máximo, debe caparse a 100
	}

	// Act
	result, err := useCase.ListPackages(ctx, filters)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if capturedFilters.PageSize != 100 {
		t.Errorf("expected page size to be capped at 100, got %d", capturedFilters.PageSize)
	}

	if result.PageSize != 100 {
		t.Errorf("expected result page size 100, got %d", result.PageSize)
	}
}

func TestListPackages_WithFilters(t *testing.T) {
	// Arrange
	ctx := context.Background()

	propertyUnitID := uint(10)
	residentID := uint(50)
	statusID := uint(1)
	startDate := time.Now().Add(-24 * time.Hour)
	endDate := time.Now()

	var capturedFilters domain.PackageFiltersDTO

	mockRepo := &mocks.PackageRepositoryMock{
		ListPackagesFunc: func(ctx context.Context, filters domain.PackageFiltersDTO) (*domain.PaginatedPackagesDTO, error) {
			capturedFilters = filters
			return &domain.PaginatedPackagesDTO{
				Packages:   []domain.PackageListDTO{},
				Total:      5,
				Page:       filters.Page,
				PageSize:   filters.PageSize,
				TotalPages: 1,
			}, nil
		},
	}

	mockLogger := mocks.NewLoggerMock()
	useCase := app.New(mockRepo, mockLogger)

	filters := domain.PackageFiltersDTO{
		BusinessID:      1,
		PropertyUnitID:  &propertyUnitID,
		ResidentID:      &residentID,
		PackageStatusID: &statusID,
		StartDate:       &startDate,
		EndDate:         &endDate,
		Page:            1,
		PageSize:        10,
	}

	// Act
	result, err := useCase.ListPackages(ctx, filters)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if capturedFilters.PropertyUnitID == nil || *capturedFilters.PropertyUnitID != propertyUnitID {
		t.Errorf("expected property unit ID %d, got %v", propertyUnitID, capturedFilters.PropertyUnitID)
	}

	if capturedFilters.ResidentID == nil || *capturedFilters.ResidentID != residentID {
		t.Errorf("expected resident ID %d, got %v", residentID, capturedFilters.ResidentID)
	}

	if capturedFilters.PackageStatusID == nil || *capturedFilters.PackageStatusID != statusID {
		t.Errorf("expected status ID %d, got %v", statusID, capturedFilters.PackageStatusID)
	}

	if result.Total != 5 {
		t.Errorf("expected total 5, got %d", result.Total)
	}
}

func TestListPackages_RepositoryError(t *testing.T) {
	// Arrange
	ctx := context.Background()
	expectedError := errors.New("database connection failed")

	mockRepo := &mocks.PackageRepositoryMock{
		ListPackagesFunc: func(ctx context.Context, filters domain.PackageFiltersDTO) (*domain.PaginatedPackagesDTO, error) {
			return nil, expectedError
		},
	}

	mockLogger := mocks.NewLoggerMock()
	useCase := app.New(mockRepo, mockLogger)

	filters := domain.PackageFiltersDTO{
		BusinessID: 1,
		Page:       1,
		PageSize:   10,
	}

	// Act
	result, err := useCase.ListPackages(ctx, filters)

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

func TestListPackages_EmptyResults(t *testing.T) {
	// Arrange
	ctx := context.Background()

	mockRepo := &mocks.PackageRepositoryMock{
		ListPackagesFunc: func(ctx context.Context, filters domain.PackageFiltersDTO) (*domain.PaginatedPackagesDTO, error) {
			return &domain.PaginatedPackagesDTO{
				Packages:   []domain.PackageListDTO{},
				Total:      0,
				Page:       filters.Page,
				PageSize:   filters.PageSize,
				TotalPages: 0,
			}, nil
		},
	}

	mockLogger := mocks.NewLoggerMock()
	useCase := app.New(mockRepo, mockLogger)

	filters := domain.PackageFiltersDTO{
		BusinessID: 1,
		Page:       1,
		PageSize:   10,
	}

	// Act
	result, err := useCase.ListPackages(ctx, filters)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result.Total != 0 {
		t.Errorf("expected total 0, got %d", result.Total)
	}

	if len(result.Packages) != 0 {
		t.Errorf("expected 0 packages, got %d", len(result.Packages))
	}
}
