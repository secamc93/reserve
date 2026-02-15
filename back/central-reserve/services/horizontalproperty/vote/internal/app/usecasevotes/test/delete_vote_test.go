package usecasevotes_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"central_reserve/services/horizontalproperty/vote/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/vote/internal/app/usecasevotes"
	"central_reserve/services/horizontalproperty/vote/internal/domain"
)

func TestDeleteVote_Success(t *testing.T) {
	// Arrange
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()
	useCase := usecasevotes.New(mockRepo, mockCache, mockLogger)

	ctx := context.Background()
	voteID := uint(1)
	votingID := uint(100)

	// Mock: Obtener voto existente
	mockRepo.GetVoteByIDFn = func(ctx context.Context, id uint) (*domain.Vote, error) {
		if id == voteID {
			return &domain.Vote{
				ID:             voteID,
				VotingID:       votingID,
				PropertyUnitID: 200,
				VotingOptionID: 10,
				VotedAt:        time.Now(),
			}, nil
		}
		return nil, errors.New("vote not found")
	}

	// Mock: Eliminar voto exitoso
	mockRepo.DeleteVoteFn = func(ctx context.Context, id uint) error {
		if id == voteID {
			return nil
		}
		return errors.New("vote not found")
	}

	// Mock: Remover del cache exitoso
	mockCache.RemoveVoteFn = func(votingID, voteID uint) error {
		return nil
	}

	// Act
	err := useCase.DeleteVote(ctx, voteID)

	// Assert
	if err != nil {
		t.Fatalf("Expected no error, got: %v", err)
	}
}

func TestDeleteVote_InvalidVoteID(t *testing.T) {
	// Arrange
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()
	useCase := usecasevotes.New(mockRepo, mockCache, mockLogger)

	ctx := context.Background()
	voteID := uint(0) // ID inválido

	// Act
	err := useCase.DeleteVote(ctx, voteID)

	// Assert
	if err == nil {
		t.Fatal("Expected validation error, got nil")
	}

	if err.Error() != "el ID del voto es requerido" {
		t.Errorf("Expected 'el ID del voto es requerido', got: %v", err)
	}
}

func TestDeleteVote_ErrorGettingVote(t *testing.T) {
	// Arrange
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()
	useCase := usecasevotes.New(mockRepo, mockCache, mockLogger)

	ctx := context.Background()
	voteID := uint(1)
	expectedErr := errors.New("database error getting vote")

	// Mock: Error al obtener voto
	mockRepo.GetVoteByIDFn = func(ctx context.Context, id uint) (*domain.Vote, error) {
		return nil, expectedErr
	}

	// Act
	err := useCase.DeleteVote(ctx, voteID)

	// Assert
	if err == nil {
		t.Fatal("Expected error, got nil")
	}

	if err != expectedErr {
		t.Errorf("Expected error '%v', got: %v", expectedErr, err)
	}
}

func TestDeleteVote_ErrorDeletingVote(t *testing.T) {
	// Arrange
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()
	useCase := usecasevotes.New(mockRepo, mockCache, mockLogger)

	ctx := context.Background()
	voteID := uint(1)
	votingID := uint(100)
	expectedErr := errors.New("database error deleting vote")

	// Mock: Obtener voto exitoso
	mockRepo.GetVoteByIDFn = func(ctx context.Context, id uint) (*domain.Vote, error) {
		return &domain.Vote{
			ID:       voteID,
			VotingID: votingID,
		}, nil
	}

	// Mock: Error al eliminar voto
	mockRepo.DeleteVoteFn = func(ctx context.Context, id uint) error {
		return expectedErr
	}

	// Act
	err := useCase.DeleteVote(ctx, voteID)

	// Assert
	if err == nil {
		t.Fatal("Expected error, got nil")
	}

	if err != expectedErr {
		t.Errorf("Expected error '%v', got: %v", expectedErr, err)
	}
}

func TestDeleteVote_CacheRemoveError_VoteStillDeleted(t *testing.T) {
	// Arrange
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()
	useCase := usecasevotes.New(mockRepo, mockCache, mockLogger)

	ctx := context.Background()
	voteID := uint(1)
	votingID := uint(100)

	// Mock: Obtener voto exitoso
	mockRepo.GetVoteByIDFn = func(ctx context.Context, id uint) (*domain.Vote, error) {
		return &domain.Vote{
			ID:       voteID,
			VotingID: votingID,
		}, nil
	}

	// Mock: Eliminar voto exitoso
	mockRepo.DeleteVoteFn = func(ctx context.Context, id uint) error {
		return nil
	}

	// Mock: Error al remover del cache (NO debe fallar la eliminación)
	mockCache.RemoveVoteFn = func(votingID, voteID uint) error {
		return errors.New("redis connection failed")
	}

	// Act
	err := useCase.DeleteVote(ctx, voteID)

	// Assert
	// El voto debe eliminarse exitosamente aunque falle el cache
	if err != nil {
		t.Fatalf("Expected no error (cache error should be ignored), got: %v", err)
	}
}
