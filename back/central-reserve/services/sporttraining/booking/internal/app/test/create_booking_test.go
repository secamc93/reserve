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

func TestCreateBooking_Success(t *testing.T) {
	// Arrange
	mockRepo := &mocks.MockBookingRepository{
		GetBookingStatusByCodeFunc: func(ctx context.Context, code string) (*domain.StatusRef, error) {
			return &domain.StatusRef{
				ID:      1,
				Code:    "pending",
				Name:    "Pendiente",
				Color:   "#FFA500",
				IsFinal: false,
			}, nil
		},
		CreateFunc: func(ctx context.Context, booking *domain.Booking) (*domain.Booking, error) {
			booking.ID = 1
			booking.CreatedAt = time.Now()
			booking.UpdatedAt = time.Now()
			return booking, nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	dto := domain.CreateBookingDTO{
		TrainingSessionID: 10,
		PlayerID:          5,
		BookedByUserID:    3,
		BusinessID:        1,
		RequestNotes:      "Primera clase de prueba",
	}

	// Act
	result, err := uc.CreateBooking(context.Background(), dto)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result.ID != 1 {
		t.Errorf("expected ID 1, got %d", result.ID)
	}

	if result.TrainingSessionID != 10 {
		t.Errorf("expected TrainingSessionID 10, got %d", result.TrainingSessionID)
	}

	if result.PlayerID != 5 {
		t.Errorf("expected PlayerID 5, got %d", result.PlayerID)
	}

	if result.BookedByUserID != 3 {
		t.Errorf("expected BookedByUserID 3, got %d", result.BookedByUserID)
	}

	if result.RequestNotes != "Primera clase de prueba" {
		t.Errorf("expected RequestNotes 'Primera clase de prueba', got '%s'", result.RequestNotes)
	}

	if result.BookingStatusID != 1 {
		t.Errorf("expected BookingStatusID 1, got %d", result.BookingStatusID)
	}

	if result.IsPaid {
		t.Error("expected IsPaid to be false")
	}
}

func TestCreateBooking_GetStatusError(t *testing.T) {
	// Arrange
	expectedErr := errors.New("status not found")

	mockRepo := &mocks.MockBookingRepository{
		GetBookingStatusByCodeFunc: func(ctx context.Context, code string) (*domain.StatusRef, error) {
			return nil, expectedErr
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	dto := domain.CreateBookingDTO{
		TrainingSessionID: 10,
		PlayerID:          5,
		BookedByUserID:    3,
		BusinessID:        1,
	}

	// Act
	result, err := uc.CreateBooking(context.Background(), dto)

	// Assert
	if err == nil {
		t.Fatal("expected error from GetBookingStatusByCode, got nil")
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}

	if !errors.Is(err, expectedErr) {
		t.Errorf("expected error %v, got %v", expectedErr, err)
	}
}

func TestCreateBooking_RepositoryError(t *testing.T) {
	// Arrange
	expectedErr := errors.New("database connection error")

	mockRepo := &mocks.MockBookingRepository{
		GetBookingStatusByCodeFunc: func(ctx context.Context, code string) (*domain.StatusRef, error) {
			return &domain.StatusRef{
				ID:      1,
				Code:    "pending",
				Name:    "Pendiente",
				Color:   "#FFA500",
				IsFinal: false,
			}, nil
		},
		CreateFunc: func(ctx context.Context, booking *domain.Booking) (*domain.Booking, error) {
			return nil, expectedErr
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	dto := domain.CreateBookingDTO{
		TrainingSessionID: 10,
		PlayerID:          5,
		BookedByUserID:    3,
		BusinessID:        1,
	}

	// Act
	result, err := uc.CreateBooking(context.Background(), dto)

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
