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

func TestDeletePropertyUnit_Success(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := &mocks.MockPropertyUnitRepository{}
	mockLogger := mocks.NewMockLogger()

	floor := 5
	area := 85.5
	bedrooms := 3
	bathrooms := 2
	coefficient := 0.025

	existingUnit := &domain.PropertyUnit{
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

	// Configurar mock: obtener unidad existente
	mockRepo.GetPropertyUnitByIDFunc = func(ctx context.Context, id uint) (*domain.PropertyUnit, error) {
		if id == 1 {
			return existingUnit, nil
		}
		return nil, errors.New("unexpected call")
	}

	// Configurar mock: eliminar exitosamente
	deleted := false
	mockRepo.DeletePropertyUnitFunc = func(ctx context.Context, id uint) error {
		if id == 1 {
			deleted = true
			return nil
		}
		return errors.New("unexpected call")
	}

	uc := app.New(mockRepo, mockLogger)

	// Act
	err := uc.DeletePropertyUnit(ctx, 1)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if !deleted {
		t.Error("expected DeletePropertyUnit to be called")
	}
}

func TestDeletePropertyUnit_NotFound(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := &mocks.MockPropertyUnitRepository{}
	mockLogger := mocks.NewMockLogger()

	// Configurar mock: unidad no existe
	mockRepo.GetPropertyUnitByIDFunc = func(ctx context.Context, id uint) (*domain.PropertyUnit, error) {
		return nil, nil
	}

	uc := app.New(mockRepo, mockLogger)

	// Act
	err := uc.DeletePropertyUnit(ctx, 999)

	// Assert
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if !errors.Is(err, domain.ErrPropertyUnitNotFound) {
		t.Errorf("expected ErrPropertyUnitNotFound, got %v", err)
	}
}

func TestDeletePropertyUnit_GetError(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := &mocks.MockPropertyUnitRepository{}
	mockLogger := mocks.NewMockLogger()

	expectedError := errors.New("database connection failed")

	// Configurar mock: error al obtener unidad
	mockRepo.GetPropertyUnitByIDFunc = func(ctx context.Context, id uint) (*domain.PropertyUnit, error) {
		return nil, expectedError
	}

	uc := app.New(mockRepo, mockLogger)

	// Act
	err := uc.DeletePropertyUnit(ctx, 1)

	// Assert
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if !errors.Is(err, expectedError) {
		t.Errorf("expected error '%v', got '%v'", expectedError, err)
	}
}

func TestDeletePropertyUnit_RepositoryError(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := &mocks.MockPropertyUnitRepository{}
	mockLogger := mocks.NewMockLogger()

	floor := 5
	area := 85.5
	bedrooms := 3
	bathrooms := 2
	coefficient := 0.025

	existingUnit := &domain.PropertyUnit{
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

	expectedError := errors.New("cannot delete unit with active residents")

	// Configurar mock: obtener unidad existente
	mockRepo.GetPropertyUnitByIDFunc = func(ctx context.Context, id uint) (*domain.PropertyUnit, error) {
		if id == 1 {
			return existingUnit, nil
		}
		return nil, errors.New("unexpected call")
	}

	// Configurar mock: error al eliminar
	mockRepo.DeletePropertyUnitFunc = func(ctx context.Context, id uint) error {
		return expectedError
	}

	uc := app.New(mockRepo, mockLogger)

	// Act
	err := uc.DeletePropertyUnit(ctx, 1)

	// Assert
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if !errors.Is(err, expectedError) {
		t.Errorf("expected error '%v', got '%v'", expectedError, err)
	}
}
