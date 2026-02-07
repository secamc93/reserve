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

func TestListParkingAssignments_Success(t *testing.T) {
	// Arrange
	ctx := context.Background()
	filters := domain.ParkingAssignmentFiltersDTO{
		BusinessID: 100,
		Page:       1,
		PageSize:   10,
	}

	propertyUnit1 := uint(10)
	propertyUnit2 := uint(11)
	residentID1 := uint(50)
	residentID2 := uint(51)
	startDate1, _ := time.Parse("2006-01-02", "2024-01-01")
	startDate2, _ := time.Parse("2006-01-02", "2024-01-02")

	expectedResult := &domain.PaginatedParkingAssignmentsDTO{
		ParkingAssignments: []domain.ParkingAssignmentListDTO{
			{
				ID:             1,
				ParkingSlotID:  1,
				PropertyUnitID: &propertyUnit1,
				ResidentID:     &residentID1,
				VehiclePlate:   "ABC123",
				StartDate:      startDate1,
				IsActive:       true,
			},
			{
				ID:             2,
				ParkingSlotID:  2,
				PropertyUnitID: &propertyUnit2,
				ResidentID:     &residentID2,
				VehiclePlate:   "XYZ789",
				StartDate:      startDate2,
				IsActive:       true,
			},
		},
		Total:      2,
		Page:       1,
		PageSize:   10,
		TotalPages: 1,
	}

	mockAssignmentRepo := &mocks.ParkingAssignmentRepositoryMock{
		ListParkingAssignmentsFn: func(ctx context.Context, f domain.ParkingAssignmentFiltersDTO) (*domain.PaginatedParkingAssignmentsDTO, error) {
			return expectedResult, nil
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
	result, err := useCase.ListParkingAssignments(ctx, filters)

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

	if len(result.ParkingAssignments) != len(expectedResult.ParkingAssignments) {
		t.Errorf("expected %d assignments, got %d", len(expectedResult.ParkingAssignments), len(result.ParkingAssignments))
	}
}

func TestListParkingAssignments_EmptyResult(t *testing.T) {
	// Arrange
	ctx := context.Background()
	filters := domain.ParkingAssignmentFiltersDTO{
		BusinessID: 100,
		Page:       1,
		PageSize:   10,
	}

	expectedResult := &domain.PaginatedParkingAssignmentsDTO{
		ParkingAssignments: []domain.ParkingAssignmentListDTO{},
		Total:              0,
		Page:               1,
		PageSize:           10,
		TotalPages:         0,
	}

	mockAssignmentRepo := &mocks.ParkingAssignmentRepositoryMock{
		ListParkingAssignmentsFn: func(ctx context.Context, f domain.ParkingAssignmentFiltersDTO) (*domain.PaginatedParkingAssignmentsDTO, error) {
			return expectedResult, nil
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
	result, err := useCase.ListParkingAssignments(ctx, filters)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result.Total != 0 {
		t.Errorf("expected Total 0, got %d", result.Total)
	}

	if len(result.ParkingAssignments) != 0 {
		t.Errorf("expected 0 assignments, got %d", len(result.ParkingAssignments))
	}
}

func TestListParkingAssignments_RepositoryError(t *testing.T) {
	// Arrange
	ctx := context.Background()
	filters := domain.ParkingAssignmentFiltersDTO{
		BusinessID: 100,
		Page:       1,
		PageSize:   10,
	}
	expectedErr := errors.New("database error")

	mockAssignmentRepo := &mocks.ParkingAssignmentRepositoryMock{
		ListParkingAssignmentsFn: func(ctx context.Context, f domain.ParkingAssignmentFiltersDTO) (*domain.PaginatedParkingAssignmentsDTO, error) {
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
	result, err := useCase.ListParkingAssignments(ctx, filters)

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
