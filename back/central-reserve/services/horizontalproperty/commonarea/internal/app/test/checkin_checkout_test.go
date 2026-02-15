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

// ========== CheckIn Tests ==========

func TestCheckInReservation_Success(t *testing.T) {
	// Arrange
	reservationID := uint(1)
	userID := uint(10)

	var capturedReservation *domain.CommonAreaReservation

	mockReservationRepo := &mocks.MockReservationRepository{
		ChangeReservationStatusFunc: func(ctx context.Context, id uint, statusCode string) error {
			if id != reservationID {
				return fmt.Errorf("reservation not found")
			}
			if statusCode != "checked_in" {
				return fmt.Errorf("invalid status code")
			}
			return nil
		},
		GetReservationByIDFunc: func(ctx context.Context, id uint) (*domain.CommonAreaReservation, error) {
			if id != reservationID {
				return nil, domain.ErrReservationNotFound
			}

			// Si ya se actualizó, retornar con los campos de check-in
			if capturedReservation != nil {
				return capturedReservation, nil
			}

			// Primera llamada: reserva sin check-in
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
	result, err := uc.CheckInReservation(context.Background(), reservationID, userID)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result == nil {
		t.Fatal("expected result, got nil")
	}

	if result.CheckedInByUserID == nil {
		t.Fatal("expected CheckedInByUserID to be set")
	}

	if *result.CheckedInByUserID != userID {
		t.Errorf("expected CheckedInByUserID %d, got %d", userID, *result.CheckedInByUserID)
	}

	if result.CheckedInAt == nil {
		t.Fatal("expected CheckedInAt to be set")
	}

	if time.Since(*result.CheckedInAt) > time.Second {
		t.Error("expected CheckedInAt to be recent")
	}
}

func TestCheckInReservation_ChangeStatusError(t *testing.T) {
	// Arrange
	reservationID := uint(1)
	userID := uint(10)
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
	result, err := uc.CheckInReservation(context.Background(), reservationID, userID)

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

func TestCheckInReservation_GetReservationError(t *testing.T) {
	// Arrange
	reservationID := uint(999)
	userID := uint(10)

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
	result, err := uc.CheckInReservation(context.Background(), reservationID, userID)

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

func TestCheckInReservation_UpdateReservationError(t *testing.T) {
	// Arrange
	reservationID := uint(1)
	userID := uint(10)
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
	result, err := uc.CheckInReservation(context.Background(), reservationID, userID)

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

// ========== CheckOut Tests ==========

func TestCheckOutReservation_Success(t *testing.T) {
	// Arrange
	reservationID := uint(1)
	userID := uint(10)
	checkedInTime := time.Now().Add(-2 * time.Hour)

	var capturedReservation *domain.CommonAreaReservation

	mockReservationRepo := &mocks.MockReservationRepository{
		GetReservationByIDFunc: func(ctx context.Context, id uint) (*domain.CommonAreaReservation, error) {
			if id != reservationID {
				return nil, domain.ErrReservationNotFound
			}

			// Si ya se actualizó, retornar con los campos de check-out
			if capturedReservation != nil {
				return capturedReservation, nil
			}

			// Primera llamada: reserva con check-in previo
			return &domain.CommonAreaReservation{
				ID:                  reservationID,
				CommonAreaID:        1,
				PropertyUnitID:      100,
				ReservationStatusID: 1,
				CheckedInAt:         &checkedInTime,
			}, nil
		},
		ChangeReservationStatusFunc: func(ctx context.Context, id uint, statusCode string) error {
			if id != reservationID {
				return fmt.Errorf("reservation not found")
			}
			if statusCode != "checked_out" {
				return fmt.Errorf("invalid status code")
			}
			return nil
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
	result, err := uc.CheckOutReservation(context.Background(), reservationID, userID)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result == nil {
		t.Fatal("expected result, got nil")
	}

	if result.CheckedOutByUserID == nil {
		t.Fatal("expected CheckedOutByUserID to be set")
	}

	if *result.CheckedOutByUserID != userID {
		t.Errorf("expected CheckedOutByUserID %d, got %d", userID, *result.CheckedOutByUserID)
	}

	if result.CheckedOutAt == nil {
		t.Fatal("expected CheckedOutAt to be set")
	}

	if time.Since(*result.CheckedOutAt) > time.Second {
		t.Error("expected CheckedOutAt to be recent")
	}
}

func TestCheckOutReservation_NoCheckIn(t *testing.T) {
	// Arrange
	reservationID := uint(1)
	userID := uint(10)

	mockReservationRepo := &mocks.MockReservationRepository{
		GetReservationByIDFunc: func(ctx context.Context, id uint) (*domain.CommonAreaReservation, error) {
			return &domain.CommonAreaReservation{
				ID:             reservationID,
				CommonAreaID:   1,
				PropertyUnitID: 100,
				CheckedInAt:    nil, // Sin check-in previo
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

	// Act
	result, err := uc.CheckOutReservation(context.Background(), reservationID, userID)

	// Assert
	if err == nil {
		t.Fatal("expected error for no check-in, got nil")
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}

	expectedErrMsg := "la reserva no tiene check-in registrado"
	if err.Error() != expectedErrMsg {
		t.Errorf("expected error '%s', got '%s'", expectedErrMsg, err.Error())
	}
}

func TestCheckOutReservation_GetReservationError(t *testing.T) {
	// Arrange
	reservationID := uint(999)
	userID := uint(10)

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
	result, err := uc.CheckOutReservation(context.Background(), reservationID, userID)

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

func TestCheckOutReservation_ChangeStatusError(t *testing.T) {
	// Arrange
	reservationID := uint(1)
	userID := uint(10)
	checkedInTime := time.Now().Add(-2 * time.Hour)
	expectedErr := errors.New("status change failed")

	mockReservationRepo := &mocks.MockReservationRepository{
		GetReservationByIDFunc: func(ctx context.Context, id uint) (*domain.CommonAreaReservation, error) {
			return &domain.CommonAreaReservation{
				ID:             reservationID,
				CommonAreaID:   1,
				PropertyUnitID: 100,
				CheckedInAt:    &checkedInTime,
			}, nil
		},
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
	result, err := uc.CheckOutReservation(context.Background(), reservationID, userID)

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

func TestCheckOutReservation_UpdateReservationError(t *testing.T) {
	// Arrange
	reservationID := uint(1)
	userID := uint(10)
	checkedInTime := time.Now().Add(-2 * time.Hour)
	expectedErr := errors.New("update failed")

	mockReservationRepo := &mocks.MockReservationRepository{
		GetReservationByIDFunc: func(ctx context.Context, id uint) (*domain.CommonAreaReservation, error) {
			return &domain.CommonAreaReservation{
				ID:             reservationID,
				CommonAreaID:   1,
				PropertyUnitID: 100,
				CheckedInAt:    &checkedInTime,
			}, nil
		},
		ChangeReservationStatusFunc: func(ctx context.Context, id uint, statusCode string) error {
			return nil
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
	result, err := uc.CheckOutReservation(context.Background(), reservationID, userID)

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
