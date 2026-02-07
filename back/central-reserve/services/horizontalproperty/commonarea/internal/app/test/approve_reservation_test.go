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

func TestApproveReservation_Success(t *testing.T) {
	// Arrange
	reservationID := uint(1)
	userID := uint(10)

	var capturedReservation *domain.CommonAreaReservation

	mockReservationRepo := &mocks.MockReservationRepository{
		ChangeReservationStatusFunc: func(ctx context.Context, id uint, statusCode string) error {
			if id != reservationID {
				return fmt.Errorf("reservation not found")
			}
			if statusCode != "approved" {
				return fmt.Errorf("invalid status code")
			}
			return nil
		},
		GetReservationByIDFunc: func(ctx context.Context, id uint) (*domain.CommonAreaReservation, error) {
			if id != reservationID {
				return nil, domain.ErrReservationNotFound
			}

			// Si ya se actualizó, retornar con los campos de aprobación
			if capturedReservation != nil {
				return capturedReservation, nil
			}

			// Primera llamada: reserva sin aprobar
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
	result, err := uc.ApproveReservation(context.Background(), reservationID, userID)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result == nil {
		t.Fatal("expected result, got nil")
	}

	if result.ApprovedByUserID == nil {
		t.Fatal("expected ApprovedByUserID to be set")
	}

	if *result.ApprovedByUserID != userID {
		t.Errorf("expected ApprovedByUserID %d, got %d", userID, *result.ApprovedByUserID)
	}

	if result.ApprovedAt == nil {
		t.Fatal("expected ApprovedAt to be set")
	}

	if time.Since(*result.ApprovedAt) > time.Second {
		t.Error("expected ApprovedAt to be recent")
	}
}

func TestApproveReservation_ChangeStatusError(t *testing.T) {
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
	result, err := uc.ApproveReservation(context.Background(), reservationID, userID)

	// Assert
	if err == nil {
		t.Fatal("expected error from ChangeReservationStatus, got nil")
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}

	// Verificar que el error contenga el error original
	if !errors.Is(err, expectedErr) {
		t.Errorf("expected error to wrap %v, got %v", expectedErr, err)
	}
}

func TestApproveReservation_GetReservationError(t *testing.T) {
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
	result, err := uc.ApproveReservation(context.Background(), reservationID, userID)

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

func TestApproveReservation_UpdateReservationError(t *testing.T) {
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
	result, err := uc.ApproveReservation(context.Background(), reservationID, userID)

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
