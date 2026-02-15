package app_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"central_reserve/services/sporttraining/attendance/internal/app"
	"central_reserve/services/sporttraining/attendance/internal/app/test/mocks"
	"central_reserve/services/sporttraining/attendance/internal/domain"
)

func TestRecordAttendance_Success(t *testing.T) {
	// Arrange
	now := time.Now()
	mockRepo := &mocks.MockAttendanceRepository{
		CreateFunc: func(ctx context.Context, record *domain.AttendanceRecord) (*domain.AttendanceRecord, error) {
			record.ID = 1
			record.CreatedAt = now
			record.UpdatedAt = now
			return record, nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	checkInTime := time.Now()
	rating := 4
	dto := domain.CreateAttendanceDTO{
		TrainingSessionID:  1,
		PlayerID:           100,
		AttendanceStatusID: 1,
		RecordedByCoachID:  50,
		BusinessID:         10,
		CheckInTime:        &checkInTime,
		PerformanceRating:  &rating,
		CoachFeedback:      "Excelente participación",
		PlayerNotes:        "Me sentí muy bien",
	}

	// Act
	result, err := uc.RecordAttendance(context.Background(), dto)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result.ID != 1 {
		t.Errorf("expected ID 1, got %d", result.ID)
	}

	if result.TrainingSessionID != dto.TrainingSessionID {
		t.Errorf("expected TrainingSessionID %d, got %d", dto.TrainingSessionID, result.TrainingSessionID)
	}

	if result.PlayerID != dto.PlayerID {
		t.Errorf("expected PlayerID %d, got %d", dto.PlayerID, result.PlayerID)
	}

	if result.AttendanceStatusID != dto.AttendanceStatusID {
		t.Errorf("expected AttendanceStatusID %d, got %d", dto.AttendanceStatusID, result.AttendanceStatusID)
	}

	if result.RecordedByCoachID != dto.RecordedByCoachID {
		t.Errorf("expected RecordedByCoachID %d, got %d", dto.RecordedByCoachID, result.RecordedByCoachID)
	}

	if result.CheckInTime == nil || !result.CheckInTime.Equal(checkInTime) {
		t.Errorf("expected CheckInTime %v, got %v", checkInTime, result.CheckInTime)
	}

	if result.PerformanceRating == nil || *result.PerformanceRating != rating {
		t.Errorf("expected PerformanceRating %d, got %v", rating, result.PerformanceRating)
	}

	if result.CoachFeedback != dto.CoachFeedback {
		t.Errorf("expected CoachFeedback '%s', got '%s'", dto.CoachFeedback, result.CoachFeedback)
	}

	if result.PlayerNotes != dto.PlayerNotes {
		t.Errorf("expected PlayerNotes '%s', got '%s'", dto.PlayerNotes, result.PlayerNotes)
	}

	if result.RecordedAt.IsZero() {
		t.Error("expected RecordedAt to be set")
	}
}

func TestRecordAttendance_MinimalData(t *testing.T) {
	// Arrange
	mockRepo := &mocks.MockAttendanceRepository{
		CreateFunc: func(ctx context.Context, record *domain.AttendanceRecord) (*domain.AttendanceRecord, error) {
			record.ID = 2
			return record, nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	dto := domain.CreateAttendanceDTO{
		TrainingSessionID:  1,
		PlayerID:           100,
		AttendanceStatusID: 1,
		RecordedByCoachID:  50,
		BusinessID:         10,
		// Sin CheckInTime, PerformanceRating, CoachFeedback, PlayerNotes
	}

	// Act
	result, err := uc.RecordAttendance(context.Background(), dto)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result.ID != 2 {
		t.Errorf("expected ID 2, got %d", result.ID)
	}

	if result.CheckInTime != nil {
		t.Errorf("expected CheckInTime to be nil, got %v", result.CheckInTime)
	}

	if result.PerformanceRating != nil {
		t.Errorf("expected PerformanceRating to be nil, got %v", result.PerformanceRating)
	}

	if result.CoachFeedback != "" {
		t.Errorf("expected empty CoachFeedback, got '%s'", result.CoachFeedback)
	}

	if result.PlayerNotes != "" {
		t.Errorf("expected empty PlayerNotes, got '%s'", result.PlayerNotes)
	}
}

func TestRecordAttendance_RepositoryError(t *testing.T) {
	// Arrange
	expectedErr := errors.New("database connection error")

	mockRepo := &mocks.MockAttendanceRepository{
		CreateFunc: func(ctx context.Context, record *domain.AttendanceRecord) (*domain.AttendanceRecord, error) {
			return nil, expectedErr
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	dto := domain.CreateAttendanceDTO{
		TrainingSessionID:  1,
		PlayerID:           100,
		AttendanceStatusID: 1,
		RecordedByCoachID:  50,
		BusinessID:         10,
	}

	// Act
	result, err := uc.RecordAttendance(context.Background(), dto)

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

func TestRecordAttendance_DuplicateRecord(t *testing.T) {
	// Arrange
	expectedErr := domain.ErrAttendanceAlreadyRecorded

	mockRepo := &mocks.MockAttendanceRepository{
		CreateFunc: func(ctx context.Context, record *domain.AttendanceRecord) (*domain.AttendanceRecord, error) {
			return nil, expectedErr
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	dto := domain.CreateAttendanceDTO{
		TrainingSessionID:  1,
		PlayerID:           100,
		AttendanceStatusID: 1,
		RecordedByCoachID:  50,
		BusinessID:         10,
	}

	// Act
	result, err := uc.RecordAttendance(context.Background(), dto)

	// Assert
	if err == nil {
		t.Fatal("expected duplicate error, got nil")
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}

	if !errors.Is(err, expectedErr) {
		t.Errorf("expected error %v, got %v", expectedErr, err)
	}
}
