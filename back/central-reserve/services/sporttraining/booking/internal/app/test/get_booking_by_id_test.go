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

func TestGetBookingByID_Success(t *testing.T) {
	// Arrange
	expectedBooking := &domain.Booking{
		ID:                1,
		TrainingSessionID: 10,
		PlayerID:          5,
		BookedByUserID:    3,
		BookingStatusID:   1,
		BookingDate:       time.Now(),
		RequestNotes:      "Test booking",
		IsPaid:            false,
		CreatedAt:         time.Now(),
		UpdatedAt:         time.Now(),
		Status: &domain.StatusRef{
			ID:      1,
			Code:    "pending",
			Name:    "Pendiente",
			Color:   "#FFA500",
			IsFinal: false,
		},
	}

	mockRepo := &mocks.MockBookingRepository{
		GetByIDFunc: func(ctx context.Context, id uint, businessID uint) (*domain.Booking, error) {
			if id == 1 && businessID == 1 {
				return expectedBooking, nil
			}
			return nil, domain.ErrBookingNotFound
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	// Act
	result, err := uc.GetBookingByID(context.Background(), 1, 1)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result.ID != expectedBooking.ID {
		t.Errorf("expected ID %d, got %d", expectedBooking.ID, result.ID)
	}

	if result.TrainingSessionID != expectedBooking.TrainingSessionID {
		t.Errorf("expected TrainingSessionID %d, got %d", expectedBooking.TrainingSessionID, result.TrainingSessionID)
	}

	if result.PlayerID != expectedBooking.PlayerID {
		t.Errorf("expected PlayerID %d, got %d", expectedBooking.PlayerID, result.PlayerID)
	}
}

func TestGetBookingByID_NotFound(t *testing.T) {
	// Arrange
	mockRepo := &mocks.MockBookingRepository{
		GetByIDFunc: func(ctx context.Context, id uint, businessID uint) (*domain.Booking, error) {
			return nil, domain.ErrBookingNotFound
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	// Act
	result, err := uc.GetBookingByID(context.Background(), 999, 1)

	// Assert
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}

	if !errors.Is(err, domain.ErrBookingNotFound) {
		t.Errorf("expected ErrBookingNotFound, got %v", err)
	}
}

func TestGetBookingByID_RepositoryError(t *testing.T) {
	// Arrange
	expectedErr := errors.New("database connection error")

	mockRepo := &mocks.MockBookingRepository{
		GetByIDFunc: func(ctx context.Context, id uint, businessID uint) (*domain.Booking, error) {
			return nil, expectedErr
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	// Act
	result, err := uc.GetBookingByID(context.Background(), 1, 1)

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
