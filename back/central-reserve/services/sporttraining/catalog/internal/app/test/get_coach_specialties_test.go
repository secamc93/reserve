package app_test

import (
	"context"
	"errors"
	"testing"

	"central_reserve/services/sporttraining/catalog/internal/app"
	"central_reserve/services/sporttraining/catalog/internal/app/test/mocks"
	"central_reserve/services/sporttraining/catalog/internal/domain"
)

func TestGetCoachSpecialties_Success(t *testing.T) {
	// Arrange
	expectedSpecialties := []domain.CoachSpecialty{
		{
			ID:          1,
			Name:        "Fútbol",
			Code:        "football",
			Description: "Especialista en fútbol",
			Icon:        "⚽",
			IsActive:    true,
		},
		{
			ID:          2,
			Name:        "Baloncesto",
			Code:        "basketball",
			Description: "Especialista en baloncesto",
			Icon:        "🏀",
			IsActive:    true,
		},
	}

	mockRepo := &mocks.MockCatalogRepository{
		GetCoachSpecialtiesFunc: func(ctx context.Context) ([]domain.CoachSpecialty, error) {
			return expectedSpecialties, nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	// Act
	result, err := uc.GetCoachSpecialties(context.Background())

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if len(result) != 2 {
		t.Errorf("expected 2 specialties, got %d", len(result))
	}

	if result[0].Code != "football" {
		t.Errorf("expected first specialty code 'football', got '%s'", result[0].Code)
	}

	if result[1].Icon != "🏀" {
		t.Errorf("expected second specialty icon '🏀', got '%s'", result[1].Icon)
	}

	if !result[0].IsActive {
		t.Error("expected first specialty to be active")
	}
}

func TestGetCoachSpecialties_EmptyList(t *testing.T) {
	// Arrange
	mockRepo := &mocks.MockCatalogRepository{
		GetCoachSpecialtiesFunc: func(ctx context.Context) ([]domain.CoachSpecialty, error) {
			return []domain.CoachSpecialty{}, nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	// Act
	result, err := uc.GetCoachSpecialties(context.Background())

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if len(result) != 0 {
		t.Errorf("expected empty list, got %d items", len(result))
	}
}

func TestGetCoachSpecialties_RepositoryError(t *testing.T) {
	// Arrange
	expectedErr := errors.New("database connection error")

	mockRepo := &mocks.MockCatalogRepository{
		GetCoachSpecialtiesFunc: func(ctx context.Context) ([]domain.CoachSpecialty, error) {
			return nil, expectedErr
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	// Act
	result, err := uc.GetCoachSpecialties(context.Background())

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
