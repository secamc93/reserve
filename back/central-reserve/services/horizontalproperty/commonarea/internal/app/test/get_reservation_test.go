package app_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"central_reserve/services/horizontalproperty/commonarea/internal/app"
	"central_reserve/services/horizontalproperty/commonarea/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/commonarea/internal/domain"
)

func TestGetReservationByID_Success(t *testing.T) {
	// Arrange
	expectedReservation := &domain.CommonAreaReservation{
		ID:                  1,
		CommonAreaID:        1,
		PropertyUnitID:      100,
		ReservationStatusID: 1,
		ReservationDate:     time.Date(2024, 3, 15, 0, 0, 0, 0, time.UTC),
		StartTime:           "10:00",
		EndTime:             "12:00",
		NumberOfGuests:      5,
		Purpose:             "Reunión familiar",
	}

	mockReservationRepo := &mocks.MockReservationRepository{
		GetReservationByIDFunc: func(ctx context.Context, id uint) (*domain.CommonAreaReservation, error) {
			if id == 1 {
				return expectedReservation, nil
			}
			return nil, domain.ErrReservationNotFound
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(
		&mocks.MockCommonAreaRepository{},
		&mocks.MockScheduleRepository{},
		&mocks.MockRestrictionRepository{},
		mockReservationRepo,
		mockLogger,
	)

	// Act
	result, err := uc.GetReservationByID(context.Background(), 1)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result.ID != expectedReservation.ID {
		t.Errorf("expected ID %d, got %d", expectedReservation.ID, result.ID)
	}

	if result.CommonAreaID != expectedReservation.CommonAreaID {
		t.Errorf("expected CommonAreaID %d, got %d", expectedReservation.CommonAreaID, result.CommonAreaID)
	}

	if result.StartTime != expectedReservation.StartTime {
		t.Errorf("expected StartTime '%s', got '%s'", expectedReservation.StartTime, result.StartTime)
	}
}

func TestGetReservationByID_NotFound(t *testing.T) {
	// Arrange
	mockReservationRepo := &mocks.MockReservationRepository{
		GetReservationByIDFunc: func(ctx context.Context, id uint) (*domain.CommonAreaReservation, error) {
			return nil, domain.ErrReservationNotFound
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(
		&mocks.MockCommonAreaRepository{},
		&mocks.MockScheduleRepository{},
		&mocks.MockRestrictionRepository{},
		mockReservationRepo,
		mockLogger,
	)

	// Act
	result, err := uc.GetReservationByID(context.Background(), 999)

	// Assert
	if err == nil {
		t.Fatal("expected error for not found, got nil")
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}

	if !errors.Is(err, domain.ErrReservationNotFound) {
		t.Errorf("expected ErrReservationNotFound, got %v", err)
	}
}

func TestGetReservationByID_RepositoryError(t *testing.T) {
	// Arrange
	expectedErr := errors.New("database error")

	mockReservationRepo := &mocks.MockReservationRepository{
		GetReservationByIDFunc: func(ctx context.Context, id uint) (*domain.CommonAreaReservation, error) {
			return nil, expectedErr
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(
		&mocks.MockCommonAreaRepository{},
		&mocks.MockScheduleRepository{},
		&mocks.MockRestrictionRepository{},
		mockReservationRepo,
		mockLogger,
	)

	// Act
	result, err := uc.GetReservationByID(context.Background(), 1)

	// Assert
	if err == nil {
		t.Fatal("expected error from repository, got nil")
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}

	if !errors.Is(err, expectedErr) {
		t.Errorf("expected error %v, got %v", expectedErr, err)
	}
}

func TestListReservations_Success(t *testing.T) {
	// Arrange
	expectedResult := &domain.PaginatedReservationsDTO{
		Reservations: []domain.ReservationListDTO{
			{
				ID:                 1,
				CommonAreaName:     "Salón Social",
				PropertyUnitNumber: "101",
				ResidentName:       "Juan Pérez",
				StatusName:         "Aprobada",
				ReservationDate:    time.Date(2024, 3, 15, 0, 0, 0, 0, time.UTC),
				StartTime:          "10:00",
				EndTime:            "12:00",
				NumberOfGuests:     5,
			},
			{
				ID:                 2,
				CommonAreaName:     "Cancha",
				PropertyUnitNumber: "102",
				ResidentName:       "María García",
				StatusName:         "Pendiente",
				ReservationDate:    time.Date(2024, 3, 16, 0, 0, 0, 0, time.UTC),
				StartTime:          "14:00",
				EndTime:            "16:00",
				NumberOfGuests:     8,
			},
		},
		Total:      2,
		Page:       1,
		PageSize:   10,
		TotalPages: 1,
	}

	mockReservationRepo := &mocks.MockReservationRepository{
		ListReservationsFunc: func(ctx context.Context, filters domain.ReservationFiltersDTO) (*domain.PaginatedReservationsDTO, error) {
			return expectedResult, nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(
		&mocks.MockCommonAreaRepository{},
		&mocks.MockScheduleRepository{},
		&mocks.MockRestrictionRepository{},
		mockReservationRepo,
		mockLogger,
	)

	filters := domain.ReservationFiltersDTO{
		BusinessID: 1,
		Page:       1,
		PageSize:   10,
	}

	// Act
	result, err := uc.ListReservations(context.Background(), filters)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result.Total != 2 {
		t.Errorf("expected total 2, got %d", result.Total)
	}

	if len(result.Reservations) != 2 {
		t.Errorf("expected 2 reservations, got %d", len(result.Reservations))
	}

	if result.Reservations[0].CommonAreaName != "Salón Social" {
		t.Errorf("expected first reservation for 'Salón Social', got '%s'", result.Reservations[0].CommonAreaName)
	}
}

func TestListReservations_EmptyResult(t *testing.T) {
	// Arrange
	expectedResult := &domain.PaginatedReservationsDTO{
		Reservations: []domain.ReservationListDTO{},
		Total:        0,
		Page:         1,
		PageSize:     10,
		TotalPages:   0,
	}

	mockReservationRepo := &mocks.MockReservationRepository{
		ListReservationsFunc: func(ctx context.Context, filters domain.ReservationFiltersDTO) (*domain.PaginatedReservationsDTO, error) {
			return expectedResult, nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(
		&mocks.MockCommonAreaRepository{},
		&mocks.MockScheduleRepository{},
		&mocks.MockRestrictionRepository{},
		mockReservationRepo,
		mockLogger,
	)

	filters := domain.ReservationFiltersDTO{
		BusinessID: 1,
		Page:       1,
		PageSize:   10,
	}

	// Act
	result, err := uc.ListReservations(context.Background(), filters)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result.Total != 0 {
		t.Errorf("expected total 0, got %d", result.Total)
	}

	if len(result.Reservations) != 0 {
		t.Errorf("expected 0 reservations, got %d", len(result.Reservations))
	}
}

func TestListReservations_WithFilters(t *testing.T) {
	// Arrange
	commonAreaID := uint(1)
	statusID := uint(2)

	mockReservationRepo := &mocks.MockReservationRepository{
		ListReservationsFunc: func(ctx context.Context, filters domain.ReservationFiltersDTO) (*domain.PaginatedReservationsDTO, error) {
			// Verificar que los filtros se pasaron correctamente
			if filters.CommonAreaID == nil || *filters.CommonAreaID != commonAreaID {
				t.Errorf("expected CommonAreaID filter %d, got %v", commonAreaID, filters.CommonAreaID)
			}
			if filters.ReservationStatusID == nil || *filters.ReservationStatusID != statusID {
				t.Errorf("expected ReservationStatusID filter %d, got %v", statusID, filters.ReservationStatusID)
			}

			return &domain.PaginatedReservationsDTO{
				Reservations: []domain.ReservationListDTO{},
				Total:        0,
				Page:         1,
				PageSize:     10,
				TotalPages:   0,
			}, nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(
		&mocks.MockCommonAreaRepository{},
		&mocks.MockScheduleRepository{},
		&mocks.MockRestrictionRepository{},
		mockReservationRepo,
		mockLogger,
	)

	filters := domain.ReservationFiltersDTO{
		BusinessID:          1,
		CommonAreaID:        &commonAreaID,
		ReservationStatusID: &statusID,
		Page:                1,
		PageSize:            10,
	}

	// Act
	_, err := uc.ListReservations(context.Background(), filters)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
}

func TestListReservations_RepositoryError(t *testing.T) {
	// Arrange
	expectedErr := errors.New("database error")

	mockReservationRepo := &mocks.MockReservationRepository{
		ListReservationsFunc: func(ctx context.Context, filters domain.ReservationFiltersDTO) (*domain.PaginatedReservationsDTO, error) {
			return nil, expectedErr
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(
		&mocks.MockCommonAreaRepository{},
		&mocks.MockScheduleRepository{},
		&mocks.MockRestrictionRepository{},
		mockReservationRepo,
		mockLogger,
	)

	filters := domain.ReservationFiltersDTO{
		BusinessID: 1,
		Page:       1,
		PageSize:   10,
	}

	// Act
	result, err := uc.ListReservations(context.Background(), filters)

	// Assert
	if err == nil {
		t.Fatal("expected error from repository, got nil")
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}

	if !errors.Is(err, expectedErr) {
		t.Errorf("expected error %v, got %v", expectedErr, err)
	}
}
