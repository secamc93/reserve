package app_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"central_reserve/services/sporttraining/booking/internal/app"
	"central_reserve/services/sporttraining/booking/internal/app/test/mocks"
	"central_reserve/services/sporttraining/booking/internal/domain"
)

func TestListBookings_Success(t *testing.T) {
	// Arrange
	expectedBookings := &domain.PaginatedBookingsDTO{
		Bookings: []domain.BookingListDTO{
			{
				ID:                1,
				TrainingSessionID: 10,
				PlayerID:          5,
				PlayerName:        "Juan Pérez",
				SessionDate:       time.Now(),
				SessionMode:       "Individual",
				Location:          "Cancha 1",
				StatusName:        "Pendiente",
				StatusCode:        "pending",
				StatusColor:       "#FFA500",
				BookingDate:       time.Now(),
				IsPaid:            false,
				CreatedAt:         time.Now(),
			},
		},
		Total:      1,
		Page:       1,
		PageSize:   10,
		TotalPages: 1,
	}

	mockRepo := &mocks.MockBookingRepository{
		ListFunc: func(ctx context.Context, filters domain.BookingFiltersDTO) (*domain.PaginatedBookingsDTO, error) {
			return expectedBookings, nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	filters := domain.BookingFiltersDTO{
		BusinessID: 1,
		Page:       1,
		PageSize:   10,
	}

	// Act
	result, err := uc.ListBookings(context.Background(), filters)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result.Total != 1 {
		t.Errorf("expected Total 1, got %d", result.Total)
	}

	if len(result.Bookings) != 1 {
		t.Errorf("expected 1 booking, got %d", len(result.Bookings))
	}

	if result.Page != 1 {
		t.Errorf("expected Page 1, got %d", result.Page)
	}

	if result.PageSize != 10 {
		t.Errorf("expected PageSize 10, got %d", result.PageSize)
	}
}

func TestListBookings_DefaultPagination(t *testing.T) {
	// Arrange
	var capturedFilters domain.BookingFiltersDTO

	mockRepo := &mocks.MockBookingRepository{
		ListFunc: func(ctx context.Context, filters domain.BookingFiltersDTO) (*domain.PaginatedBookingsDTO, error) {
			capturedFilters = filters
			return &domain.PaginatedBookingsDTO{
				Bookings:   []domain.BookingListDTO{},
				Total:      0,
				Page:       filters.Page,
				PageSize:   filters.PageSize,
				TotalPages: 0,
			}, nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	// Filtros con paginación inválida
	filters := domain.BookingFiltersDTO{
		BusinessID: 1,
		Page:       0,  // Inválido
		PageSize:   0,  // Inválido
	}

	// Act
	_, err := uc.ListBookings(context.Background(), filters)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	// Verificar que se aplicaron valores por defecto
	if capturedFilters.Page != 1 {
		t.Errorf("expected default Page 1, got %d", capturedFilters.Page)
	}

	if capturedFilters.PageSize != 10 {
		t.Errorf("expected default PageSize 10, got %d", capturedFilters.PageSize)
	}
}

func TestListBookings_MaxPageSize(t *testing.T) {
	// Arrange
	var capturedFilters domain.BookingFiltersDTO

	mockRepo := &mocks.MockBookingRepository{
		ListFunc: func(ctx context.Context, filters domain.BookingFiltersDTO) (*domain.PaginatedBookingsDTO, error) {
			capturedFilters = filters
			return &domain.PaginatedBookingsDTO{
				Bookings:   []domain.BookingListDTO{},
				Total:      0,
				Page:       filters.Page,
				PageSize:   filters.PageSize,
				TotalPages: 0,
			}, nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	filters := domain.BookingFiltersDTO{
		BusinessID: 1,
		Page:       1,
		PageSize:   150, // Excede máximo
	}

	// Act
	_, err := uc.ListBookings(context.Background(), filters)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	// Verificar que se limitó a 100
	if capturedFilters.PageSize != 100 {
		t.Errorf("expected max PageSize 100, got %d", capturedFilters.PageSize)
	}
}

func TestListBookings_RepositoryError(t *testing.T) {
	// Arrange
	expectedErr := errors.New("database connection error")

	mockRepo := &mocks.MockBookingRepository{
		ListFunc: func(ctx context.Context, filters domain.BookingFiltersDTO) (*domain.PaginatedBookingsDTO, error) {
			return nil, expectedErr
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	filters := domain.BookingFiltersDTO{
		BusinessID: 1,
		Page:       1,
		PageSize:   10,
	}

	// Act
	result, err := uc.ListBookings(context.Background(), filters)

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
