package app_test

import (
	"context"
	"errors"
	"testing"

	"central_reserve/services/horizontalproperty/parking/internal/app"
	"central_reserve/services/horizontalproperty/parking/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/parking/internal/domain"
)

func TestGetParkingSlotByID_Success(t *testing.T) {
	// Arrange
	ctx := context.Background()
	slotID := uint(1)
	expectedSlot := &domain.ParkingSlot{
		ID:            slotID,
		ParkingZoneID: 1,
		ParkingTypeID: 1,
		SlotNumber:    "A-101",
		IsCovered:     true,
		IsActive:      true,
	}

	mockSlotRepo := &mocks.ParkingSlotRepositoryMock{
		GetParkingSlotByIDFn: func(ctx context.Context, id uint) (*domain.ParkingSlot, error) {
			if id == slotID {
				return expectedSlot, nil
			}
			return nil, nil
		},
	}

	mockLogger := mocks.NewMockLogger()
	useCase := app.New(
		&mocks.ParkingZoneRepositoryMock{},
		mockSlotRepo,
		&mocks.ParkingAssignmentRepositoryMock{},
		&mocks.ParkingReservationRepositoryMock{},
		&mocks.ParkingOccupancyRepositoryMock{},
		&mocks.ParkingTypeRepositoryMock{},
		mockLogger,
	)

	// Act
	result, err := useCase.GetParkingSlotByID(ctx, slotID)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result == nil {
		t.Fatal("expected slot, got nil")
	}

	if result.ID != expectedSlot.ID {
		t.Errorf("expected ID %d, got %d", expectedSlot.ID, result.ID)
	}

	if result.SlotNumber != expectedSlot.SlotNumber {
		t.Errorf("expected SlotNumber %s, got %s", expectedSlot.SlotNumber, result.SlotNumber)
	}
}

func TestGetParkingSlotByID_NotFound(t *testing.T) {
	// Arrange
	ctx := context.Background()
	slotID := uint(999)

	mockSlotRepo := &mocks.ParkingSlotRepositoryMock{
		GetParkingSlotByIDFn: func(ctx context.Context, id uint) (*domain.ParkingSlot, error) {
			return nil, nil
		},
	}

	mockLogger := mocks.NewMockLogger()
	useCase := app.New(
		&mocks.ParkingZoneRepositoryMock{},
		mockSlotRepo,
		&mocks.ParkingAssignmentRepositoryMock{},
		&mocks.ParkingReservationRepositoryMock{},
		&mocks.ParkingOccupancyRepositoryMock{},
		&mocks.ParkingTypeRepositoryMock{},
		mockLogger,
	)

	// Act
	result, err := useCase.GetParkingSlotByID(ctx, slotID)

	// Assert
	if err != domain.ErrParkingSlotNotFound {
		t.Errorf("expected ErrParkingSlotNotFound, got %v", err)
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}
}

func TestGetParkingSlotByID_RepositoryError(t *testing.T) {
	// Arrange
	ctx := context.Background()
	slotID := uint(1)
	expectedErr := errors.New("database error")

	mockSlotRepo := &mocks.ParkingSlotRepositoryMock{
		GetParkingSlotByIDFn: func(ctx context.Context, id uint) (*domain.ParkingSlot, error) {
			return nil, expectedErr
		},
	}

	mockLogger := mocks.NewMockLogger()
	useCase := app.New(
		&mocks.ParkingZoneRepositoryMock{},
		mockSlotRepo,
		&mocks.ParkingAssignmentRepositoryMock{},
		&mocks.ParkingReservationRepositoryMock{},
		&mocks.ParkingOccupancyRepositoryMock{},
		&mocks.ParkingTypeRepositoryMock{},
		mockLogger,
	)

	// Act
	result, err := useCase.GetParkingSlotByID(ctx, slotID)

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
