package app_test

import (
	"context"
	"errors"
	"testing"

	"central_reserve/services/sporttraining/catalog/internal/app"
	"central_reserve/services/sporttraining/catalog/internal/app/test/mocks"
	"central_reserve/services/sporttraining/catalog/internal/domain"
)

func TestGetBookingStatuses_Success(t *testing.T) {
	// Arrange
	expectedStatuses := []domain.BookingStatus{
		{
			ID:          1,
			Name:        "Pendiente",
			Code:        "pending",
			Description: "Reserva pendiente de confirmación",
			Color:       "#FFA500",
			Icon:        "⏳",
			IsFinal:     false,
			IsActive:    true,
		},
		{
			ID:          2,
			Name:        "Confirmada",
			Code:        "confirmed",
			Description: "Reserva confirmada",
			Color:       "#00FF00",
			Icon:        "✅",
			IsFinal:     false,
			IsActive:    true,
		},
		{
			ID:          3,
			Name:        "Completada",
			Code:        "completed",
			Description: "Reserva completada",
			Color:       "#0000FF",
			Icon:        "🏁",
			IsFinal:     true,
			IsActive:    true,
		},
	}

	mockRepo := &mocks.MockCatalogRepository{
		GetBookingStatusesFunc: func(ctx context.Context) ([]domain.BookingStatus, error) {
			return expectedStatuses, nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	// Act
	result, err := uc.GetBookingStatuses(context.Background())

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if len(result) != 3 {
		t.Errorf("expected 3 booking statuses, got %d", len(result))
	}

	if result[0].Code != "pending" {
		t.Errorf("expected first status code 'pending', got '%s'", result[0].Code)
	}

	if result[0].IsFinal {
		t.Error("expected first status to not be final")
	}

	if result[1].Icon != "✅" {
		t.Errorf("expected second status icon '✅', got '%s'", result[1].Icon)
	}

	if !result[2].IsFinal {
		t.Error("expected third status to be final")
	}

	if !result[2].IsActive {
		t.Error("expected third status to be active")
	}
}

func TestGetBookingStatuses_EmptyList(t *testing.T) {
	// Arrange
	mockRepo := &mocks.MockCatalogRepository{
		GetBookingStatusesFunc: func(ctx context.Context) ([]domain.BookingStatus, error) {
			return []domain.BookingStatus{}, nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	// Act
	result, err := uc.GetBookingStatuses(context.Background())

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if len(result) != 0 {
		t.Errorf("expected empty list, got %d items", len(result))
	}
}

func TestGetBookingStatuses_RepositoryError(t *testing.T) {
	// Arrange
	expectedErr := errors.New("database connection error")

	mockRepo := &mocks.MockCatalogRepository{
		GetBookingStatusesFunc: func(ctx context.Context) ([]domain.BookingStatus, error) {
			return nil, expectedErr
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	// Act
	result, err := uc.GetBookingStatuses(context.Background())

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
