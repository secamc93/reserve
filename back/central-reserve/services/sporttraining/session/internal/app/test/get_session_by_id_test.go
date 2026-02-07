package app_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"central_reserve/services/sporttraining/session/internal/app"
	"central_reserve/services/sporttraining/session/internal/app/test/mocks"
	"central_reserve/services/sporttraining/session/internal/domain"
)

func TestGetSessionByID_Success(t *testing.T) {
	// Arrange
	expectedSession := &domain.TrainingSession{
		ID:                    1,
		BusinessID:            1,
		TrainingSessionTypeID: 1,
		CoachID:               1,
		SessionMode:           "individual",
		ScheduledDate:         time.Now().AddDate(0, 0, 1),
		StartTime:             time.Now().Add(1 * time.Hour),
		EndTime:               time.Now().Add(3 * time.Hour),
		Duration:              120,
		Location:              "Cancha Principal",
		Field:                 "Campo 1",
		Status:                "scheduled",
		CurrentParticipants:   0,
		CreatedAt:             time.Now(),
		UpdatedAt:             time.Now(),
	}

	mockSessionRepo := &mocks.MockSessionRepository{
		GetByIDFunc: func(ctx context.Context, id uint, businessID uint) (*domain.TrainingSession, error) {
			return expectedSession, nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockSessionRepo, mockLogger)

	// Act
	result, err := uc.GetSessionByID(context.Background(), 1, 1)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result == nil {
		t.Fatal("expected result, got nil")
	}

	if result.ID != expectedSession.ID {
		t.Errorf("expected ID %d, got %d", expectedSession.ID, result.ID)
	}

	if result.SessionMode != expectedSession.SessionMode {
		t.Errorf("expected session mode '%s', got '%s'", expectedSession.SessionMode, result.SessionMode)
	}

	if result.Status != expectedSession.Status {
		t.Errorf("expected status '%s', got '%s'", expectedSession.Status, result.Status)
	}
}

func TestGetSessionByID_NotFound(t *testing.T) {
	// Arrange
	expectedErr := domain.ErrSessionNotFound

	mockSessionRepo := &mocks.MockSessionRepository{
		GetByIDFunc: func(ctx context.Context, id uint, businessID uint) (*domain.TrainingSession, error) {
			return nil, expectedErr
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockSessionRepo, mockLogger)

	// Act
	result, err := uc.GetSessionByID(context.Background(), 999, 1)

	// Assert
	if err == nil {
		t.Fatal("expected error for not found, got nil")
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}

	if !errors.Is(err, expectedErr) {
		t.Errorf("expected error %v, got %v", expectedErr, err)
	}
}

func TestGetSessionByID_RepositoryError(t *testing.T) {
	// Arrange
	expectedErr := errors.New("database connection error")

	mockSessionRepo := &mocks.MockSessionRepository{
		GetByIDFunc: func(ctx context.Context, id uint, businessID uint) (*domain.TrainingSession, error) {
			return nil, expectedErr
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockSessionRepo, mockLogger)

	// Act
	result, err := uc.GetSessionByID(context.Background(), 1, 1)

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
