package app_test

import (
	"context"
	"errors"
	"testing"

	"central_reserve/services/sporttraining/catalog/internal/app"
	"central_reserve/services/sporttraining/catalog/internal/app/test/mocks"
	"central_reserve/services/sporttraining/catalog/internal/domain"
)

func TestGetAttendanceStatuses_Success(t *testing.T) {
	// Arrange
	expectedStatuses := []domain.AttendanceStatus{
		{
			ID:          1,
			Name:        "Presente",
			Code:        "present",
			Description: "Asistió a la sesión",
			Color:       "#00FF00",
			Icon:        "✅",
			IsActive:    true,
		},
		{
			ID:          2,
			Name:        "Ausente",
			Code:        "absent",
			Description: "No asistió a la sesión",
			Color:       "#FF0000",
			Icon:        "❌",
			IsActive:    true,
		},
		{
			ID:          3,
			Name:        "Justificado",
			Code:        "excused",
			Description: "Ausencia justificada",
			Color:       "#FFA500",
			Icon:        "📝",
			IsActive:    true,
		},
	}

	mockRepo := &mocks.MockCatalogRepository{
		GetAttendanceStatusesFunc: func(ctx context.Context) ([]domain.AttendanceStatus, error) {
			return expectedStatuses, nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	// Act
	result, err := uc.GetAttendanceStatuses(context.Background())

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if len(result) != 3 {
		t.Errorf("expected 3 attendance statuses, got %d", len(result))
	}

	if result[0].Code != "present" {
		t.Errorf("expected first status code 'present', got '%s'", result[0].Code)
	}

	if result[0].Icon != "✅" {
		t.Errorf("expected first status icon '✅', got '%s'", result[0].Icon)
	}

	if result[1].Color != "#FF0000" {
		t.Errorf("expected second status color '#FF0000', got '%s'", result[1].Color)
	}

	if !result[2].IsActive {
		t.Error("expected third status to be active")
	}
}

func TestGetAttendanceStatuses_EmptyList(t *testing.T) {
	// Arrange
	mockRepo := &mocks.MockCatalogRepository{
		GetAttendanceStatusesFunc: func(ctx context.Context) ([]domain.AttendanceStatus, error) {
			return []domain.AttendanceStatus{}, nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	// Act
	result, err := uc.GetAttendanceStatuses(context.Background())

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if len(result) != 0 {
		t.Errorf("expected empty list, got %d items", len(result))
	}
}

func TestGetAttendanceStatuses_RepositoryError(t *testing.T) {
	// Arrange
	expectedErr := errors.New("database connection error")

	mockRepo := &mocks.MockCatalogRepository{
		GetAttendanceStatusesFunc: func(ctx context.Context) ([]domain.AttendanceStatus, error) {
			return nil, expectedErr
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	// Act
	result, err := uc.GetAttendanceStatuses(context.Background())

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
