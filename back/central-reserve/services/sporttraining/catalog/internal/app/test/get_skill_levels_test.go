package app_test

import (
	"context"
	"errors"
	"testing"

	"central_reserve/services/sporttraining/catalog/internal/app"
	"central_reserve/services/sporttraining/catalog/internal/app/test/mocks"
	"central_reserve/services/sporttraining/catalog/internal/domain"
)

func TestGetSkillLevels_Success(t *testing.T) {
	// Arrange
	expectedLevels := []domain.PlayerSkillLevel{
		{
			ID:          1,
			Name:        "Principiante",
			Code:        "beginner",
			Description: "Nivel básico",
			Level:       1,
			Color:       "#00FF00",
			IsActive:    true,
		},
		{
			ID:          2,
			Name:        "Intermedio",
			Code:        "intermediate",
			Description: "Nivel medio",
			Level:       2,
			Color:       "#FFFF00",
			IsActive:    true,
		},
		{
			ID:          3,
			Name:        "Avanzado",
			Code:        "advanced",
			Description: "Nivel alto",
			Level:       3,
			Color:       "#FF0000",
			IsActive:    true,
		},
	}

	mockRepo := &mocks.MockCatalogRepository{
		GetSkillLevelsFunc: func(ctx context.Context) ([]domain.PlayerSkillLevel, error) {
			return expectedLevels, nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	// Act
	result, err := uc.GetSkillLevels(context.Background())

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if len(result) != 3 {
		t.Errorf("expected 3 skill levels, got %d", len(result))
	}

	if result[0].Code != "beginner" {
		t.Errorf("expected first level code 'beginner', got '%s'", result[0].Code)
	}

	if result[1].Level != 2 {
		t.Errorf("expected second level number 2, got %d", result[1].Level)
	}

	if !result[2].IsActive {
		t.Error("expected third level to be active")
	}
}

func TestGetSkillLevels_EmptyList(t *testing.T) {
	// Arrange
	mockRepo := &mocks.MockCatalogRepository{
		GetSkillLevelsFunc: func(ctx context.Context) ([]domain.PlayerSkillLevel, error) {
			return []domain.PlayerSkillLevel{}, nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	// Act
	result, err := uc.GetSkillLevels(context.Background())

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if len(result) != 0 {
		t.Errorf("expected empty list, got %d items", len(result))
	}
}

func TestGetSkillLevels_RepositoryError(t *testing.T) {
	// Arrange
	expectedErr := errors.New("database connection error")

	mockRepo := &mocks.MockCatalogRepository{
		GetSkillLevelsFunc: func(ctx context.Context) ([]domain.PlayerSkillLevel, error) {
			return nil, expectedErr
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	// Act
	result, err := uc.GetSkillLevels(context.Background())

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
