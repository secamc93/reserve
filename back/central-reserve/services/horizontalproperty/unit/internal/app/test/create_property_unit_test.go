package app_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"central_reserve/services/horizontalproperty/unit/internal/app"
	"central_reserve/services/horizontalproperty/unit/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/unit/internal/domain"
)

func TestCreatePropertyUnit_Success(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := &mocks.MockPropertyUnitRepository{}
	mockLogger := mocks.NewMockLogger()

	floor := 5
	area := 85.5
	bedrooms := 3
	bathrooms := 2
	coefficient := 0.025

	dto := domain.CreatePropertyUnitDTO{
		BusinessID:               1,
		Number:                   "101",
		Floor:                    &floor,
		Block:                    "A",
		UnitType:                 "apartment",
		Area:                     &area,
		Bedrooms:                 &bedrooms,
		Bathrooms:                &bathrooms,
		ParticipationCoefficient: &coefficient,
		Description:              "Apartamento esquinero",
	}

	// Configurar mock: numero no existe
	mockRepo.ExistsPropertyUnitByNumberFunc = func(ctx context.Context, businessID uint, number string, excludeID uint) (bool, error) {
		if businessID == 1 && number == "101" && excludeID == 0 {
			return false, nil
		}
		return false, errors.New("unexpected call")
	}

	// Configurar mock: crear unidad exitosamente
	mockRepo.CreatePropertyUnitFunc = func(ctx context.Context, unit *domain.PropertyUnit) (*domain.PropertyUnit, error) {
		unit.ID = 1
		unit.CreatedAt = time.Now()
		unit.UpdatedAt = time.Now()
		return unit, nil
	}

	uc := app.New(mockRepo, mockLogger)

	// Act
	result, err := uc.CreatePropertyUnit(ctx, dto)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result == nil {
		t.Fatal("expected result, got nil")
	}

	if result.ID != 1 {
		t.Errorf("expected ID 1, got %d", result.ID)
	}

	if result.Number != "101" {
		t.Errorf("expected number '101', got '%s'", result.Number)
	}

	if result.BusinessID != 1 {
		t.Errorf("expected BusinessID 1, got %d", result.BusinessID)
	}

	if !result.IsActive {
		t.Error("expected IsActive to be true")
	}

	if result.Floor == nil || *result.Floor != floor {
		t.Errorf("expected Floor %d, got %v", floor, result.Floor)
	}

	if result.Area == nil || *result.Area != area {
		t.Errorf("expected Area %.2f, got %v", area, result.Area)
	}
}

func TestCreatePropertyUnit_EmptyNumber(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := &mocks.MockPropertyUnitRepository{}
	mockLogger := mocks.NewMockLogger()

	dto := domain.CreatePropertyUnitDTO{
		BusinessID: 1,
		Number:     "", // Numero vacio
		Block:      "A",
	}

	uc := app.New(mockRepo, mockLogger)

	// Act
	result, err := uc.CreatePropertyUnit(ctx, dto)

	// Assert
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if !errors.Is(err, domain.ErrPropertyUnitNumberRequired) {
		t.Errorf("expected ErrPropertyUnitNumberRequired, got %v", err)
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}
}

func TestCreatePropertyUnit_NumberExists(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := &mocks.MockPropertyUnitRepository{}
	mockLogger := mocks.NewMockLogger()

	dto := domain.CreatePropertyUnitDTO{
		BusinessID: 1,
		Number:     "101",
		Block:      "A",
	}

	// Configurar mock: numero ya existe
	mockRepo.ExistsPropertyUnitByNumberFunc = func(ctx context.Context, businessID uint, number string, excludeID uint) (bool, error) {
		if businessID == 1 && number == "101" && excludeID == 0 {
			return true, nil // Ya existe
		}
		return false, errors.New("unexpected call")
	}

	uc := app.New(mockRepo, mockLogger)

	// Act
	result, err := uc.CreatePropertyUnit(ctx, dto)

	// Assert
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if !errors.Is(err, domain.ErrPropertyUnitNumberExists) {
		t.Errorf("expected ErrPropertyUnitNumberExists, got %v", err)
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}
}

func TestCreatePropertyUnit_RepositoryError(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := &mocks.MockPropertyUnitRepository{}
	mockLogger := mocks.NewMockLogger()

	dto := domain.CreatePropertyUnitDTO{
		BusinessID: 1,
		Number:     "101",
		Block:      "A",
	}

	expectedError := errors.New("database connection failed")

	// Configurar mock: numero no existe
	mockRepo.ExistsPropertyUnitByNumberFunc = func(ctx context.Context, businessID uint, number string, excludeID uint) (bool, error) {
		return false, nil
	}

	// Configurar mock: error al crear
	mockRepo.CreatePropertyUnitFunc = func(ctx context.Context, unit *domain.PropertyUnit) (*domain.PropertyUnit, error) {
		return nil, expectedError
	}

	uc := app.New(mockRepo, mockLogger)

	// Act
	result, err := uc.CreatePropertyUnit(ctx, dto)

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

func TestCreatePropertyUnit_ExistsCheckError(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := &mocks.MockPropertyUnitRepository{}
	mockLogger := mocks.NewMockLogger()

	dto := domain.CreatePropertyUnitDTO{
		BusinessID: 1,
		Number:     "101",
		Block:      "A",
	}

	expectedError := errors.New("database error during exists check")

	// Configurar mock: error al verificar si existe
	mockRepo.ExistsPropertyUnitByNumberFunc = func(ctx context.Context, businessID uint, number string, excludeID uint) (bool, error) {
		return false, expectedError
	}

	uc := app.New(mockRepo, mockLogger)

	// Act
	result, err := uc.CreatePropertyUnit(ctx, dto)

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
