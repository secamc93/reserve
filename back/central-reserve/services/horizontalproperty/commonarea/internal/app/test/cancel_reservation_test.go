package app_test

import (
	"context"
	"errors"
	"fmt"
	"testing"
	"time"

	"central_reserve/services/horizontalproperty/commonarea/internal/app"
	"central_reserve/services/horizontalproperty/commonarea/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/commonarea/internal/domain"
)

func TestCancelReservation_Success(t *testing.T) {
	// Arrange
	reservationID := uint(1)
	userID := uint(10)
	reason := "Cambio de planes"

	var capturedReservation *domain.CommonAreaReservation

	mockReservationRepo := &mocks.MockReservationRepository{
		ChangeReservationStatusFunc: func(ctx context.Context, id uint, statusCode string) error {
			if id != reservationID {
				return fmt.Errorf("reservation not found")
			}
			if statusCode != "cancelled" {
				return fmt.Errorf("invalid status code")
			}
			return nil
		},
		GetReservationByIDFunc: func(ctx context.Context, id uint) (*domain.CommonAreaReservation, error) {
			if id != reservationID {
				return nil, domain.ErrReservationNotFound
			}

			// Si ya se actualizó, retornar con los campos de cancelación
			if capturedReservation != nil {
				return capturedReservation, nil
			}

			// Primera llamada: reserva sin cancelar
			return &domain.CommonAreaReservation{
				ID:                  reservationID,
				CommonAreaID:        1,
				PropertyUnitID:      100,
				ReservationStatusID: 1,
			}, nil
		},
		UpdateReservationFunc: func(ctx context.Context, reservation *domain.CommonAreaReservation) error {
			capturedReservation = reservation
			return nil
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
	result, err := uc.CancelReservation(context.Background(), reservationID, userID, reason)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result == nil {
		t.Fatal("expected result, got nil")
	}

	if result.CancelledByUserID == nil {
		t.Fatal("expected CancelledByUserID to be set")
	}

	if *result.CancelledByUserID != userID {
		t.Errorf("expected CancelledByUserID %d, got %d", userID, *result.CancelledByUserID)
	}

	if result.CancelledAt == nil {
		t.Fatal("expected CancelledAt to be set")
	}

	if time.Since(*result.CancelledAt) > time.Second {
		t.Error("expected CancelledAt to be recent")
	}

	if result.CancellationReason != reason {
		t.Errorf("expected CancellationReason '%s', got '%s'", reason, result.CancellationReason)
	}
}

func TestCancelReservation_EmptyReason(t *testing.T) {
	// Arrange
	reservationID := uint(1)
	userID := uint(10)
	reason := "" // Razón vacía está permitida en CancelReservation

	var capturedReservation *domain.CommonAreaReservation

	mockReservationRepo := &mocks.MockReservationRepository{
		ChangeReservationStatusFunc: func(ctx context.Context, id uint, statusCode string) error {
			return nil
		},
		GetReservationByIDFunc: func(ctx context.Context, id uint) (*domain.CommonAreaReservation, error) {
			if capturedReservation != nil {
				return capturedReservation, nil
			}
			return &domain.CommonAreaReservation{
				ID:             reservationID,
				CommonAreaID:   1,
				PropertyUnitID: 100,
			}, nil
		},
		UpdateReservationFunc: func(ctx context.Context, reservation *domain.CommonAreaReservation) error {
			capturedReservation = reservation
			return nil
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
	result, err := uc.CancelReservation(context.Background(), reservationID, userID, reason)

	// Assert
	if err != nil {
		t.Fatalf("expected no error even with empty reason, got %v", err)
	}

	if result == nil {
		t.Fatal("expected result, got nil")
	}

	if result.CancellationReason != "" {
		t.Errorf("expected empty CancellationReason, got '%s'", result.CancellationReason)
	}
}

func TestCancelReservation_ChangeStatusError(t *testing.T) {
	// Arrange
	reservationID := uint(1)
	userID := uint(10)
	reason := "Cambio de planes"
	expectedErr := errors.New("status change failed")

	mockReservationRepo := &mocks.MockReservationRepository{
		ChangeReservationStatusFunc: func(ctx context.Context, id uint, statusCode string) error {
			return expectedErr
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
	result, err := uc.CancelReservation(context.Background(), reservationID, userID, reason)

	// Assert
	if err == nil {
		t.Fatal("expected error from ChangeReservationStatus, got nil")
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}

	if !errors.Is(err, expectedErr) {
		t.Errorf("expected error to wrap %v, got %v", expectedErr, err)
	}
}

func TestCancelReservation_GetReservationError(t *testing.T) {
	// Arrange
	reservationID := uint(999)
	userID := uint(10)
	reason := "Cambio de planes"

	mockReservationRepo := &mocks.MockReservationRepository{
		ChangeReservationStatusFunc: func(ctx context.Context, id uint, statusCode string) error {
			return nil
		},
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
	result, err := uc.CancelReservation(context.Background(), reservationID, userID, reason)

	// Assert
	if err == nil {
		t.Fatal("expected error for reservation not found, got nil")
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}

	if !errors.Is(err, domain.ErrReservationNotFound) {
		t.Errorf("expected ErrReservationNotFound, got %v", err)
	}
}

func TestCancelReservation_UpdateReservationError(t *testing.T) {
	// Arrange
	reservationID := uint(1)
	userID := uint(10)
	reason := "Cambio de planes"
	expectedErr := errors.New("update failed")

	mockReservationRepo := &mocks.MockReservationRepository{
		ChangeReservationStatusFunc: func(ctx context.Context, id uint, statusCode string) error {
			return nil
		},
		GetReservationByIDFunc: func(ctx context.Context, id uint) (*domain.CommonAreaReservation, error) {
			return &domain.CommonAreaReservation{
				ID:             reservationID,
				CommonAreaID:   1,
				PropertyUnitID: 100,
			}, nil
		},
		UpdateReservationFunc: func(ctx context.Context, reservation *domain.CommonAreaReservation) error {
			return expectedErr
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
	result, err := uc.CancelReservation(context.Background(), reservationID, userID, reason)

	// Assert
	if err == nil {
		t.Fatal("expected error from UpdateReservation, got nil")
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}

	if !errors.Is(err, expectedErr) {
		t.Errorf("expected error %v, got %v", expectedErr, err)
	}
}
