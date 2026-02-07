package app_test

import (
	"context"
	"errors"
	"testing"

	"central_reserve/services/sporttraining/catalog/internal/app"
	"central_reserve/services/sporttraining/catalog/internal/app/test/mocks"
	"central_reserve/services/sporttraining/catalog/internal/domain"
)

func TestGetSessionTypes_Success(t *testing.T) {
	// Arrange
	price := 50000.0
	expectedTypes := []domain.TrainingSessionType{
		{
			ID:               1,
			Name:             "Entrenamiento Individual",
			Code:             "individual",
			Description:      "Sesión personalizada uno a uno",
			DefaultDuration:  60,
			DefaultPrice:     &price,
			AllowsIndividual: true,
			AllowsGroup:      false,
			Icon:             "👤",
			Color:            "#0000FF",
			IsActive:         true,
		},
		{
			ID:               2,
			Name:             "Entrenamiento Grupal",
			Code:             "group",
			Description:      "Sesión en grupo",
			DefaultDuration:  90,
			DefaultPrice:     nil,
			AllowsIndividual: false,
			AllowsGroup:      true,
			Icon:             "👥",
			Color:            "#00FF00",
			IsActive:         true,
		},
	}

	mockRepo := &mocks.MockCatalogRepository{
		GetSessionTypesFunc: func(ctx context.Context) ([]domain.TrainingSessionType, error) {
			return expectedTypes, nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	// Act
	result, err := uc.GetSessionTypes(context.Background())

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if len(result) != 2 {
		t.Errorf("expected 2 session types, got %d", len(result))
	}

	if result[0].Code != "individual" {
		t.Errorf("expected first type code 'individual', got '%s'", result[0].Code)
	}

	if result[0].DefaultDuration != 60 {
		t.Errorf("expected first type duration 60, got %d", result[0].DefaultDuration)
	}

	if result[0].DefaultPrice == nil || *result[0].DefaultPrice != 50000.0 {
		t.Error("expected first type to have default price of 50000.0")
	}

	if !result[0].AllowsIndividual {
		t.Error("expected first type to allow individual sessions")
	}

	if result[1].DefaultPrice != nil {
		t.Error("expected second type to have no default price")
	}

	if !result[1].AllowsGroup {
		t.Error("expected second type to allow group sessions")
	}
}

func TestGetSessionTypes_EmptyList(t *testing.T) {
	// Arrange
	mockRepo := &mocks.MockCatalogRepository{
		GetSessionTypesFunc: func(ctx context.Context) ([]domain.TrainingSessionType, error) {
			return []domain.TrainingSessionType{}, nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	// Act
	result, err := uc.GetSessionTypes(context.Background())

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if len(result) != 0 {
		t.Errorf("expected empty list, got %d items", len(result))
	}
}

func TestGetSessionTypes_RepositoryError(t *testing.T) {
	// Arrange
	expectedErr := errors.New("database connection error")

	mockRepo := &mocks.MockCatalogRepository{
		GetSessionTypesFunc: func(ctx context.Context) ([]domain.TrainingSessionType, error) {
			return nil, expectedErr
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	// Act
	result, err := uc.GetSessionTypes(context.Background())

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
