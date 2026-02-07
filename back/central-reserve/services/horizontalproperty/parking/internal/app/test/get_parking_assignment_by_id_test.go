package app_test

import (
	"context"
	"errors"
	"testing"

	"central_reserve/services/horizontalproperty/parking/internal/app"
	"central_reserve/services/horizontalproperty/parking/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/parking/internal/domain"
)

func TestGetParkingAssignmentByID_Success(t *testing.T) {
	// Arrange
	ctx := context.Background()
	assignmentID := uint(1)
	propertyUnitID := uint(10)
	residentID := uint(50)

	expectedAssignment := &domain.ParkingAssignment{
		ID:             assignmentID,
		BusinessID:     100,
		ParkingSlotID:  1,
		PropertyUnitID: &propertyUnitID,
		ResidentID:     &residentID,
		VehiclePlate:   "ABC123",
		VehicleBrand:   "Toyota",
		VehicleModel:   "Corolla",
		IsActive:       true,
	}

	mockAssignmentRepo := &mocks.ParkingAssignmentRepositoryMock{
		GetParkingAssignmentByIDFn: func(ctx context.Context, id uint) (*domain.ParkingAssignment, error) {
			if id == assignmentID {
				return expectedAssignment, nil
			}
			return nil, nil
		},
	}

	mockLogger := mocks.NewMockLogger()
	useCase := app.New(
		&mocks.ParkingZoneRepositoryMock{},
		&mocks.ParkingSlotRepositoryMock{},
		mockAssignmentRepo,
		&mocks.ParkingReservationRepositoryMock{},
		&mocks.ParkingOccupancyRepositoryMock{},
		&mocks.ParkingTypeRepositoryMock{},
		mockLogger,
	)

	// Act
	result, err := useCase.GetParkingAssignmentByID(ctx, assignmentID)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result == nil {
		t.Fatal("expected assignment, got nil")
	}

	if result.ID != expectedAssignment.ID {
		t.Errorf("expected ID %d, got %d", expectedAssignment.ID, result.ID)
	}

	if result.VehiclePlate != expectedAssignment.VehiclePlate {
		t.Errorf("expected VehiclePlate %s, got %s", expectedAssignment.VehiclePlate, result.VehiclePlate)
	}
}

func TestGetParkingAssignmentByID_NotFound(t *testing.T) {
	// Arrange
	ctx := context.Background()
	assignmentID := uint(999)

	mockAssignmentRepo := &mocks.ParkingAssignmentRepositoryMock{
		GetParkingAssignmentByIDFn: func(ctx context.Context, id uint) (*domain.ParkingAssignment, error) {
			return nil, nil
		},
	}

	mockLogger := mocks.NewMockLogger()
	useCase := app.New(
		&mocks.ParkingZoneRepositoryMock{},
		&mocks.ParkingSlotRepositoryMock{},
		mockAssignmentRepo,
		&mocks.ParkingReservationRepositoryMock{},
		&mocks.ParkingOccupancyRepositoryMock{},
		&mocks.ParkingTypeRepositoryMock{},
		mockLogger,
	)

	// Act
	result, err := useCase.GetParkingAssignmentByID(ctx, assignmentID)

	// Assert
	if err != domain.ErrParkingAssignmentNotFound {
		t.Errorf("expected ErrParkingAssignmentNotFound, got %v", err)
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}
}

func TestGetParkingAssignmentByID_RepositoryError(t *testing.T) {
	// Arrange
	ctx := context.Background()
	assignmentID := uint(1)
	expectedErr := errors.New("database error")

	mockAssignmentRepo := &mocks.ParkingAssignmentRepositoryMock{
		GetParkingAssignmentByIDFn: func(ctx context.Context, id uint) (*domain.ParkingAssignment, error) {
			return nil, expectedErr
		},
	}

	mockLogger := mocks.NewMockLogger()
	useCase := app.New(
		&mocks.ParkingZoneRepositoryMock{},
		&mocks.ParkingSlotRepositoryMock{},
		mockAssignmentRepo,
		&mocks.ParkingReservationRepositoryMock{},
		&mocks.ParkingOccupancyRepositoryMock{},
		&mocks.ParkingTypeRepositoryMock{},
		mockLogger,
	)

	// Act
	result, err := useCase.GetParkingAssignmentByID(ctx, assignmentID)

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
