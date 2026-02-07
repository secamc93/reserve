package app_test

import (
	"context"
	"errors"
	"testing"

	"central_reserve/services/horizontalproperty/unit/internal/app"
	"central_reserve/services/horizontalproperty/unit/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/unit/internal/domain"
)

func TestListPropertyUnits_Success(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := &mocks.MockPropertyUnitRepository{}
	mockLogger := mocks.NewMockLogger()

	floor1 := 5
	floor2 := 6
	area1 := 85.5
	area2 := 90.0
	bedrooms := 3
	bathrooms := 2
	coefficient1 := 0.025
	coefficient2 := 0.028

	filters := domain.PropertyUnitFiltersDTO{
		BusinessID: 1,
		Page:       1,
		PageSize:   10,
	}

	expectedResult := &domain.PaginatedPropertyUnitsDTO{
		Units: []domain.PropertyUnitListDTO{
			{
				ID:                       1,
				Number:                   "101",
				Floor:                    &floor1,
				Block:                    "A",
				UnitType:                 "apartment",
				Area:                     &area1,
				Bedrooms:                 &bedrooms,
				Bathrooms:                &bathrooms,
				ParticipationCoefficient: &coefficient1,
				IsActive:                 true,
			},
			{
				ID:                       2,
				Number:                   "102",
				Floor:                    &floor2,
				Block:                    "A",
				UnitType:                 "apartment",
				Area:                     &area2,
				Bedrooms:                 &bedrooms,
				Bathrooms:                &bathrooms,
				ParticipationCoefficient: &coefficient2,
				IsActive:                 true,
			},
		},
		Total:      2,
		Page:       1,
		PageSize:   10,
		TotalPages: 1,
	}

	// Configurar mock
	mockRepo.ListPropertyUnitsFunc = func(ctx context.Context, filters domain.PropertyUnitFiltersDTO) (*domain.PaginatedPropertyUnitsDTO, error) {
		if filters.BusinessID == 1 && filters.Page == 1 && filters.PageSize == 10 {
			return expectedResult, nil
		}
		return nil, errors.New("unexpected call")
	}

	uc := app.New(mockRepo, mockLogger)

	// Act
	result, err := uc.ListPropertyUnits(ctx, filters)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result == nil {
		t.Fatal("expected result, got nil")
	}

	if result.Total != 2 {
		t.Errorf("expected Total 2, got %d", result.Total)
	}

	if result.Page != 1 {
		t.Errorf("expected Page 1, got %d", result.Page)
	}

	if result.PageSize != 10 {
		t.Errorf("expected PageSize 10, got %d", result.PageSize)
	}

	if result.TotalPages != 1 {
		t.Errorf("expected TotalPages 1, got %d", result.TotalPages)
	}

	if len(result.Units) != 2 {
		t.Errorf("expected 2 units, got %d", len(result.Units))
	}

	// Verificar primer unidad
	if result.Units[0].Number != "101" {
		t.Errorf("expected first unit number '101', got '%s'", result.Units[0].Number)
	}

	// Verificar segunda unidad
	if result.Units[1].Number != "102" {
		t.Errorf("expected second unit number '102', got '%s'", result.Units[1].Number)
	}
}

func TestListPropertyUnits_DefaultPagination(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := &mocks.MockPropertyUnitRepository{}
	mockLogger := mocks.NewMockLogger()

	// Filtros con valores invalidos que deben normalizarse
	filters := domain.PropertyUnitFiltersDTO{
		BusinessID: 1,
		Page:       -1,   // Debe convertirse a 1
		PageSize:   2000, // Debe limitarse a 1000
	}

	expectedResult := &domain.PaginatedPropertyUnitsDTO{
		Units:      []domain.PropertyUnitListDTO{},
		Total:      0,
		Page:       1,
		PageSize:   1000,
		TotalPages: 0,
	}

	// Configurar mock: verificar que recibe valores normalizados
	mockRepo.ListPropertyUnitsFunc = func(ctx context.Context, filters domain.PropertyUnitFiltersDTO) (*domain.PaginatedPropertyUnitsDTO, error) {
		// Verificar que los valores fueron normalizados
		if filters.Page != 1 {
			t.Errorf("expected Page to be normalized to 1, got %d", filters.Page)
		}
		if filters.PageSize != 1000 {
			t.Errorf("expected PageSize to be capped at 1000, got %d", filters.PageSize)
		}
		return expectedResult, nil
	}

	uc := app.New(mockRepo, mockLogger)

	// Act
	result, err := uc.ListPropertyUnits(ctx, filters)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result == nil {
		t.Fatal("expected result, got nil")
	}
}

