package app_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"central_reserve/services/horizontalproperty/parking/internal/app"
	"central_reserve/services/horizontalproperty/parking/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/parking/internal/domain"
)

func TestGetParkingReservationByID_Success(t *testing.T) {
	// Arrange
	ctx := context.Background()
	reservationID := uint(1)
	propertyUnitID := uint(10)
	reservationDate, _ := time.Parse("2006-01-02", "2024-01-15")

	expectedReservation := &domain.ParkingReservation{
		ID:                  reservationID,
		BusinessID:          100,
		ParkingSlotID:       1,
		PropertyUnitID:      &propertyUnitID,
		ReservationStatusID: 1,
		VehiclePlate:        "ABC123",
		ReservationDate:     reservationDate,
		StartTime:           "08:00",
		EndTime:             "18:00",
	}

	mockReservationRepo := &mocks.ParkingReservationRepositoryMock{
		GetParkingReservationByIDFn: func(ctx context.Context, id uint) (*domain.ParkingReservation, error) {
			if id == reservationID {
				return expectedReservation, nil
			}
			return nil, nil
		},
	}

	mockLogger := mocks.NewMockLogger()
	useCase := app.New(
		&mocks.ParkingZoneRepositoryMock{},
		&mocks.ParkingSlotRepositoryMock{},
		&mocks.ParkingAssignmentRepositoryMock{},
		mockReservationRepo,
		&mocks.ParkingOccupancyRepositoryMock{},
		&mocks.ParkingTypeRepositoryMock{},
		mockLogger,
	)

	// Act
	result, err := useCase.GetParkingReservationByID(ctx, reservationID)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result == nil {
		t.Fatal("expected reservation, got nil")
	}

	if result.ID != expectedReservation.ID {
		t.Errorf("expected ID %d, got %d", expectedReservation.ID, result.ID)
	}

	if result.VehiclePlate != expectedReservation.VehiclePlate {
		t.Errorf("expected VehiclePlate %s, got %s", expectedReservation.VehiclePlate, result.VehiclePlate)
	}
}

func TestGetParkingReservationByID_NotFound(t *testing.T) {
	// Arrange
	ctx := context.Background()
	reservationID := uint(999)

	mockReservationRepo := &mocks.ParkingReservationRepositoryMock{
		GetParkingReservationByIDFn: func(ctx context.Context, id uint) (*domain.ParkingReservation, error) {
			return nil, nil
		},
	}

	mockLogger := mocks.NewMockLogger()
	useCase := app.New(
		&mocks.ParkingZoneRepositoryMock{},
		&mocks.ParkingSlotRepositoryMock{},
		&mocks.ParkingAssignmentRepositoryMock{},
		mockReservationRepo,
		&mocks.ParkingOccupancyRepositoryMock{},
		&mocks.ParkingTypeRepositoryMock{},
		mockLogger,
	)

	// Act
	result, err := useCase.GetParkingReservationByID(ctx, reservationID)

	// Assert
	if err != domain.ErrParkingReservationNotFound {
		t.Errorf("expected ErrParkingReservationNotFound, got %v", err)
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}
}

func TestGetParkingReservationByID_RepositoryError(t *testing.T) {
	// Arrange
	ctx := context.Background()
	reservationID := uint(1)
	expectedErr := errors.New("database error")

	mockReservationRepo := &mocks.ParkingReservationRepositoryMock{
		GetParkingReservationByIDFn: func(ctx context.Context, id uint) (*domain.ParkingReservation, error) {
			return nil, expectedErr
		},
	}

	mockLogger := mocks.NewMockLogger()
	useCase := app.New(
		&mocks.ParkingZoneRepositoryMock{},
		&mocks.ParkingSlotRepositoryMock{},
		&mocks.ParkingAssignmentRepositoryMock{},
		mockReservationRepo,
		&mocks.ParkingOccupancyRepositoryMock{},
		&mocks.ParkingTypeRepositoryMock{},
		mockLogger,
	)

	// Act
	result, err := useCase.GetParkingReservationByID(ctx, reservationID)

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
