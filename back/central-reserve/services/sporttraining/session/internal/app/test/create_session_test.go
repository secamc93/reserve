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

func TestCreateSession_Success(t *testing.T) {
	// Arrange
	startTime := time.Now().Add(1 * time.Hour)
	endTime := startTime.Add(2 * time.Hour)
	maxParticipants := 20
	price := 50.0

	mockSessionRepo := &mocks.MockSessionRepository{
		CreateFunc: func(ctx context.Context, session *domain.TrainingSession) (*domain.TrainingSession, error) {
			session.ID = 1
			return session, nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockSessionRepo, mockLogger)

	dto := domain.CreateSessionDTO{
		BusinessID:            1,
		TrainingSessionTypeID: 1,
		CoachID:               1,
		TrainingGroupID:       nil,
		SessionMode:           "individual",
		ScheduledDate:         time.Now().AddDate(0, 0, 1),
		StartTime:             startTime,
		EndTime:               endTime,
		Duration:              120,
		Location:              "Cancha Principal",
		Field:                 "Campo 1",
		MaxParticipants:       &maxParticipants,
		Price:                 &price,
		IsRecurring:           false,
		CoachNotes:            "Sesión de entrenamiento técnico",
		PublicNotes:           "Traer implementos propios",
	}

	// Act
	result, err := uc.CreateSession(context.Background(), dto)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result.ID != 1 {
		t.Errorf("expected ID 1, got %d", result.ID)
	}

	if result.SessionMode != "individual" {
		t.Errorf("expected session mode 'individual', got '%s'", result.SessionMode)
	}

	if result.Status != "scheduled" {
		t.Errorf("expected status 'scheduled', got '%s'", result.Status)
	}

	if result.CurrentParticipants != 0 {
		t.Errorf("expected CurrentParticipants 0, got %d", result.CurrentParticipants)
	}
}

func TestCreateSession_GroupMode_Success(t *testing.T) {
	// Arrange
	startTime := time.Now().Add(1 * time.Hour)
	endTime := startTime.Add(2 * time.Hour)
	groupID := uint(5)
	maxParticipants := 30
	price := 100.0

	mockSessionRepo := &mocks.MockSessionRepository{
		CreateFunc: func(ctx context.Context, session *domain.TrainingSession) (*domain.TrainingSession, error) {
			session.ID = 2
			return session, nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockSessionRepo, mockLogger)

	dto := domain.CreateSessionDTO{
		BusinessID:            1,
		TrainingSessionTypeID: 2,
		CoachID:               1,
		TrainingGroupID:       &groupID,
		SessionMode:           "group",
		ScheduledDate:         time.Now().AddDate(0, 0, 1),
		StartTime:             startTime,
		EndTime:               endTime,
		Duration:              120,
		Location:              "Cancha Principal",
		Field:                 "Campo 2",
		MaxParticipants:       &maxParticipants,
		Price:                 &price,
		IsRecurring:           true,
		CoachNotes:            "Entrenamiento grupal",
		PublicNotes:           "Sesión para categoría sub-15",
	}

	// Act
	result, err := uc.CreateSession(context.Background(), dto)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result.ID != 2 {
		t.Errorf("expected ID 2, got %d", result.ID)
	}

	if result.SessionMode != "group" {
		t.Errorf("expected session mode 'group', got '%s'", result.SessionMode)
	}

	if !result.IsRecurring {
		t.Error("expected IsRecurring to be true")
	}
}

func TestCreateSession_InvalidDates_EndBeforeStart(t *testing.T) {
	// Arrange
	startTime := time.Now().Add(2 * time.Hour)
	endTime := startTime.Add(-1 * time.Hour) // End before start

	mockSessionRepo := &mocks.MockSessionRepository{}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockSessionRepo, mockLogger)

	dto := domain.CreateSessionDTO{
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
	result, err := uc.CreateSession(context.Background(), dto)

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

func TestCreateSession_InvalidDates_EndEqualsStart(t *testing.T) {
	// Arrange
	startTime := time.Now().Add(1 * time.Hour)
	endTime := startTime // Same time

	mockSessionRepo := &mocks.MockSessionRepository{}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockSessionRepo, mockLogger)

	dto := domain.CreateSessionDTO{
		BusinessID:            1,
		TrainingSessionTypeID: 1,
		CoachID:               1,
		SessionMode:           "individual",
		ScheduledDate:         time.Now().AddDate(0, 0, 1),
		StartTime:             startTime,
		EndTime:               endTime,
		Duration:              0,
	}

	// Act
	result, err := uc.CreateSession(context.Background(), dto)

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

func TestCreateSession_InvalidSessionMode(t *testing.T) {
	// Arrange
	startTime := time.Now().Add(1 * time.Hour)
	endTime := startTime.Add(2 * time.Hour)

	mockSessionRepo := &mocks.MockSessionRepository{}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockSessionRepo, mockLogger)

	tests := []struct {
		name        string
		sessionMode string
	}{
		{"Invalid mode 'team'", "team"},
		{"Invalid mode 'private'", "private"},
		{"Empty mode", ""},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			dto := domain.CreateSessionDTO{
				BusinessID:            1,
				TrainingSessionTypeID: 1,
				CoachID:               1,
				SessionMode:           tt.sessionMode,
				ScheduledDate:         time.Now().AddDate(0, 0, 1),
				StartTime:             startTime,
				EndTime:               endTime,
				Duration:              120,
			}

			// Act
			result, err := uc.CreateSession(context.Background(), dto)

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
		})
	}
}

func TestCreateSession_RepositoryError(t *testing.T) {
	// Arrange
	expectedErr := errors.New("database connection error")
	startTime := time.Now().Add(1 * time.Hour)
	endTime := startTime.Add(2 * time.Hour)

	mockSessionRepo := &mocks.MockSessionRepository{
		CreateFunc: func(ctx context.Context, session *domain.TrainingSession) (*domain.TrainingSession, error) {
			return nil, expectedErr
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockSessionRepo, mockLogger)

	dto := domain.CreateSessionDTO{
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
	result, err := uc.CreateSession(context.Background(), dto)

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
