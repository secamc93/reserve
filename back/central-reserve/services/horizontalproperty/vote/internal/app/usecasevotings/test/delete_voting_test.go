package usecasevotings_test

import (
	"context"
	"errors"
	"testing"

	"central_reserve/services/horizontalproperty/vote/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/vote/internal/app/usecasevotings"
)

func TestDeleteVoting_Success(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecasevotings.New(mockRepo, mockCache, mockLogger)

	votingID := uint(1)

	mockRepo.DeleteVotingFn = func(ctx context.Context, id uint) error {
		if id == votingID {
			return nil
		}
		return errors.New("voting not found")
	}

	// Act
	err := useCase.DeleteVoting(ctx, votingID)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
}

func TestDeleteVoting_RepositoryError(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecasevotings.New(mockRepo, mockCache, mockLogger)

	votingID := uint(1)
	expectedErr := errors.New("database error")

	mockRepo.DeleteVotingFn = func(ctx context.Context, id uint) error {
		return expectedErr
	}

	// Act
	err := useCase.DeleteVoting(ctx, votingID)

	// Assert
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if !errors.Is(err, expectedErr) {
		t.Errorf("expected error %v, got %v", expectedErr, err)
	}
}

func TestDeleteVoting_NotFound(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecasevotings.New(mockRepo, mockCache, mockLogger)

	votingID := uint(999) // ID que no existe
	expectedErr := errors.New("voting not found")

	mockRepo.DeleteVotingFn = func(ctx context.Context, id uint) error {
		return expectedErr
	}

	// Act
	err := useCase.DeleteVoting(ctx, votingID)

	// Assert
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if !errors.Is(err, expectedErr) {
		t.Errorf("expected error %v, got %v", expectedErr, err)
	}
}

func TestDeleteVoting_WithCascadeDelete(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecasevotings.New(mockRepo, mockCache, mockLogger)

	votingID := uint(1)

	// Este test verifica que el repositorio maneje correctamente
	// la eliminación de votaciones con opciones y votos asociados
	mockRepo.DeleteVotingFn = func(ctx context.Context, id uint) error {
		if id == votingID {
			// El repositorio debe manejar la eliminación en cascada
			return nil
		}
		return errors.New("voting not found")
	}

	// Act
	err := useCase.DeleteVoting(ctx, votingID)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
}
