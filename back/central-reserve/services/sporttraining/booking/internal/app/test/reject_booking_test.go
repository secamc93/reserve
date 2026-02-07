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

func TestRejectBooking_Success(t *testing.T) {
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

	rejectedStatus := &domain.StatusRef{
		ID:      4,
		Code:    "rejected",
		Name:    "Rechazada",
		Color:   "#FF0000",
		IsFinal: true,
	}

	var updatedBooking *domain.Booking

	mockRepo := &mocks.MockBookingRepository{
		GetByIDFunc: func(ctx context.Context, id uint, businessID uint) (*domain.Booking, error) {
			return existingBooking, nil
		},
		GetBookingStatusByCodeFunc: func(ctx context.Context, code string) (*domain.StatusRef, error) {
			if code == "rejected" {
				return rejectedStatus, nil
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

	dto := domain.RejectBookingDTO{
		ID:         1,
		BusinessID: 1,
		CoachID:    10,
		Notes:      "No hay disponibilidad en ese horario",
	}

	// Act
	result, err := uc.RejectBooking(context.Background(), dto)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result.BookingStatusID != rejectedStatus.ID {
		t.Errorf("expected BookingStatusID %d, got %d", rejectedStatus.ID, result.BookingStatusID)
	}

	if updatedBooking.ReviewedAt == nil {
		t.Error("expected ReviewedAt to be set")
	}

	if updatedBooking.ReviewedByCoachID == nil || *updatedBooking.ReviewedByCoachID != 10 {
		t.Errorf("expected ReviewedByCoachID 10, got %v", updatedBooking.ReviewedByCoachID)
	}

	if updatedBooking.ResponseNotes != "No hay disponibilidad en ese horario" {
		t.Errorf("expected ResponseNotes 'No hay disponibilidad en ese horario', got '%s'", updatedBooking.ResponseNotes)
	}
}

func TestRejectBooking_AlreadyInFinalState(t *testing.T) {
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

	dto := domain.RejectBookingDTO{
		ID:         1,
		BusinessID: 1,
		CoachID:    10,
		Notes:      "Intentando rechazar",
	}

	// Act
	result, err := uc.RejectBooking(context.Background(), dto)

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

func TestRejectBooking_GetByIDError(t *testing.T) {
	// Arrange
	expectedErr := errors.New("booking not found")

	mockRepo := &mocks.MockBookingRepository{
		GetByIDFunc: func(ctx context.Context, id uint, businessID uint) (*domain.Booking, error) {
			return nil, expectedErr
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	dto := domain.RejectBookingDTO{
		ID:         999,
		BusinessID: 1,
		CoachID:    10,
	}

	// Act
	result, err := uc.RejectBooking(context.Background(), dto)

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

func TestRejectBooking_GetStatusError(t *testing.T) {
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

	dto := domain.RejectBookingDTO{
		ID:         1,
		BusinessID: 1,
		CoachID:    10,
	}

	// Act
	result, err := uc.RejectBooking(context.Background(), dto)

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

func TestRejectBooking_UpdateError(t *testing.T) {
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

	rejectedStatus := &domain.StatusRef{
		ID:      4,
		Code:    "rejected",
		Name:    "Rechazada",
		IsFinal: true,
	}

	expectedErr := errors.New("database update error")

	mockRepo := &mocks.MockBookingRepository{
		GetByIDFunc: func(ctx context.Context, id uint, businessID uint) (*domain.Booking, error) {
			return existingBooking, nil
		},
		GetBookingStatusByCodeFunc: func(ctx context.Context, code string) (*domain.StatusRef, error) {
			return rejectedStatus, nil
		},
		UpdateFunc: func(ctx context.Context, booking *domain.Booking) (*domain.Booking, error) {
			return nil, expectedErr
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	dto := domain.RejectBookingDTO{
		ID:         1,
		BusinessID: 1,
		CoachID:    10,
	}

	// Act
	result, err := uc.RejectBooking(context.Background(), dto)

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
