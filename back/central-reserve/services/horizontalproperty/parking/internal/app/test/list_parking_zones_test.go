package app_test

import (
	"context"
	"errors"
	"testing"

	"central_reserve/services/horizontalproperty/parking/internal/app"
	"central_reserve/services/horizontalproperty/parking/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/parking/internal/domain"
)

func TestListParkingZones_Success(t *testing.T) {
	// Arrange
	ctx := context.Background()
	filters := domain.ParkingZoneFiltersDTO{
		BusinessID: 100,
		Page:       1,
		PageSize:   10,
	}

	expectedResult := &domain.PaginatedParkingZonesDTO{
		ParkingZones: []domain.ParkingZoneListDTO{
			{
				ID:         1,
				Name:       "Zona A",
				Code:       "ZONA_A",
				TotalSlots: 50,
				IsActive:   true,
			},
			{
				ID:         2,
				Name:       "Zona B",
				Code:       "ZONA_B",
				TotalSlots: 30,
				IsActive:   true,
			},
		},
		Total:      2,
		Page:       1,
		PageSize:   10,
		TotalPages: 1,
	}

	mockZoneRepo := &mocks.ParkingZoneRepositoryMock{
		ListParkingZonesFn: func(ctx context.Context, f domain.ParkingZoneFiltersDTO) (*domain.PaginatedParkingZonesDTO, error) {
			return expectedResult, nil
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
	result, err := useCase.ListParkingZones(ctx, filters)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result == nil {
		t.Fatal("expected result, got nil")
	}

	if result.Total != expectedResult.Total {
		t.Errorf("expected Total %d, got %d", expectedResult.Total, result.Total)
	}

	if len(result.ParkingZones) != len(expectedResult.ParkingZones) {
		t.Errorf("expected %d zones, got %d", len(expectedResult.ParkingZones), len(result.ParkingZones))
	}
}

func TestListParkingZones_EmptyResult(t *testing.T) {
	// Arrange
	ctx := context.Background()
	filters := domain.ParkingZoneFiltersDTO{
		BusinessID: 100,
		Page:       1,
		PageSize:   10,
	}

	expectedResult := &domain.PaginatedParkingZonesDTO{
		ParkingZones: []domain.ParkingZoneListDTO{},
		Total:        0,
		Page:         1,
		PageSize:     10,
		TotalPages:   0,
	}

	mockZoneRepo := &mocks.ParkingZoneRepositoryMock{
		ListParkingZonesFn: func(ctx context.Context, f domain.ParkingZoneFiltersDTO) (*domain.PaginatedParkingZonesDTO, error) {
			return expectedResult, nil
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
	result, err := useCase.ListParkingZones(ctx, filters)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result.Total != 0 {
		t.Errorf("expected Total 0, got %d", result.Total)
	}

	if len(result.ParkingZones) != 0 {
		t.Errorf("expected 0 zones, got %d", len(result.ParkingZones))
	}
}

func TestListParkingZones_RepositoryError(t *testing.T) {
	// Arrange
	ctx := context.Background()
	filters := domain.ParkingZoneFiltersDTO{
		BusinessID: 100,
		Page:       1,
		PageSize:   10,
	}
	expectedErr := errors.New("database error")

	mockZoneRepo := &mocks.ParkingZoneRepositoryMock{
		ListParkingZonesFn: func(ctx context.Context, f domain.ParkingZoneFiltersDTO) (*domain.PaginatedParkingZonesDTO, error) {
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
	result, err := useCase.ListParkingZones(ctx, filters)

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
