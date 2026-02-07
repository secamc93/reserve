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

func TestGetPropertyUnitByID_Success(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := &mocks.MockPropertyUnitRepository{}
	mockLogger := mocks.NewMockLogger()

	floor := 5
	area := 85.5
	bedrooms := 3
	bathrooms := 2
	coefficient := 0.025

	expectedUnit := &domain.PropertyUnit{
		ID:                       1,
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
		IsActive:                 true,
		CreatedAt:                time.Now(),
		UpdatedAt:                time.Now(),
	}

	// Configurar mock: unidad existe
	mockRepo.GetPropertyUnitByIDFunc = func(ctx context.Context, id uint) (*domain.PropertyUnit, error) {
		if id == 1 {
			return expectedUnit, nil
		}
		return nil, errors.New("unexpected call")
	}

	uc := app.New(mockRepo, mockLogger)

	// Act
	result, err := uc.GetPropertyUnitByID(ctx, 1)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result == nil {
		t.Fatal("expected result, got nil")
	}

	if result.ID != expectedUnit.ID {
		t.Errorf("expected ID %d, got %d", expectedUnit.ID, result.ID)
	}

	if result.Number != expectedUnit.Number {
		t.Errorf("expected number '%s', got '%s'", expectedUnit.Number, result.Number)
	}

	if result.BusinessID != expectedUnit.BusinessID {
		t.Errorf("expected BusinessID %d, got %d", expectedUnit.BusinessID, result.BusinessID)
	}

	if result.Block != expectedUnit.Block {
		t.Errorf("expected Block '%s', got '%s'", expectedUnit.Block, result.Block)
	}

	if result.UnitType != expectedUnit.UnitType {
		t.Errorf("expected UnitType '%s', got '%s'", expectedUnit.UnitType, result.UnitType)
	}

	if result.Description != expectedUnit.Description {
		t.Errorf("expected Description '%s', got '%s'", expectedUnit.Description, result.Description)
	}

	if result.IsActive != expectedUnit.IsActive {
		t.Errorf("expected IsActive %v, got %v", expectedUnit.IsActive, result.IsActive)
	}

	// Validar campos opcionales
	if result.Floor == nil || *result.Floor != *expectedUnit.Floor {
		t.Errorf("expected Floor %v, got %v", expectedUnit.Floor, result.Floor)
	}

	if result.Area == nil || *result.Area != *expectedUnit.Area {
		t.Errorf("expected Area %v, got %v", expectedUnit.Area, result.Area)
	}

	if result.Bedrooms == nil || *result.Bedrooms != *expectedUnit.Bedrooms {
		t.Errorf("expected Bedrooms %v, got %v", expectedUnit.Bedrooms, result.Bedrooms)
	}

	if result.Bathrooms == nil || *result.Bathrooms != *expectedUnit.Bathrooms {
		t.Errorf("expected Bathrooms %v, got %v", expectedUnit.Bathrooms, result.Bathrooms)
	}

	if result.ParticipationCoefficient == nil || *result.ParticipationCoefficient != *expectedUnit.ParticipationCoefficient {
		t.Errorf("expected ParticipationCoefficient %v, got %v", expectedUnit.ParticipationCoefficient, result.ParticipationCoefficient)
	}
}

func TestGetPropertyUnitByID_NotFound(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := &mocks.MockPropertyUnitRepository{}
	mockLogger := mocks.NewMockLogger()

	// Configurar mock: unidad no existe (retorna nil)
	mockRepo.GetPropertyUnitByIDFunc = func(ctx context.Context, id uint) (*domain.PropertyUnit, error) {
		return nil, nil
	}

	uc := app.New(mockRepo, mockLogger)

	// Act
	result, err := uc.GetPropertyUnitByID(ctx, 999)

	// Assert
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if !errors.Is(err, domain.ErrPropertyUnitNotFound) {
		t.Errorf("expected ErrPropertyUnitNotFound, got %v", err)
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}
}

func TestGetPropertyUnitByID_RepositoryError(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := &mocks.MockPropertyUnitRepository{}
	mockLogger := mocks.NewMockLogger()

	expectedError := errors.New("database connection failed")

	// Configurar mock: error del repositorio
	mockRepo.GetPropertyUnitByIDFunc = func(ctx context.Context, id uint) (*domain.PropertyUnit, error) {
		return nil, expectedError
	}

	uc := app.New(mockRepo, mockLogger)

	// Act
	result, err := uc.GetPropertyUnitByID(ctx, 1)

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
