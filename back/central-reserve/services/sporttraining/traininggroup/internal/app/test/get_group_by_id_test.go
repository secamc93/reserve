package app_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"central_reserve/services/sporttraining/traininggroup/internal/app"
	"central_reserve/services/sporttraining/traininggroup/internal/app/test/mocks"
	"central_reserve/services/sporttraining/traininggroup/internal/domain"
)

func TestGetGroupByID_Success(t *testing.T) {
	// Arrange
	expectedGroup := &domain.TrainingGroup{
		ID:              1,
		BusinessID:      1,
		CoachID:         100,
		Name:            "Grupo Avanzado",
		Code:            "GA",
		Category:        "Avanzado",
		MaxCapacity:     15,
		CurrentCapacity: 10,
		IsActive:        true,
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
	}

	mockRepo := &mocks.MockGroupRepository{
		GetByIDFunc: func(ctx context.Context, id uint, businessID uint) (*domain.TrainingGroup, error) {
			if id == 1 && businessID == 1 {
				return expectedGroup, nil
			}
			return nil, domain.ErrGroupNotFound
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	// Act
	result, err := uc.GetGroupByID(context.Background(), 1, 1)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result.ID != expectedGroup.ID {
		t.Errorf("expected ID %d, got %d", expectedGroup.ID, result.ID)
	}

	if result.Name != expectedGroup.Name {
		t.Errorf("expected name '%s', got '%s'", expectedGroup.Name, result.Name)
	}

	if result.CurrentCapacity != expectedGroup.CurrentCapacity {
		t.Errorf("expected current capacity %d, got %d", expectedGroup.CurrentCapacity, result.CurrentCapacity)
	}
}

func TestGetGroupByID_NotFound(t *testing.T) {
	// Arrange
	mockRepo := &mocks.MockGroupRepository{
		GetByIDFunc: func(ctx context.Context, id uint, businessID uint) (*domain.TrainingGroup, error) {
			return nil, domain.ErrGroupNotFound
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	// Act
	result, err := uc.GetGroupByID(context.Background(), 999, 1)

	// Assert
	if err == nil {
		t.Fatal("expected error for not found group, got nil")
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}

	if !errors.Is(err, domain.ErrGroupNotFound) {
		t.Errorf("expected ErrGroupNotFound, got %v", err)
	}
}

func TestGetGroupByID_RepositoryError(t *testing.T) {
	// Arrange
	expectedErr := errors.New("database connection error")

	mockRepo := &mocks.MockGroupRepository{
		GetByIDFunc: func(ctx context.Context, id uint, businessID uint) (*domain.TrainingGroup, error) {
			return nil, expectedErr
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	// Act
	result, err := uc.GetGroupByID(context.Background(), 1, 1)

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
