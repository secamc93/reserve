package app_test

import (
	"context"
	"errors"
	"testing"

	"central_reserve/services/horizontalproperty/parking/internal/app"
	"central_reserve/services/horizontalproperty/parking/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/parking/internal/domain"
)

func TestGetParkingZoneByID_Success(t *testing.T) {
	// Arrange
	ctx := context.Background()
	zoneID := uint(1)
	expectedZone := &domain.ParkingZone{
		ID:          zoneID,
		BusinessID:  100,
		Name:        "Zona A",
		Code:        "ZONA_A",
		Description: "Zona de parqueo principal",
		TotalSlots:  50,
		IsActive:    true,
	}

	mockZoneRepo := &mocks.ParkingZoneRepositoryMock{
		GetParkingZoneByIDFn: func(ctx context.Context, id uint) (*domain.ParkingZone, error) {
			if id == zoneID {
				return expectedZone, nil
			}
			return nil, nil
		},
	}

	mockLogger := mocks.NewMockLogger()
	useCase := app.New(
		mockZoneRepo,
		&mocks.ParkingSlotRepositoryMock{},
		&mocks.ParkingAssignmentRepositoryMock{},
		&mocks.ParkingReservationRepositoryMock{},
		&mocks.ParkingOccupancyRepositoryMock{},
		&mocks.ParkingTypeRepositoryMock{},
		mockLogger,
	)

	// Act
	result, err := useCase.GetParkingZoneByID(ctx, zoneID)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result == nil {
		t.Fatal("expected zone, got nil")
	}

	if result.ID != expectedZone.ID {
		t.Errorf("expected ID %d, got %d", expectedZone.ID, result.ID)
	}

	if result.Name != expectedZone.Name {
		t.Errorf("expected Name %s, got %s", expectedZone.Name, result.Name)
	}
}

func TestGetParkingZoneByID_NotFound(t *testing.T) {
	// Arrange
	ctx := context.Background()
	zoneID := uint(999)

	mockZoneRepo := &mocks.ParkingZoneRepositoryMock{
		GetParkingZoneByIDFn: func(ctx context.Context, id uint) (*domain.ParkingZone, error) {
			return nil, nil
		},
	}

	mockLogger := mocks.NewMockLogger()
	useCase := app.New(
		mockZoneRepo,
		&mocks.ParkingSlotRepositoryMock{},
		&mocks.ParkingAssignmentRepositoryMock{},
		&mocks.ParkingReservationRepositoryMock{},
		&mocks.ParkingOccupancyRepositoryMock{},
		&mocks.ParkingTypeRepositoryMock{},
		mockLogger,
	)

	// Act
	result, err := useCase.GetParkingZoneByID(ctx, zoneID)

	// Assert
	if err != domain.ErrParkingZoneNotFound {
		t.Errorf("expected ErrParkingZoneNotFound, got %v", err)
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}
}

func TestGetParkingZoneByID_RepositoryError(t *testing.T) {
	// Arrange
	ctx := context.Background()
	zoneID := uint(1)
	expectedErr := errors.New("database error")

	mockZoneRepo := &mocks.ParkingZoneRepositoryMock{
		GetParkingZoneByIDFn: func(ctx context.Context, id uint) (*domain.ParkingZone, error) {
			return nil, expectedErr
		},
	}

	mockLogger := mocks.NewMockLogger()
	useCase := app.New(
		mockZoneRepo,
		&mocks.ParkingSlotRepositoryMock{},
		&mocks.ParkingAssignmentRepositoryMock{},
		&mocks.ParkingReservationRepositoryMock{},
		&mocks.ParkingOccupancyRepositoryMock{},
		&mocks.ParkingTypeRepositoryMock{},
		mockLogger,
	)

	// Act
	result, err := useCase.GetParkingZoneByID(ctx, zoneID)

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
