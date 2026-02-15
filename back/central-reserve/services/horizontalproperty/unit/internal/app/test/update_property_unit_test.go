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

func TestUpdatePropertyUnit_Success(t *testing.T) {
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

	newDescription := "Apartamento remodelado"
	newArea := 90.0
	isActive := false

	updateDTO := domain.UpdatePropertyUnitDTO{
		Description: &newDescription,
		Area:        &newArea,
		IsActive:    &isActive,
	}

	// Configurar mock: obtener unidad existente
	mockRepo.GetPropertyUnitByIDFunc = func(ctx context.Context, id uint) (*domain.PropertyUnit, error) {
		if id == 1 {
			return existingUnit, nil
		}
		return nil, errors.New("unexpected call")
	}

	// Configurar mock: actualizar unidad
	mockRepo.UpdatePropertyUnitFunc = func(ctx context.Context, id uint, unit *domain.PropertyUnit) (*domain.PropertyUnit, error) {
		if id == 1 {
			unit.UpdatedAt = time.Now()
			return unit, nil
		}
		return nil, errors.New("unexpected call")
	}

	uc := app.New(mockRepo, mockLogger)

	// Act
	result, err := uc.UpdatePropertyUnit(ctx, 1, updateDTO)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result == nil {
		t.Fatal("expected result, got nil")
	}

	if result.Description != newDescription {
		t.Errorf("expected Description '%s', got '%s'", newDescription, result.Description)
	}

	if result.Area == nil || *result.Area != newArea {
		t.Errorf("expected Area %.2f, got %v", newArea, result.Area)
	}

	if result.IsActive != isActive {
		t.Errorf("expected IsActive %v, got %v", isActive, result.IsActive)
	}

	// Verificar que campos no modificados se mantienen
	if result.Number != existingUnit.Number {
		t.Errorf("expected Number to remain '%s', got '%s'", existingUnit.Number, result.Number)
	}
}

func TestUpdatePropertyUnit_NotFound(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := &mocks.MockPropertyUnitRepository{}
	mockLogger := mocks.NewMockLogger()

	updateDTO := domain.UpdatePropertyUnitDTO{}

	// Configurar mock: unidad no existe
	mockRepo.GetPropertyUnitByIDFunc = func(ctx context.Context, id uint) (*domain.PropertyUnit, error) {
		return nil, nil
	}

	uc := app.New(mockRepo, mockLogger)

	// Act
	result, err := uc.UpdatePropertyUnit(ctx, 999, updateDTO)

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

func TestUpdatePropertyUnit_NumberExists(t *testing.T) {
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

	newNumber := "102"
	updateDTO := domain.UpdatePropertyUnitDTO{
		Number: &newNumber,
	}

	// Configurar mock: obtener unidad existente
	mockRepo.GetPropertyUnitByIDFunc = func(ctx context.Context, id uint) (*domain.PropertyUnit, error) {
		if id == 1 {
			return existingUnit, nil
		}
		return nil, errors.New("unexpected call")
	}

	// Configurar mock: nuevo numero ya existe
	mockRepo.ExistsPropertyUnitByNumberFunc = func(ctx context.Context, businessID uint, number string, excludeID uint) (bool, error) {
		if businessID == 1 && number == "102" && excludeID == 1 {
			return true, nil // Ya existe otra unidad con ese numero
		}
		return false, errors.New("unexpected call")
	}

	uc := app.New(mockRepo, mockLogger)

	// Act
	result, err := uc.UpdatePropertyUnit(ctx, 1, updateDTO)

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

func TestUpdatePropertyUnit_SameNumberAllowed(t *testing.T) {
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

	sameNumber := "101" // Mismo numero actual
	newDescription := "Descripcion actualizada"
	updateDTO := domain.UpdatePropertyUnitDTO{
		Number:      &sameNumber,
		Description: &newDescription,
	}

	// Configurar mock: obtener unidad existente
	mockRepo.GetPropertyUnitByIDFunc = func(ctx context.Context, id uint) (*domain.PropertyUnit, error) {
		if id == 1 {
			return existingUnit, nil
		}
		return nil, errors.New("unexpected call")
	}

	// Configurar mock: actualizar (no debe verificar numero porque es el mismo)
	mockRepo.UpdatePropertyUnitFunc = func(ctx context.Context, id uint, unit *domain.PropertyUnit) (*domain.PropertyUnit, error) {
		if id == 1 {
			unit.UpdatedAt = time.Now()
			return unit, nil
		}
		return nil, errors.New("unexpected call")
	}

	uc := app.New(mockRepo, mockLogger)

	// Act
	result, err := uc.UpdatePropertyUnit(ctx, 1, updateDTO)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result == nil {
		t.Fatal("expected result, got nil")
	}

	if result.Number != sameNumber {
		t.Errorf("expected Number '%s', got '%s'", sameNumber, result.Number)
	}

	if result.Description != newDescription {
		t.Errorf("expected Description '%s', got '%s'", newDescription, result.Description)
	}
}

func TestUpdatePropertyUnit_RepositoryError(t *testing.T) {
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

	updateDTO := domain.UpdatePropertyUnitDTO{}
	expectedError := errors.New("database connection failed")

	// Configurar mock: obtener unidad existente
	mockRepo.GetPropertyUnitByIDFunc = func(ctx context.Context, id uint) (*domain.PropertyUnit, error) {
		if id == 1 {
			return existingUnit, nil
		}
		return nil, errors.New("unexpected call")
	}

	// Configurar mock: error al actualizar
	mockRepo.UpdatePropertyUnitFunc = func(ctx context.Context, id uint, unit *domain.PropertyUnit) (*domain.PropertyUnit, error) {
		return nil, expectedError
	}

	uc := app.New(mockRepo, mockLogger)

	// Act
	result, err := uc.UpdatePropertyUnit(ctx, 1, updateDTO)

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

func TestUpdatePropertyUnit_GetError(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := &mocks.MockPropertyUnitRepository{}
	mockLogger := mocks.NewMockLogger()

	updateDTO := domain.UpdatePropertyUnitDTO{}
	expectedError := errors.New("database connection failed")

	// Configurar mock: error al obtener unidad
	mockRepo.GetPropertyUnitByIDFunc = func(ctx context.Context, id uint) (*domain.PropertyUnit, error) {
		return nil, expectedError
	}

	uc := app.New(mockRepo, mockLogger)

	// Act
	result, err := uc.UpdatePropertyUnit(ctx, 1, updateDTO)

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