func TestListPropertyUnits_PageSizeZeroDefaultsTo10(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := &mocks.MockPropertyUnitRepository{}
	mockLogger := mocks.NewMockLogger()

	filters := domain.PropertyUnitFiltersDTO{
		BusinessID: 1,
		Page:       1,
		PageSize:   0, // Debe convertirse a 10
	}

	expectedResult := &domain.PaginatedPropertyUnitsDTO{
		Units:      []domain.PropertyUnitListDTO{},
		Total:      0,
		Page:       1,
		PageSize:   10,
		TotalPages: 0,
	}

	// Configurar mock
	mockRepo.ListPropertyUnitsFunc = func(ctx context.Context, filters domain.PropertyUnitFiltersDTO) (*domain.PaginatedPropertyUnitsDTO, error) {
		if filters.PageSize != 10 {
			t.Errorf("expected PageSize to be defaulted to 10, got %d", filters.PageSize)
		}
		return expectedResult, nil
	}

	uc := app.New(mockRepo, mockLogger)

	// Act
	result, err := uc.ListPropertyUnits(ctx, filters)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result == nil {
		t.Fatal("expected result, got nil")
	}
}

func TestListPropertyUnits_RepositoryError(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := &mocks.MockPropertyUnitRepository{}
	mockLogger := mocks.NewMockLogger()

	filters := domain.PropertyUnitFiltersDTO{
		BusinessID: 1,
		Page:       1,
		PageSize:   10,
	}

	expectedError := errors.New("database connection failed")

	// Configurar mock: error del repositorio
	mockRepo.ListPropertyUnitsFunc = func(ctx context.Context, filters domain.PropertyUnitFiltersDTO) (*domain.PaginatedPropertyUnitsDTO, error) {
		return nil, expectedError
	}

	uc := app.New(mockRepo, mockLogger)

	// Act
	result, err := uc.ListPropertyUnits(ctx, filters)

	// Assert
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if !errors.Is(err, expectedError) {
		t.Errorf("expected error '%v', got '%v'", expectedError, err)
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}
}

func TestListPropertyUnits_WithFilters(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := &mocks.MockPropertyUnitRepository{}
	mockLogger := mocks.NewMockLogger()

	floor := 5
	isActive := true

	filters := domain.PropertyUnitFiltersDTO{
		BusinessID: 1,
		UnitType:   "apartment",
		Floor:      &floor,
		Block:      "A",
		IsActive:   &isActive,
		Page:       1,
		PageSize:   10,
	}

	area := 85.5
	bedrooms := 3
	bathrooms := 2
	coefficient := 0.025

	expectedResult := &domain.PaginatedPropertyUnitsDTO{
		Units: []domain.PropertyUnitListDTO{
			{
				ID:                       1,
				Number:                   "101",
				Floor:                    &floor,
				Block:                    "A",
				UnitType:                 "apartment",
				Area:                     &area,
				Bedrooms:                 &bedrooms,
				Bathrooms:                &bathrooms,
				ParticipationCoefficient: &coefficient,
				IsActive:                 true,
			},
		},
		Total:      1,
		Page:       1,
		PageSize:   10,
		TotalPages: 1,
	}

	// Configurar mock
	mockRepo.ListPropertyUnitsFunc = func(ctx context.Context, filters domain.PropertyUnitFiltersDTO) (*domain.PaginatedPropertyUnitsDTO, error) {
		return expectedResult, nil
	}

	uc := app.New(mockRepo, mockLogger)

	// Act
	result, err := uc.ListPropertyUnits(ctx, filters)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result == nil {
		t.Fatal("expected result, got nil")
	}

	if len(result.Units) != 1 {
		t.Errorf("expected 1 unit, got %d", len(result.Units))
	}

	if result.Units[0].UnitType != "apartment" {
		t.Errorf("expected UnitType 'apartment', got '%s'", result.Units[0].UnitType)
	}

	if result.Units[0].Floor == nil || *result.Units[0].Floor != floor {
		t.Errorf("expected Floor %d, got %v", floor, result.Units[0].Floor)
	}

	if result.Units[0].Block != "A" {
		t.Errorf("expected Block 'A', got '%s'", result.Units[0].Block)
	}
}
