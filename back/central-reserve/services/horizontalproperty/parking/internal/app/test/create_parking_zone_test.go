package app_test

import (
	"context"
	"errors"
	"testing"

	"central_reserve/services/horizontalproperty/parking/internal/app"
	"central_reserve/services/horizontalproperty/parking/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/parking/internal/domain"
)

func TestCreateParkingZone_Success(t *testing.T) {
	// Arrange
	ctx := context.Background()
	dto := domain.CreateParkingZoneDTO{
		BusinessID:  100,
		Name:        "Zona A",
		Code:        "ZONA_A",
		Description: "Zona principal de parqueo",
		Location:    "Piso 1",
	}

	mockZoneRepo := &mocks.ParkingZoneRepositoryMock{
		CreateParkingZoneFn: func(ctx context.Context, zone *domain.ParkingZone) (*domain.ParkingZone, error) {
			zone.ID = 1
			return zone, nil
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
	result, err := useCase.CreateParkingZone(ctx, dto)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result == nil {
		t.Fatal("expected zone, got nil")
	}

	if result.ID == 0 {
		t.Error("expected ID to be set")
	}

	if result.Name != dto.Name {
		t.Errorf("expected Name %s, got %s", dto.Name, result.Name)
	}

	if result.Code != dto.Code {
		t.Errorf("expected Code %s, got %s", dto.Code, result.Code)
	}

	if !result.IsActive {
		t.Error("expected IsActive to be true")
	}

	if result.TotalSlots != 0 {
		t.Errorf("expected TotalSlots 0, got %d", result.TotalSlots)
	}
}

func TestCreateParkingZone_MissingName(t *testing.T) {
	// Arrange
	ctx := context.Background()
	dto := domain.CreateParkingZoneDTO{
		BusinessID:  100,
		Name:        "", // Falta el nombre
		Code:        "ZONA_A",
		Description: "Zona principal de parqueo",
	}

	mockZoneRepo := &mocks.ParkingZoneRepositoryMock{}
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
	result, err := useCase.CreateParkingZone(ctx, dto)

	// Assert
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}
}

func TestCreateParkingZone_MissingCode(t *testing.T) {
	// Arrange
	ctx := context.Background()
	dto := domain.CreateParkingZoneDTO{
		BusinessID:  100,
		Name:        "Zona A",
		Code:        "", // Falta el código
		Description: "Zona principal de parqueo",
	}

	mockZoneRepo := &mocks.ParkingZoneRepositoryMock{}
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
	result, err := useCase.CreateParkingZone(ctx, dto)

	// Assert
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}
}

func TestCreateParkingZone_RepositoryError(t *testing.T) {
	// Arrange
	ctx := context.Background()
	dto := domain.CreateParkingZoneDTO{
		BusinessID:  100,
		Name:        "Zona A",
		Code:        "ZONA_A",
		Description: "Zona principal de parqueo",
	}
	expectedErr := errors.New("database error")

	mockZoneRepo := &mocks.ParkingZoneRepositoryMock{
		CreateParkingZoneFn: func(ctx context.Context, zone *domain.ParkingZone) (*domain.ParkingZone, error) {
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
	result, err := useCase.CreateParkingZone(ctx, dto)

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
