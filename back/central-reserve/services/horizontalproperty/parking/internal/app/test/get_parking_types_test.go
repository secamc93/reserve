package app_test

import (
	"context"
	"errors"
	"testing"

	"central_reserve/services/horizontalproperty/parking/internal/app"
	"central_reserve/services/horizontalproperty/parking/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/parking/internal/domain"
)

func TestGetParkingTypes_Success(t *testing.T) {
	// Arrange
	ctx := context.Background()
	expectedTypes := []*domain.ParkingType{
		{
			ID:          1,
			Name:        "Automóvil",
			Code:        "CAR",
			Description: "Espacio para automóvil",
			IsActive:    true,
		},
		{
			ID:          2,
			Name:        "Motocicleta",
			Code:        "MOTORCYCLE",
			Description: "Espacio para motocicleta",
			IsActive:    true,
		},
	}

	mockTypeRepo := &mocks.ParkingTypeRepositoryMock{
		GetActiveParkingTypesFn: func(ctx context.Context) ([]*domain.ParkingType, error) {
			return expectedTypes, nil
		},
	}

	mockLogger := mocks.NewMockLogger()
	useCase := app.New(
		&mocks.ParkingZoneRepositoryMock{},
		&mocks.ParkingSlotRepositoryMock{},
		&mocks.ParkingAssignmentRepositoryMock{},
		&mocks.ParkingReservationRepositoryMock{},
		&mocks.ParkingOccupancyRepositoryMock{},
		mockTypeRepo,
		mockLogger,
	)

	// Act
	result, err := useCase.GetParkingTypes(ctx)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result == nil {
		t.Fatal("expected types, got nil")
	}

	if len(result) != len(expectedTypes) {
		t.Errorf("expected %d types, got %d", len(expectedTypes), len(result))
	}

	if result[0].Code != expectedTypes[0].Code {
		t.Errorf("expected Code %s, got %s", expectedTypes[0].Code, result[0].Code)
	}
}

func TestGetParkingTypes_EmptyResult(t *testing.T) {
	// Arrange
	ctx := context.Background()

	mockTypeRepo := &mocks.ParkingTypeRepositoryMock{
		GetActiveParkingTypesFn: func(ctx context.Context) ([]*domain.ParkingType, error) {
			return []*domain.ParkingType{}, nil
		},
	}

	mockLogger := mocks.NewMockLogger()
	useCase := app.New(
		&mocks.ParkingZoneRepositoryMock{},
		&mocks.ParkingSlotRepositoryMock{},
		&mocks.ParkingAssignmentRepositoryMock{},
		&mocks.ParkingReservationRepositoryMock{},
		&mocks.ParkingOccupancyRepositoryMock{},
		mockTypeRepo,
		mockLogger,
	)

	// Act
	result, err := useCase.GetParkingTypes(ctx)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if len(result) != 0 {
		t.Errorf("expected 0 types, got %d", len(result))
	}
}

func TestGetParkingTypes_RepositoryError(t *testing.T) {
	// Arrange
	ctx := context.Background()
	expectedErr := errors.New("database error")

	mockTypeRepo := &mocks.ParkingTypeRepositoryMock{
		GetActiveParkingTypesFn: func(ctx context.Context) ([]*domain.ParkingType, error) {
			return nil, expectedErr
		},
	}

	mockLogger := mocks.NewMockLogger()
	useCase := app.New(
		&mocks.ParkingZoneRepositoryMock{},
		&mocks.ParkingSlotRepositoryMock{},
		&mocks.ParkingAssignmentRepositoryMock{},
		&mocks.ParkingReservationRepositoryMock{},
		&mocks.ParkingOccupancyRepositoryMock{},
		mockTypeRepo,
		mockLogger,
	)

	// Act
	result, err := useCase.GetParkingTypes(ctx)

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
