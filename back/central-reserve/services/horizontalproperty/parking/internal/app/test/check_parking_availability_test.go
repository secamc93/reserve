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

func TestCheckParkingAvailability_Available(t *testing.T) {
	// Arrange
	ctx := context.Background()
	reservationDate, _ := time.Parse("2006-01-02", "2024-01-15")

	dto := domain.CheckParkingAvailabilityDTO{
		ParkingSlotID:   1,
		ReservationDate: reservationDate,
		StartTime:       "08:00",
		EndTime:         "18:00",
	}

	mockSlotRepo := &mocks.ParkingSlotRepositoryMock{
		GetParkingSlotByIDFn: func(ctx context.Context, id uint) (*domain.ParkingSlot, error) {
			return &domain.ParkingSlot{
				ID:       1,
				IsActive: true,
			}, nil
		},
	}

	mockAssignmentRepo := &mocks.ParkingAssignmentRepositoryMock{
		GetActiveAssignmentBySlotIDFn: func(ctx context.Context, slotID uint) (*domain.ParkingAssignment, error) {
			return nil, nil // No hay asignación activa
		},
	}

	mockReservationRepo := &mocks.ParkingReservationRepositoryMock{
		CheckAvailabilityFn: func(ctx context.Context, d domain.CheckParkingAvailabilityDTO) (bool, error) {
			return true, nil
		},
	}

	mockLogger := mocks.NewMockLogger()
	useCase := app.New(
		&mocks.ParkingZoneRepositoryMock{},
		mockSlotRepo,
		mockAssignmentRepo,
		mockReservationRepo,
		&mocks.ParkingOccupancyRepositoryMock{},
		&mocks.ParkingTypeRepositoryMock{},
		mockLogger,
	)

	// Act
	result, err := useCase.CheckParkingAvailability(ctx, dto)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if !result {
		t.Error("expected slot to be available")
	}
}

func TestCheckParkingAvailability_NotAvailableHasActiveAssignment(t *testing.T) {
	// Arrange
	ctx := context.Background()
	reservationDate, _ := time.Parse("2006-01-02", "2024-01-15")

	dto := domain.CheckParkingAvailabilityDTO{
		ParkingSlotID:   1,
		ReservationDate: reservationDate,
		StartTime:       "08:00",
		EndTime:         "18:00",
	}

	mockSlotRepo := &mocks.ParkingSlotRepositoryMock{
		GetParkingSlotByIDFn: func(ctx context.Context, id uint) (*domain.ParkingSlot, error) {
			return &domain.ParkingSlot{
				ID:       1,
				IsActive: true,
			}, nil
		},
	}

	mockAssignmentRepo := &mocks.ParkingAssignmentRepositoryMock{
		GetActiveAssignmentBySlotIDFn: func(ctx context.Context, slotID uint) (*domain.ParkingAssignment, error) {
			return &domain.ParkingAssignment{
				ID:            1,
				ParkingSlotID: slotID,
				IsActive:      true,
			}, nil
		},
	}

	mockLogger := mocks.NewMockLogger()
	useCase := app.New(
		&mocks.ParkingZoneRepositoryMock{},
		mockSlotRepo,
		mockAssignmentRepo,
		&mocks.ParkingReservationRepositoryMock{},
		&mocks.ParkingOccupancyRepositoryMock{},
		&mocks.ParkingTypeRepositoryMock{},
		mockLogger,
	)

	// Act
	result, err := useCase.CheckParkingAvailability(ctx, dto)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result {
		t.Error("expected slot to be not available")
	}
}

func TestCheckParkingAvailability_SlotNotFound(t *testing.T) {
	// Arrange
	ctx := context.Background()
	reservationDate, _ := time.Parse("2006-01-02", "2024-01-15")

	dto := domain.CheckParkingAvailabilityDTO{
		ParkingSlotID:   999,
		ReservationDate: reservationDate,
		StartTime:       "08:00",
		EndTime:         "18:00",
	}

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
	result, err := useCase.CheckParkingAvailability(ctx, dto)

	// Assert
	if err != domain.ErrParkingSlotNotFound {
		t.Errorf("expected ErrParkingSlotNotFound, got %v", err)
	}

	if result {
		t.Error("expected false result")
	}
}

func TestCheckParkingAvailability_SlotInactive(t *testing.T) {
	// Arrange
	ctx := context.Background()
	reservationDate, _ := time.Parse("2006-01-02", "2024-01-15")

	dto := domain.CheckParkingAvailabilityDTO{
		ParkingSlotID:   1,
		ReservationDate: reservationDate,
		StartTime:       "08:00",
		EndTime:         "18:00",
	}

	mockSlotRepo := &mocks.ParkingSlotRepositoryMock{
		GetParkingSlotByIDFn: func(ctx context.Context, id uint) (*domain.ParkingSlot, error) {
			return &domain.ParkingSlot{
				ID:       1,
				IsActive: false,
			}, nil
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
	result, err := useCase.CheckParkingAvailability(ctx, dto)

	// Assert
	if err != domain.ErrParkingSlotInactive {
		t.Errorf("expected ErrParkingSlotInactive, got %v", err)
	}

	if result {
		t.Error("expected false result")
	}
}

func TestCheckParkingAvailability_RepositoryError(t *testing.T) {
	// Arrange
	ctx := context.Background()
	reservationDate, _ := time.Parse("2006-01-02", "2024-01-15")

	dto := domain.CheckParkingAvailabilityDTO{
		ParkingSlotID:   1,
		ReservationDate: reservationDate,
		StartTime:       "08:00",
		EndTime:         "18:00",
	}
	expectedErr := errors.New("database error")

	mockSlotRepo := &mocks.ParkingSlotRepositoryMock{
		GetParkingSlotByIDFn: func(ctx context.Context, id uint) (*domain.ParkingSlot, error) {
			return &domain.ParkingSlot{ID: 1, IsActive: true}, nil
		},
	}

	mockAssignmentRepo := &mocks.ParkingAssignmentRepositoryMock{
		GetActiveAssignmentBySlotIDFn: func(ctx context.Context, slotID uint) (*domain.ParkingAssignment, error) {
			return nil, nil
		},
	}

	mockReservationRepo := &mocks.ParkingReservationRepositoryMock{
		CheckAvailabilityFn: func(ctx context.Context, d domain.CheckParkingAvailabilityDTO) (bool, error) {
			return false, expectedErr
		},
	}

	mockLogger := mocks.NewMockLogger()
	useCase := app.New(
		&mocks.ParkingZoneRepositoryMock{},
		mockSlotRepo,
		mockAssignmentRepo,
		mockReservationRepo,
		&mocks.ParkingOccupancyRepositoryMock{},
		&mocks.ParkingTypeRepositoryMock{},
		mockLogger,
	)

	// Act
	result, err := useCase.CheckParkingAvailability(ctx, dto)

	// Assert
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if !errors.Is(err, expectedErr) {
		t.Errorf("expected error %v, got %v", expectedErr, err)
	}

	if result {
		t.Error("expected false result")
	}
}
