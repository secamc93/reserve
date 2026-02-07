package app_test

import (
	"context"
	"errors"
	"testing"

	"central_reserve/services/horizontalproperty/parking/internal/app"
	"central_reserve/services/horizontalproperty/parking/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/parking/internal/domain"
)

func TestListParkingSlots_Success(t *testing.T) {
	// Arrange
	ctx := context.Background()
	zoneID := uint(1)
	filters := domain.ParkingSlotFiltersDTO{
		ParkingZoneID: &zoneID,
		Page:          1,
		PageSize:      10,
	}

	expectedResult := &domain.PaginatedParkingSlotsDTO{
		ParkingSlots: []domain.ParkingSlotListDTO{
			{
				ID:            1,
				ParkingZoneID: 1,
				ParkingTypeID: 1,
				SlotNumber:    "A-101",
				IsCovered:     true,
				IsActive:      true,
			},
			{
				ID:            2,
				ParkingZoneID: 1,
				ParkingTypeID: 1,
				SlotNumber:    "A-102",
				IsCovered:     true,
				IsActive:      true,
			},
		},
		Total:      2,
		Page:       1,
		PageSize:   10,
		TotalPages: 1,
	}

	mockSlotRepo := &mocks.ParkingSlotRepositoryMock{
		ListParkingSlotsFn: func(ctx context.Context, f domain.ParkingSlotFiltersDTO) (*domain.PaginatedParkingSlotsDTO, error) {
			return expectedResult, nil
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
	result, err := useCase.ListParkingSlots(ctx, filters)

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

	if len(result.ParkingSlots) != len(expectedResult.ParkingSlots) {
		t.Errorf("expected %d slots, got %d", len(expectedResult.ParkingSlots), len(result.ParkingSlots))
	}
}

func TestListParkingSlots_EmptyResult(t *testing.T) {
	// Arrange
	ctx := context.Background()
	zoneID := uint(1)
	filters := domain.ParkingSlotFiltersDTO{
		ParkingZoneID: &zoneID,
		Page:          1,
		PageSize:      10,
	}

	expectedResult := &domain.PaginatedParkingSlotsDTO{
		ParkingSlots: []domain.ParkingSlotListDTO{},
		Total:        0,
		Page:         1,
		PageSize:     10,
		TotalPages:   0,
	}

	mockSlotRepo := &mocks.ParkingSlotRepositoryMock{
		ListParkingSlotsFn: func(ctx context.Context, f domain.ParkingSlotFiltersDTO) (*domain.PaginatedParkingSlotsDTO, error) {
			return expectedResult, nil
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
	result, err := useCase.ListParkingSlots(ctx, filters)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result.Total != 0 {
		t.Errorf("expected Total 0, got %d", result.Total)
	}

	if len(result.ParkingSlots) != 0 {
		t.Errorf("expected 0 slots, got %d", len(result.ParkingSlots))
	}
}

func TestListParkingSlots_RepositoryError(t *testing.T) {
	// Arrange
	ctx := context.Background()
	zoneID := uint(1)
	filters := domain.ParkingSlotFiltersDTO{
		ParkingZoneID: &zoneID,
		Page:          1,
		PageSize:      10,
	}
	expectedErr := errors.New("database error")

	mockSlotRepo := &mocks.ParkingSlotRepositoryMock{
		ListParkingSlotsFn: func(ctx context.Context, f domain.ParkingSlotFiltersDTO) (*domain.PaginatedParkingSlotsDTO, error) {
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
	result, err := useCase.ListParkingSlots(ctx, filters)

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
