package usecasevotinggroups_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"central_reserve/services/horizontalproperty/vote/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/vote/internal/app/usecasevotinggroups"
	"central_reserve/services/horizontalproperty/vote/internal/domain"
)

func TestDeleteVotingGroup_Success(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecasevotinggroups.New(mockRepo, mockCache, mockLogger)

	groupID := uint(1)
	var deletedID uint
	clearedVotings := make([]uint, 0)

	// Mock votings that belong to the group
	mockVotings := []domain.Voting{
		{ID: 10, VotingGroupID: groupID, Title: "Votación 1", CreatedAt: time.Now()},
		{ID: 20, VotingGroupID: groupID, Title: "Votación 2", CreatedAt: time.Now()},
	}

	mockRepo.ListVotingsByGroupFn = func(ctx context.Context, gID uint) ([]domain.Voting, error) {
		if gID == groupID {
			return mockVotings, nil
		}
		return []domain.Voting{}, nil
	}

	mockRepo.DeleteVotingGroupFn = func(ctx context.Context, id uint) error {
		deletedID = id
		return nil
	}

	mockCache.ClearVotingFn = func(votingID uint) error {
		clearedVotings = append(clearedVotings, votingID)
		return nil
	}

	// Act
	err := useCase.DeleteVotingGroup(ctx, groupID)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if deletedID != groupID {
		t.Errorf("expected deleted ID %d, got %d", groupID, deletedID)
	}

	if len(clearedVotings) != len(mockVotings) {
		t.Errorf("expected %d votings to be cleared from cache, got %d", len(mockVotings), len(clearedVotings))
	}

	// Verify all votings were cleared
	for _, voting := range mockVotings {
		found := false
		for _, cleared := range clearedVotings {
			if cleared == voting.ID {
				found = true
				break
			}
		}
		if !found {
			t.Errorf("expected voting %d to be cleared from cache", voting.ID)
		}
	}
}

func TestDeleteVotingGroup_NoVotings(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecasevotinggroups.New(mockRepo, mockCache, mockLogger)

	groupID := uint(1)
	var deletedID uint

	mockRepo.ListVotingsByGroupFn = func(ctx context.Context, gID uint) ([]domain.Voting, error) {
		return []domain.Voting{}, nil
	}

	mockRepo.DeleteVotingGroupFn = func(ctx context.Context, id uint) error {
		deletedID = id
		return nil
	}

	// Act
	err := useCase.DeleteVotingGroup(ctx, groupID)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if deletedID != groupID {
		t.Errorf("expected deleted ID %d, got %d", groupID, deletedID)
	}
}

func TestDeleteVotingGroup_ErrorListingVotings(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecasevotinggroups.New(mockRepo, mockCache, mockLogger)

	groupID := uint(1)
	expectedErr := errors.New("error listing votings")

	mockRepo.ListVotingsByGroupFn = func(ctx context.Context, gID uint) ([]domain.Voting, error) {
		return nil, expectedErr
	}

	// Act
	err := useCase.DeleteVotingGroup(ctx, groupID)

	// Assert
	if err == nil {
		t.Fatal("expected error, got nil")
	}
}

func TestDeleteVotingGroup_ErrorDeletingGroup(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecasevotinggroups.New(mockRepo, mockCache, mockLogger)

	groupID := uint(1)
	expectedErr := errors.New("database connection error")

	mockRepo.ListVotingsByGroupFn = func(ctx context.Context, gID uint) ([]domain.Voting, error) {
		return []domain.Voting{}, nil
	}

	mockRepo.DeleteVotingGroupFn = func(ctx context.Context, id uint) error {
		return expectedErr
	}

	// Act
	err := useCase.DeleteVotingGroup(ctx, groupID)

	// Assert
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if !errors.Is(err, expectedErr) {
		t.Errorf("expected error %v, got %v", expectedErr, err)
	}
}

func TestDeleteVotingGroup_CacheClearError(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecasevotinggroups.New(mockRepo, mockCache, mockLogger)

	groupID := uint(1)
	mockVotings := []domain.Voting{
		{ID: 10, VotingGroupID: groupID, Title: "Votación 1", CreatedAt: time.Now()},
	}

	mockRepo.ListVotingsByGroupFn = func(ctx context.Context, gID uint) ([]domain.Voting, error) {
		return mockVotings, nil
	}

	mockRepo.DeleteVotingGroupFn = func(ctx context.Context, id uint) error {
		return nil
	}

	mockCache.ClearVotingFn = func(votingID uint) error {
		return errors.New("cache error")
	}

	// Act
	err := useCase.DeleteVotingGroup(ctx, groupID)

	// Assert - Should NOT return error even if cache clear fails
	if err != nil {
		t.Fatalf("expected no error (cache errors should be logged but not returned), got %v", err)
	}
}
