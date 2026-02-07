package app_test

import (
	"context"
	"errors"
	"testing"

	"central_reserve/services/sporttraining/traininggroup/internal/app"
	"central_reserve/services/sporttraining/traininggroup/internal/app/test/mocks"
	"central_reserve/services/sporttraining/traininggroup/internal/domain"
)

func TestRemovePlayerFromGroup_Success(t *testing.T) {
	// Arrange
	mockRepo := &mocks.MockGroupRepository{
		RemovePlayerFunc: func(ctx context.Context, groupID uint, playerID uint, businessID uint) error {
			return nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	// Act
	err := uc.RemovePlayerFromGroup(context.Background(), 1, 100, 1)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
}

func TestRemovePlayerFromGroup_PlayerNotInGroup(t *testing.T) {
	// Arrange
	mockRepo := &mocks.MockGroupRepository{
		RemovePlayerFunc: func(ctx context.Context, groupID uint, playerID uint, businessID uint) error {
			return domain.ErrPlayerNotInGroup
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	// Act
	err := uc.RemovePlayerFromGroup(context.Background(), 1, 999, 1)

	// Assert
	if err == nil {
		t.Fatal("expected error for player not in group, got nil")
	}

	if !errors.Is(err, domain.ErrPlayerNotInGroup) {
		t.Errorf("expected ErrPlayerNotInGroup, got %v", err)
	}
}

func TestRemovePlayerFromGroup_RepositoryError(t *testing.T) {
	// Arrange
	expectedErr := errors.New("database delete error")

	mockRepo := &mocks.MockGroupRepository{
		RemovePlayerFunc: func(ctx context.Context, groupID uint, playerID uint, businessID uint) error {
			return expectedErr
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	// Act
	err := uc.RemovePlayerFromGroup(context.Background(), 1, 100, 1)

	// Assert
	if err == nil {
		t.Fatal("expected error from repository, got nil")
	}

	if !errors.Is(err, expectedErr) {
		t.Errorf("expected error %v, got %v", expectedErr, err)
	}
}
