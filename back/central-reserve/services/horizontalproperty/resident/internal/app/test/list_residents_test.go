package app_test

import (
	"central_reserve/services/horizontalproperty/resident/internal/app"
	"central_reserve/services/horizontalproperty/resident/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/resident/internal/domain"
	"context"
	"errors"
	"testing"
)

func TestListResidents_Success(t *testing.T) {
	// Arrange
	ctx := context.Background()
	expectedResult := &domain.PaginatedResidentsDTO{
		Residents: []domain.ResidentListDTO{
			{
				ID:                 1,
				PropertyUnitNumber: "101",
				ResidentTypeName:   "Propietario",
				Name:               "Juan Pérez",
				Email:              "juan@test.com",
				Phone:              "1234567890",
				IsMainResident:     true,
				IsActive:           true,
			},
			{
				ID:                 2,
				PropertyUnitNumber: "102",
				ResidentTypeName:   "Arrendatario",
				Name:               "María García",
				Email:              "maria@test.com",
				Phone:              "0987654321",
				IsMainResident:     true,
				IsActive:           true,
			},
		},
		Total:      2,
		Page:       1,
		PageSize:   10,
		TotalPages: 1,
	}

	mockRepo := &mocks.MockResidentRepository{
		ListResidentsFunc: func(ctx context.Context, filters domain.ResidentFiltersDTO) (*domain.PaginatedResidentsDTO, error) {
			return expectedResult, nil
		},
	}

	mockLogger := mocks.NewMockLogger()
	useCase := app.New(mockRepo, mockLogger)

	filters := domain.ResidentFiltersDTO{
		BusinessID: 100,
		Page:       1,
		PageSize:   10,
	}

	// Act
	result, err := useCase.ListResidents(ctx, filters)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result == nil {
		t.Fatal("expected result, got nil")
	}

	if result.Total != expectedResult.Total {
		t.Errorf("expected total %d, got %d", expectedResult.Total, result.Total)
	}

	if len(result.Residents) != len(expectedResult.Residents) {
		t.Errorf("expected %d residents, got %d", len(expectedResult.Residents), len(result.Residents))
	}

	if result.Page != expectedResult.Page {
		t.Errorf("expected page %d, got %d", expectedResult.Page, result.Page)
	}

	if result.PageSize != expectedResult.PageSize {
		t.Errorf("expected page size %d, got %d", expectedResult.PageSize, result.PageSize)
	}
}

func TestListResidents_DefaultPagination(t *testing.T) {
	// Arrange
	ctx := context.Background()
	var capturedFilters domain.ResidentFiltersDTO

	mockRepo := &mocks.MockResidentRepository{
		ListResidentsFunc: func(ctx context.Context, filters domain.ResidentFiltersDTO) (*domain.PaginatedResidentsDTO, error) {
			capturedFilters = filters
			return &domain.PaginatedResidentsDTO{
				Residents:  []domain.ResidentListDTO{},
				Total:      0,
				Page:       filters.Page,
				PageSize:   filters.PageSize,
				TotalPages: 0,
			}, nil
		},
	}

	mockLogger := mocks.NewMockLogger()
	useCase := app.New(mockRepo, mockLogger)

	// Filtros con paginación inválida
	filters := domain.ResidentFiltersDTO{
		BusinessID: 100,
		Page:       0, // Inválido, debe convertirse a 1
		PageSize:   0, // Inválido, debe convertirse a 10
	}

	// Act
	result, err := useCase.ListResidents(ctx, filters)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if capturedFilters.Page != 1 {
		t.Errorf("expected default page 1, got %d", capturedFilters.Page)
	}

	if capturedFilters.PageSize != 10 {
		t.Errorf("expected default page size 10, got %d", capturedFilters.PageSize)
	}

	if result.Page != 1 {
		t.Errorf("expected result page 1, got %d", result.Page)
	}

	if result.PageSize != 10 {
		t.Errorf("expected result page size 10, got %d", result.PageSize)
	}
}

