package app_test

import (
	"context"
	"errors"
	"testing"

	"central_reserve/services/sporttraining/traininggroup/internal/app"
	"central_reserve/services/sporttraining/traininggroup/internal/app/test/mocks"
	"central_reserve/services/sporttraining/traininggroup/internal/domain"
)

func TestAddPlayerToGroup_Success(t *testing.T) {
	// Arrange
	mockRepo := &mocks.MockGroupRepository{
		AddPlayerFunc: func(ctx context.Context, dto domain.AddPlayerDTO) error {
			return nil
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	dto := domain.AddPlayerDTO{
		GroupID:  1,
		PlayerID: 100,
		Notes:    "Jugador transferido desde otro grupo",
	}

	// Act
	err := uc.AddPlayerToGroup(context.Background(), dto)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
}

func TestAddPlayerToGroup_AlreadyInGroup(t *testing.T) {
	// Arrange
	mockRepo := &mocks.MockGroupRepository{
		AddPlayerFunc: func(ctx context.Context, dto domain.AddPlayerDTO) error {
			return domain.ErrPlayerAlreadyInGroup
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	dto := domain.AddPlayerDTO{
		GroupID:  1,
		PlayerID: 100,
	}

	// Act
	err := uc.AddPlayerToGroup(context.Background(), dto)

	// Assert
	if err == nil {
		t.Fatal("expected error for player already in group, got nil")
	}

	if !errors.Is(err, domain.ErrPlayerAlreadyInGroup) {
		t.Errorf("expected ErrPlayerAlreadyInGroup, got %v", err)
	}
}

func TestAddPlayerToGroup_GroupFull(t *testing.T) {
	// Arrange
	mockRepo := &mocks.MockGroupRepository{
		AddPlayerFunc: func(ctx context.Context, dto domain.AddPlayerDTO) error {
			return domain.ErrGroupFull
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	dto := domain.AddPlayerDTO{
		GroupID:  1,
		PlayerID: 100,
	}

	// Act
	err := uc.AddPlayerToGroup(context.Background(), dto)

	// Assert
	if err == nil {
		t.Fatal("expected error for group full, got nil")
	}

	if !errors.Is(err, domain.ErrGroupFull) {
		t.Errorf("expected ErrGroupFull, got %v", err)
	}
}

func TestAddPlayerToGroup_RepositoryError(t *testing.T) {
	// Arrange
	expectedErr := errors.New("database insert error")

	mockRepo := &mocks.MockGroupRepository{
		AddPlayerFunc: func(ctx context.Context, dto domain.AddPlayerDTO) error {
			return expectedErr
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockRepo, mockLogger)

	dto := domain.AddPlayerDTO{
		GroupID:  1,
		PlayerID: 100,
	}

	// Act
	err := uc.AddPlayerToGroup(context.Background(), dto)

	// Assert
	if err == nil {
		t.Fatal("expected error from repository, got nil")
	}

	if !errors.Is(err, expectedErr) {
		t.Errorf("expected error %v, got %v", expectedErr, err)
	}
}
