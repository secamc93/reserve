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

func TestListParkingReservations_Success(t *testing.T) {
	// Arrange
	ctx := context.Background()
	filters := domain.ParkingReservationFiltersDTO{
		BusinessID: 100,
		Page:       1,
		PageSize:   10,
	}

	propertyUnit1 := uint(10)
	propertyUnit2 := uint(11)
	date1, _ := time.Parse("2006-01-02", "2024-01-15")
	date2, _ := time.Parse("2006-01-02", "2024-01-16")

	expectedResult := &domain.PaginatedParkingReservationsDTO{
		ParkingReservations: []domain.ParkingReservationListDTO{
			{
				ID:              1,
				ParkingSlotID:   1,
				PropertyUnitID:  &propertyUnit1,
				VehiclePlate:    "ABC123",
				ReservationDate: date1,
				StatusName:      "confirmed",
			},
			{
				ID:              2,
				ParkingSlotID:   2,
				PropertyUnitID:  &propertyUnit2,
				VehiclePlate:    "XYZ789",
				ReservationDate: date2,
				StatusName:      "confirmed",
			},
		},
		Total:      2,
		Page:       1,
		PageSize:   10,
		TotalPages: 1,
	}

	mockReservationRepo := &mocks.ParkingReservationRepositoryMock{
		ListParkingReservationsFn: func(ctx context.Context, f domain.ParkingReservationFiltersDTO) (*domain.PaginatedParkingReservationsDTO, error) {
			return expectedResult, nil
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
	result, err := useCase.ListParkingReservations(ctx, filters)

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

	if len(result.ParkingReservations) != len(expectedResult.ParkingReservations) {
		t.Errorf("expected %d reservations, got %d", len(expectedResult.ParkingReservations), len(result.ParkingReservations))
	}
}

func TestListParkingReservations_EmptyResult(t *testing.T) {
	// Arrange
	ctx := context.Background()
	filters := domain.ParkingReservationFiltersDTO{
		BusinessID: 100,
		Page:       1,
		PageSize:   10,
	}

	expectedResult := &domain.PaginatedParkingReservationsDTO{
		ParkingReservations: []domain.ParkingReservationListDTO{},
		Total:               0,
		Page:                1,
		PageSize:            10,
		TotalPages:          0,
	}

	mockReservationRepo := &mocks.ParkingReservationRepositoryMock{
		ListParkingReservationsFn: func(ctx context.Context, f domain.ParkingReservationFiltersDTO) (*domain.PaginatedParkingReservationsDTO, error) {
			return expectedResult, nil
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
	result, err := useCase.ListParkingReservations(ctx, filters)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result.Total != 0 {
		t.Errorf("expected Total 0, got %d", result.Total)
	}

	if len(result.ParkingReservations) != 0 {
		t.Errorf("expected 0 reservations, got %d", len(result.ParkingReservations))
	}
}

func TestListParkingReservations_RepositoryError(t *testing.T) {
	// Arrange
	ctx := context.Background()
	filters := domain.ParkingReservationFiltersDTO{
		BusinessID: 100,
		Page:       1,
		PageSize:   10,
	}
	expectedErr := errors.New("database error")

	mockReservationRepo := &mocks.ParkingReservationRepositoryMock{
		ListParkingReservationsFn: func(ctx context.Context, f domain.ParkingReservationFiltersDTO) (*domain.PaginatedParkingReservationsDTO, error) {
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
	result, err := useCase.ListParkingReservations(ctx, filters)

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