func TestListResidents_MaxPageSize(t *testing.T) {
	// Arrange
	ctx := context.Background()
	var capturedFilters domain.ResidentFiltersDTO

	mockRepo := &mocks.MockResidentRepository{
		ListResidentsFunc: func(ctx context.Context, filters domain.ResidentFiltersDTO) (*domain.PaginatedResidentsDTO, error) {
			capturedFilters = filters
			return &domain.PaginatedResidentsDTO{
				Residents:  []domain.ResidentListDTO{},
				Total:      0,
				Page:       filters.Page,
				PageSize:   filters.PageSize,
				TotalPages: 0,
			}, nil
		},
	}

	mockLogger := mocks.NewMockLogger()
	useCase := app.New(mockRepo, mockLogger)

	// Filtros con PageSize mayor a 100
	filters := domain.ResidentFiltersDTO{
		BusinessID: 100,
		Page:       1,
		PageSize:   200, // Mayor al máximo permitido
	}

	// Act
	result, err := useCase.ListResidents(ctx, filters)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if capturedFilters.PageSize != 10 {
		t.Errorf("expected page size limited to 10, got %d", capturedFilters.PageSize)
	}

	if result.PageSize != 10 {
		t.Errorf("expected result page size 10, got %d", result.PageSize)
	}
}

func TestListResidents_WithFilters(t *testing.T) {
	// Arrange
	ctx := context.Background()
	isActive := true
	isMainResident := true
	propertyUnitID := uint(200)
	residentTypeID := uint(1)

	expectedResult := &domain.PaginatedResidentsDTO{
		Residents: []domain.ResidentListDTO{
			{
				ID:                 1,
				PropertyUnitNumber: "101",
				ResidentTypeName:   "Propietario",
				Name:               "Juan Pérez",
				Email:              "juan@test.com",
				Phone:              "1234567890",
				IsMainResident:     true,
				IsActive:           true,
			},
		},
		Total:      1,
		Page:       1,
		PageSize:   10,
		TotalPages: 1,
	}

	mockRepo := &mocks.MockResidentRepository{
		ListResidentsFunc: func(ctx context.Context, filters domain.ResidentFiltersDTO) (*domain.PaginatedResidentsDTO, error) {
			return expectedResult, nil
		},
	}

	mockLogger := mocks.NewMockLogger()
	useCase := app.New(mockRepo, mockLogger)

	filters := domain.ResidentFiltersDTO{
		BusinessID:         100,
		PropertyUnitNumber: "101",
		Name:               "Juan",
		Dni:                "12345678",
		PropertyUnitID:     &propertyUnitID,
		ResidentTypeID:     &residentTypeID,
		IsActive:           &isActive,
		IsMainResident:     &isMainResident,
		Page:               1,
		PageSize:           10,
	}

	// Act
	result, err := useCase.ListResidents(ctx, filters)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result == nil {
		t.Fatal("expected result, got nil")
	}

	if result.Total != 1 {
		t.Errorf("expected total 1, got %d", result.Total)
	}

	if len(result.Residents) != 1 {
		t.Errorf("expected 1 resident, got %d", len(result.Residents))
	}
}

func TestListResidents_RepositoryError(t *testing.T) {
	// Arrange
	ctx := context.Background()
	expectedErr := errors.New("database connection error")

	mockRepo := &mocks.MockResidentRepository{
		ListResidentsFunc: func(ctx context.Context, filters domain.ResidentFiltersDTO) (*domain.PaginatedResidentsDTO, error) {
			return nil, expectedErr
		},
	}

	mockLogger := mocks.NewMockLogger()
	useCase := app.New(mockRepo, mockLogger)

	filters := domain.ResidentFiltersDTO{
		BusinessID: 100,
		Page:       1,
		PageSize:   10,
	}

	// Act
	result, err := useCase.ListResidents(ctx, filters)

	// Assert
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if !errors.Is(err, expectedErr) {
		t.Errorf("expected error %v, got %v", expectedErr, err)
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}
}
