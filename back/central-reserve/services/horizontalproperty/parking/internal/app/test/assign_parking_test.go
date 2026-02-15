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

func TestAssignParking_Success(t *testing.T) {
	// Arrange
	ctx := context.Background()
	propertyUnitID := uint(10)
	residentID := uint(50)
	startDate, _ := time.Parse("2006-01-02", "2024-01-01")

	dto := domain.AssignParkingDTO{
		BusinessID:       100,
		ParkingSlotID:    1,
		PropertyUnitID:   &propertyUnitID,
		ResidentID:       &residentID,
		VehiclePlate:     "ABC123",
		VehicleBrand:     "Toyota",
		VehicleModel:     "Corolla",
		VehicleColor:     "Blanco",
		StartDate:        startDate,
		AssignedByUserID: 1,
	}

	mockSlotRepo := &mocks.ParkingSlotRepositoryMock{
		GetParkingSlotByIDFn: func(ctx context.Context, id uint) (*domain.ParkingSlot, error) {
			return &domain.ParkingSlot{
				ID:            1,
				ParkingZoneID: 1,
				SlotNumber:    "A-101",
				IsActive:      true,
			}, nil
		},
	}

	mockAssignmentRepo := &mocks.ParkingAssignmentRepositoryMock{
		GetActiveAssignmentBySlotIDFn: func(ctx context.Context, slotID uint) (*domain.ParkingAssignment, error) {
			return nil, nil // No hay asignación activa
		},
		CreateParkingAssignmentFn: func(ctx context.Context, assignment *domain.ParkingAssignment) (*domain.ParkingAssignment, error) {
			assignment.ID = 1
			return assignment, nil
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
	result, err := useCase.AssignParking(ctx, dto)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result == nil {
		t.Fatal("expected assignment, got nil")
	}

	if result.ID == 0 {
		t.Error("expected ID to be set")
	}

	if result.VehiclePlate != dto.VehiclePlate {
		t.Errorf("expected VehiclePlate %s, got %s", dto.VehiclePlate, result.VehiclePlate)
	}

	if !result.IsActive {
		t.Error("expected IsActive to be true")
	}
}

func TestAssignParking_MissingVehiclePlate(t *testing.T) {
	// Arrange
	ctx := context.Background()
	dto := domain.AssignParkingDTO{
		BusinessID:    100,
		ParkingSlotID: 1,
		VehiclePlate:  "", // Falta la placa
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
	result, err := useCase.AssignParking(ctx, dto)

	// Assert
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}
}

func TestAssignParking_MissingParkingSlotID(t *testing.T) {
	// Arrange
	ctx := context.Background()
	dto := domain.AssignParkingDTO{
		BusinessID:   100,
		ParkingSlotID: 0, // Falta el slot
		VehiclePlate: "ABC123",
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
	result, err := useCase.AssignParking(ctx, dto)

	// Assert
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}
}

func TestAssignParking_SlotNotFound(t *testing.T) {
	// Arrange
	ctx := context.Background()
	dto := domain.AssignParkingDTO{
		BusinessID:    100,
		ParkingSlotID: 999,
		VehiclePlate:  "ABC123",
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
	result, err := useCase.AssignParking(ctx, dto)

	// Assert
	if err != domain.ErrParkingSlotNotFound {
		t.Errorf("expected ErrParkingSlotNotFound, got %v", err)
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}
}

func TestAssignParking_SlotInactive(t *testing.T) {
	// Arrange
	ctx := context.Background()
	dto := domain.AssignParkingDTO{
		BusinessID:    100,
		ParkingSlotID: 1,
		VehiclePlate:  "ABC123",
	}

	mockSlotRepo := &mocks.ParkingSlotRepositoryMock{
		GetParkingSlotByIDFn: func(ctx context.Context, id uint) (*domain.ParkingSlot, error) {
			return &domain.ParkingSlot{
				ID:       1,
				IsActive: false, // Slot inactivo
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
	result, err := useCase.AssignParking(ctx, dto)

	// Assert
	if err != domain.ErrParkingSlotInactive {
		t.Errorf("expected ErrParkingSlotInactive, got %v", err)
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}
}

func TestAssignParking_SlotAlreadyAssigned(t *testing.T) {
	// Arrange
	ctx := context.Background()
	dto := domain.AssignParkingDTO{
		BusinessID:    100,
		ParkingSlotID: 1,
		VehiclePlate:  "ABC123",
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
	result, err := useCase.AssignParking(ctx, dto)

	// Assert
	if err != domain.ErrParkingSlotAlreadyAssigned {
		t.Errorf("expected ErrParkingSlotAlreadyAssigned, got %v", err)
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}
}

func TestAssignParking_RepositoryError(t *testing.T) {
	// Arrange
	ctx := context.Background()
	dto := domain.AssignParkingDTO{
		BusinessID:    100,
		ParkingSlotID: 1,
		VehiclePlate:  "ABC123",
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
		CreateParkingAssignmentFn: func(ctx context.Context, assignment *domain.ParkingAssignment) (*domain.ParkingAssignment, error) {
			return nil, expectedErr
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
	result, err := useCase.AssignParking(ctx, dto)

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
