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

func TestCancelBooking_Success(t *testing.T) {
	// Arrange
	existingBooking := &domain.Booking{
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

	cancelledStatus := &domain.StatusRef{
		ID:      3,
		Code:    "cancelled",
		Name:    "Cancelada",
		Color:   "#808080",
		IsFinal: true,
	}

	var updatedBooking *domain.Booking

	mockRepo := &mocks.MockBookingRepository{
		GetByIDFunc: func(ctx context.Context, id uint, businessID uint) (*domain.Booking, error) {
			return existingBooking, nil
		},
		GetBookingStatusByCodeFunc: func(ctx context.Context, code string) (*domain.StatusRef, error) {
			if code == "cancelled" {
				return cancelledStatus, nil
			}
			return nil, errors.New("status not found")
		},
		UpdateFunc: func(ctx context.Context, booking *domain.Booking) (*domain.Booking, error) {
			updatedBooking = booking
			return booking, nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	dto := domain.CancelBookingDTO{
		ID:         1,
		BusinessID: 1,
		UserID:     3,
		Reason:     "No puedo asistir",
	}

	// Act
	result, err := uc.CancelBooking(context.Background(), dto)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result.BookingStatusID != cancelledStatus.ID {
		t.Errorf("expected BookingStatusID %d, got %d", cancelledStatus.ID, result.BookingStatusID)
	}

	if updatedBooking.CancelledAt == nil {
		t.Error("expected CancelledAt to be set")
	}

	if updatedBooking.CancelledByUserID == nil || *updatedBooking.CancelledByUserID != 3 {
		t.Errorf("expected CancelledByUserID 3, got %v", updatedBooking.CancelledByUserID)
	}

	if updatedBooking.CancellationReason != "No puedo asistir" {
		t.Errorf("expected CancellationReason 'No puedo asistir', got '%s'", updatedBooking.CancellationReason)
	}
}

func TestCancelBooking_AlreadyInFinalState(t *testing.T) {
	// Arrange
	existingBooking := &domain.Booking{
		ID:                1,
		TrainingSessionID: 10,
		PlayerID:          5,
		BookedByUserID:    3,
		BookingStatusID:   2,
		BookingDate:       time.Now(),
		IsPaid:            false,
		CreatedAt:         time.Now(),
		UpdatedAt:         time.Now(),
		Status: &domain.StatusRef{
			ID:      2,
			Code:    "approved",
			Name:    "Aprobada",
			Color:   "#00FF00",
			IsFinal: true, // Estado final
		},
	}

	mockRepo := &mocks.MockBookingRepository{
		GetByIDFunc: func(ctx context.Context, id uint, businessID uint) (*domain.Booking, error) {
			return existingBooking, nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	dto := domain.CancelBookingDTO{
		ID:         1,
		BusinessID: 1,
		UserID:     3,
		Reason:     "Intentando cancelar",
	}

	// Act
	result, err := uc.CancelBooking(context.Background(), dto)

	// Assert
	if err == nil {
		t.Fatal("expected error for booking in final state, got nil")
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}

	if !errors.Is(err, domain.ErrBookingInFinalState) {
		t.Errorf("expected ErrBookingInFinalState, got %v", err)
	}
}

func TestCancelBooking_AlreadyCancelled(t *testing.T) {
	// Arrange
	existingBooking := &domain.Booking{
		ID:                1,
		TrainingSessionID: 10,
		PlayerID:          5,
		BookedByUserID:    3,
		BookingStatusID:   3,
		BookingDate:       time.Now(),
		IsPaid:            false,
		CreatedAt:         time.Now(),
		UpdatedAt:         time.Now(),
		Status: &domain.StatusRef{
			ID:      3,
			Code:    "cancelled",
			Name:    "Cancelada",
			Color:   "#808080",
			IsFinal: true,
		},
	}

	mockRepo := &mocks.MockBookingRepository{
		GetByIDFunc: func(ctx context.Context, id uint, businessID uint) (*domain.Booking, error) {
			return existingBooking, nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	dto := domain.CancelBookingDTO{
		ID:         1,
		BusinessID: 1,
		UserID:     3,
		Reason:     "Ya está cancelada",
	}

	// Act
	result, err := uc.CancelBooking(context.Background(), dto)

	// Assert
	if err == nil {
		t.Fatal("expected error for already cancelled booking, got nil")
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}

	if !errors.Is(err, domain.ErrBookingInFinalState) {
		t.Errorf("expected ErrBookingInFinalState, got %v", err)
	}
}

func TestCancelBooking_GetByIDError(t *testing.T) {
	// Arrange
	expectedErr := errors.New("booking not found")

	mockRepo := &mocks.MockBookingRepository{
		GetByIDFunc: func(ctx context.Context, id uint, businessID uint) (*domain.Booking, error) {
			return nil, expectedErr
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	dto := domain.CancelBookingDTO{
		ID:         999,
		BusinessID: 1,
		UserID:     3,
	}

	// Act
	result, err := uc.CancelBooking(context.Background(), dto)

	// Assert
	if err == nil {
		t.Fatal("expected error from GetByID, got nil")
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}

	if !errors.Is(err, expectedErr) {
		t.Errorf("expected error %v, got %v", expectedErr, err)
	}
}

func TestCancelBooking_GetStatusError(t *testing.T) {
	// Arrange
	existingBooking := &domain.Booking{
		ID:              1,
		BookingStatusID: 1,
		Status: &domain.StatusRef{
			ID:      1,
			Code:    "pending",
			Name:    "Pendiente",
			IsFinal: false,
		},
	}

	expectedErr := errors.New("status not found")

	mockRepo := &mocks.MockBookingRepository{
		GetByIDFunc: func(ctx context.Context, id uint, businessID uint) (*domain.Booking, error) {
			return existingBooking, nil
		},
		GetBookingStatusByCodeFunc: func(ctx context.Context, code string) (*domain.StatusRef, error) {
			return nil, expectedErr
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	dto := domain.CancelBookingDTO{
		ID:         1,
		BusinessID: 1,
		UserID:     3,
	}

	// Act
	result, err := uc.CancelBooking(context.Background(), dto)

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

func TestCancelBooking_UpdateError(t *testing.T) {
	// Arrange
	existingBooking := &domain.Booking{
		ID:              1,
		BookingStatusID: 1,
		Status: &domain.StatusRef{
			ID:      1,
			Code:    "pending",
			Name:    "Pendiente",
			IsFinal: false,
		},
	}

	cancelledStatus := &domain.StatusRef{
		ID:      3,
		Code:    "cancelled",
		Name:    "Cancelada",
		IsFinal: true,
	}

	expectedErr := errors.New("database update error")

	mockRepo := &mocks.MockBookingRepository{
		GetByIDFunc: func(ctx context.Context, id uint, businessID uint) (*domain.Booking, error) {
			return existingBooking, nil
		},
		GetBookingStatusByCodeFunc: func(ctx context.Context, code string) (*domain.StatusRef, error) {
			return cancelledStatus, nil
		},
		UpdateFunc: func(ctx context.Context, booking *domain.Booking) (*domain.Booking, error) {
			return nil, expectedErr
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	dto := domain.CancelBookingDTO{
		ID:         1,
		BusinessID: 1,
		UserID:     3,
	}

	// Act
	result, err := uc.CancelBooking(context.Background(), dto)

	// Assert
	if err == nil {
		t.Fatal("expected error from Update, got nil")
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}

	if !errors.Is(err, expectedErr) {
		t.Errorf("expected error %v, got %v", expectedErr, err)
	}
}
