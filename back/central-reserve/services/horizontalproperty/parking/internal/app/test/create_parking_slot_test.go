package app_test

import (
	"context"
	"errors"
	"testing"

	"central_reserve/services/horizontalproperty/parking/internal/app"
	"central_reserve/services/horizontalproperty/parking/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/parking/internal/domain"
)

func TestCreateParkingSlot_Success(t *testing.T) {
	// Arrange
	ctx := context.Background()
	width := 2.5
	length := 5.0
	height := 2.2

	dto := domain.CreateParkingSlotDTO{
		ParkingZoneID: 1,
		ParkingTypeID: 1,
		SlotNumber:    "A-101",
		IsCovered:     true,
		Width:         &width,
		Length:        &length,
		Height:        &height,
		HasCharger:    false,
	}

	mockZoneRepo := &mocks.ParkingZoneRepositoryMock{
		GetParkingZoneByIDFn: func(ctx context.Context, id uint) (*domain.ParkingZone, error) {
			return &domain.ParkingZone{
				ID:         1,
				BusinessID: 100,
				Name:       "Zona A",
				IsActive:   true,
			}, nil
		},
	}

	mockSlotRepo := &mocks.ParkingSlotRepositoryMock{
		CreateParkingSlotFn: func(ctx context.Context, slot *domain.ParkingSlot) (*domain.ParkingSlot, error) {
			slot.ID = 1
			return slot, nil
		},
	}

	mockLogger := mocks.NewMockLogger()
	useCase := app.New(
		mockZoneRepo,
		mockSlotRepo,
		&mocks.ParkingAssignmentRepositoryMock{},
		&mocks.ParkingReservationRepositoryMock{},
		&mocks.ParkingOccupancyRepositoryMock{},
		&mocks.ParkingTypeRepositoryMock{},
		mockLogger,
	)

	// Act
	result, err := useCase.CreateParkingSlot(ctx, dto)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result == nil {
		t.Fatal("expected slot, got nil")
	}

	if result.ID == 0 {
		t.Error("expected ID to be set")
	}

	if result.SlotNumber != dto.SlotNumber {
		t.Errorf("expected SlotNumber %s, got %s", dto.SlotNumber, result.SlotNumber)
	}

	if !result.IsActive {
		t.Error("expected IsActive to be true")
	}
}

func TestCreateParkingSlot_MissingSlotNumber(t *testing.T) {
	// Arrange
	ctx := context.Background()
	dto := domain.CreateParkingSlotDTO{
		ParkingZoneID: 1,
		ParkingTypeID: 1,
		SlotNumber:    "", // Falta el número de espacio
	}

	mockLogger := mocks.NewMockLogger()
	useCase := app.New(
		&mocks.ParkingZoneRepositoryMock{},
		&mocks.ParkingSlotRepositoryMock{},
		&mocks.ParkingAssignmentRepositoryMock{},
		&mocks.ParkingReservationRepositoryMock{},
		&mocks.ParkingOccupancyRepositoryMock{},
		&mocks.ParkingTypeRepositoryMock{},
		mockLogger,
	)

	// Act
	result, err := useCase.CreateParkingSlot(ctx, dto)

	// Assert
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}
}

func TestCreateParkingSlot_MissingParkingZoneID(t *testing.T) {
	// Arrange
	ctx := context.Background()
	dto := domain.CreateParkingSlotDTO{
		ParkingZoneID: 0, // Falta la zona
		ParkingTypeID: 1,
		SlotNumber:    "A-101",
	}

	mockLogger := mocks.NewMockLogger()
	useCase := app.New(
		&mocks.ParkingZoneRepositoryMock{},
		&mocks.ParkingSlotRepositoryMock{},
		&mocks.ParkingAssignmentRepositoryMock{},
		&mocks.ParkingReservationRepositoryMock{},
		&mocks.ParkingOccupancyRepositoryMock{},
		&mocks.ParkingTypeRepositoryMock{},
		mockLogger,
	)

	// Act
	result, err := useCase.CreateParkingSlot(ctx, dto)

	// Assert
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}
}

func TestCreateParkingSlot_MissingParkingTypeID(t *testing.T) {
	// Arrange
	ctx := context.Background()
	dto := domain.CreateParkingSlotDTO{
		ParkingZoneID: 1,
		ParkingTypeID: 0, // Falta el tipo
		SlotNumber:    "A-101",
	}

	mockLogger := mocks.NewMockLogger()
	useCase := app.New(
		&mocks.ParkingZoneRepositoryMock{},
		&mocks.ParkingSlotRepositoryMock{},
		&mocks.ParkingAssignmentRepositoryMock{},
		&mocks.ParkingReservationRepositoryMock{},
		&mocks.ParkingOccupancyRepositoryMock{},
		&mocks.ParkingTypeRepositoryMock{},
		mockLogger,
	)

	// Act
	result, err := useCase.CreateParkingSlot(ctx, dto)

	// Assert
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}
}

func TestCreateParkingSlot_ZoneNotFound(t *testing.T) {
	// Arrange
	ctx := context.Background()
	dto := domain.CreateParkingSlotDTO{
		ParkingZoneID: 999,
		ParkingTypeID: 1,
		SlotNumber:    "A-101",
	}

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
	result, err := useCase.CreateParkingSlot(ctx, dto)

	// Assert
	if err != domain.ErrParkingZoneNotFound {
		t.Errorf("expected ErrParkingZoneNotFound, got %v", err)
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}
}

func TestCreateParkingSlot_RepositoryError(t *testing.T) {
	// Arrange
	ctx := context.Background()
	dto := domain.CreateParkingSlotDTO{
		ParkingZoneID: 1,
		ParkingTypeID: 1,
		SlotNumber:    "A-101",
	}
	expectedErr := errors.New("database error")

	mockZoneRepo := &mocks.ParkingZoneRepositoryMock{
		GetParkingZoneByIDFn: func(ctx context.Context, id uint) (*domain.ParkingZone, error) {
			return &domain.ParkingZone{ID: 1, IsActive: true}, nil
		},
	}

	mockSlotRepo := &mocks.ParkingSlotRepositoryMock{
		CreateParkingSlotFn: func(ctx context.Context, slot *domain.ParkingSlot) (*domain.ParkingSlot, error) {
			return nil, expectedErr
		},
	}

	mockLogger := mocks.NewMockLogger()
	useCase := app.New(
		mockZoneRepo,
		mockSlotRepo,
		&mocks.ParkingAssignmentRepositoryMock{},
		&mocks.ParkingReservationRepositoryMock{},
		&mocks.ParkingOccupancyRepositoryMock{},
		&mocks.ParkingTypeRepositoryMock{},
		mockLogger,
	)

	// Act
	result, err := useCase.CreateParkingSlot(ctx, dto)

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
