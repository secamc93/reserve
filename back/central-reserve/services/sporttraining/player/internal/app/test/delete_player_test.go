package app_test

import (
	"context"
	"errors"
	"testing"

	"central_reserve/services/sporttraining/player/internal/app"
	"central_reserve/services/sporttraining/player/internal/app/test/mocks"
	"central_reserve/services/sporttraining/player/internal/domain"
)

func TestDeletePlayer_Success(t *testing.T) {
	// Arrange
	mockPlayerRepo := &mocks.MockPlayerRepository{
		DeleteFunc: func(ctx context.Context, id uint, businessID uint) error {
			if id == 1 && businessID == 1 {
				return nil
			}
			return domain.ErrPlayerNotFound
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockPlayerRepo, mockLogger)

	// Act
	err := uc.DeletePlayer(context.Background(), 1, 1)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
}

func TestDeletePlayer_NotFound(t *testing.T) {
	// Arrange
	mockPlayerRepo := &mocks.MockPlayerRepository{
		DeleteFunc: func(ctx context.Context, id uint, businessID uint) error {
			return domain.ErrPlayerNotFound
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockPlayerRepo, mockLogger)

	// Act
	err := uc.DeletePlayer(context.Background(), 999, 1)

	// Assert
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if !errors.Is(err, domain.ErrPlayerNotFound) {
		t.Errorf("expected ErrPlayerNotFound, got %v", err)
	}
}

func TestDeletePlayer_RepositoryError(t *testing.T) {
	// Arrange
	expectedErr := errors.New("database delete error")

	mockPlayerRepo := &mocks.MockPlayerRepository{
		DeleteFunc: func(ctx context.Context, id uint, businessID uint) error {
			return expectedErr
		},
	}
	mockLogger := mocks.NewMockLogger()

	uc := app.New(mockPlayerRepo, mockLogger)

	// Act
	err := uc.DeletePlayer(context.Background(), 1, 1)

	// Assert
	if err == nil {
		t.Fatal("expected error from repository, got nil")
	}

	if !errors.Is(err, expectedErr) {
		t.Errorf("expected error %v, got %v", expectedErr, err)
	}
}
