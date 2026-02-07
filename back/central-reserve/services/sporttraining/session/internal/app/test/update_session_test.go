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

func TestUpdateSession_Success(t *testing.T) {
	// Arrange
	startTime := time.Now().Add(1 * time.Hour)
	endTime := startTime.Add(2 * time.Hour)
	maxParticipants := 25
	price := 60.0

	mockSessionRepo := &mocks.MockSessionRepository{
		UpdateFunc: func(ctx context.Context, session *domain.TrainingSession) (*domain.TrainingSession, error) {
			return session, nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockSessionRepo, mockLogger)

	dto := domain.UpdateSessionDTO{
		ID:                    1,
		BusinessID:            1,
		TrainingSessionTypeID: 1,
		CoachID:               1,
		TrainingGroupID:       nil,
		SessionMode:           "individual",
		ScheduledDate:         time.Now().AddDate(0, 0, 1),
		StartTime:             startTime,
		EndTime:               endTime,
		Duration:              120,
		Location:              "Cancha Actualizada",
		Field:                 "Campo 3",
		MaxParticipants:       &maxParticipants,
		Price:                 &price,
		IsRecurring:           false,
		CoachNotes:            "Notas actualizadas",
		PublicNotes:           "Información actualizada",
	}

	// Act
	result, err := uc.UpdateSession(context.Background(), dto)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result.ID != dto.ID {
		t.Errorf("expected ID %d, got %d", dto.ID, result.ID)
	}

	if result.Location != "Cancha Actualizada" {
		t.Errorf("expected location 'Cancha Actualizada', got '%s'", result.Location)
	}

	if result.CoachNotes != "Notas actualizadas" {
		t.Errorf("expected coach notes 'Notas actualizadas', got '%s'", result.CoachNotes)
	}
}

func TestUpdateSession_GroupMode_Success(t *testing.T) {
	// Arrange
	startTime := time.Now().Add(1 * time.Hour)
	endTime := startTime.Add(3 * time.Hour)
	groupID := uint(10)
	maxParticipants := 35
	price := 120.0

	mockSessionRepo := &mocks.MockSessionRepository{
		UpdateFunc: func(ctx context.Context, session *domain.TrainingSession) (*domain.TrainingSession, error) {
			return session, nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockSessionRepo, mockLogger)

	dto := domain.UpdateSessionDTO{
		ID:                    2,
		BusinessID:            1,
		TrainingSessionTypeID: 2,
		CoachID:               2,
		TrainingGroupID:       &groupID,
		SessionMode:           "group",
		ScheduledDate:         time.Now().AddDate(0, 0, 2),
		StartTime:             startTime,
		EndTime:               endTime,
		Duration:              180,
		Location:              "Complejo Deportivo",
		Field:                 "Campo Central",
		MaxParticipants:       &maxParticipants,
		Price:                 &price,
		IsRecurring:           true,
		CoachNotes:            "Entrenamiento intensivo",
		PublicNotes:           "Todos deben traer uniformes",
	}

	// Act
	result, err := uc.UpdateSession(context.Background(), dto)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result.SessionMode != "group" {
		t.Errorf("expected session mode 'group', got '%s'", result.SessionMode)
	}

	if !result.IsRecurring {
		t.Error("expected IsRecurring to be true")
	}

	if result.Duration != 180 {
		t.Errorf("expected duration 180, got %d", result.Duration)
	}
}

func TestUpdateSession_InvalidDates_EndBeforeStart(t *testing.T) {
	// Arrange
	startTime := time.Now().Add(2 * time.Hour)
	endTime := startTime.Add(-1 * time.Hour) // End before start

	mockSessionRepo := &mocks.MockSessionRepository{}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockSessionRepo, mockLogger)

	dto := domain.UpdateSessionDTO{
		ID:                    1,
		BusinessID:            1,
		TrainingSessionTypeID: 1,
		CoachID:               1,
		SessionMode:           "individual",
		ScheduledDate:         time.Now().AddDate(0, 0, 1),
		StartTime:             startTime,
		EndTime:               endTime,
		Duration:              60,
	}

	// Act
	result, err := uc.UpdateSession(context.Background(), dto)

	// Assert
	if err == nil {
		t.Fatal("expected error for invalid dates, got nil")
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}

	if !errors.Is(err, domain.ErrInvalidSessionDates) {
		t.Errorf("expected error %v, got %v", domain.ErrInvalidSessionDates, err)
	}
}

func TestUpdateSession_InvalidSessionMode(t *testing.T) {
	// Arrange
	startTime := time.Now().Add(1 * time.Hour)
	endTime := startTime.Add(2 * time.Hour)

	mockSessionRepo := &mocks.MockSessionRepository{}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockSessionRepo, mockLogger)

	dto := domain.UpdateSessionDTO{
		ID:                    1,
		BusinessID:            1,
		TrainingSessionTypeID: 1,
		CoachID:               1,
		SessionMode:           "invalid_mode",
		ScheduledDate:         time.Now().AddDate(0, 0, 1),
		StartTime:             startTime,
		EndTime:               endTime,
		Duration:              120,
	}

	// Act
	result, err := uc.UpdateSession(context.Background(), dto)

	// Assert
	if err == nil {
		t.Fatal("expected error for invalid session mode, got nil")
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}

	if !errors.Is(err, domain.ErrInvalidSessionMode) {
		t.Errorf("expected error %v, got %v", domain.ErrInvalidSessionMode, err)
	}
}

func TestUpdateSession_RepositoryError(t *testing.T) {
	// Arrange
	expectedErr := errors.New("database update error")
	startTime := time.Now().Add(1 * time.Hour)
	endTime := startTime.Add(2 * time.Hour)

	mockSessionRepo := &mocks.MockSessionRepository{
		UpdateFunc: func(ctx context.Context, session *domain.TrainingSession) (*domain.TrainingSession, error) {
			return nil, expectedErr
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockSessionRepo, mockLogger)

	dto := domain.UpdateSessionDTO{
		ID:                    1,
		BusinessID:            1,
		TrainingSessionTypeID: 1,
		CoachID:               1,
		SessionMode:           "individual",
		ScheduledDate:         time.Now().AddDate(0, 0, 1),
		StartTime:             startTime,
		EndTime:               endTime,
		Duration:              120,
	}

	// Act
	result, err := uc.UpdateSession(context.Background(), dto)

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
