package usecasevotinggroups_test

import (
	"context"
	"errors"
	"testing"

	"central_reserve/services/horizontalproperty/vote/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/vote/internal/app/usecasevotinggroups"
)

func TestDeactivateVotingGroup_Success(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecasevotinggroups.New(mockRepo, mockCache, mockLogger)

	groupID := uint(1)
	var deactivatedID uint

	mockRepo.DeactivateVotingGroupFn = func(ctx context.Context, id uint) error {
		deactivatedID = id
		return nil
	}

	// Act
	err := useCase.DeactivateVotingGroup(ctx, groupID)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if deactivatedID != groupID {
		t.Errorf("expected deactivated ID %d, got %d", groupID, deactivatedID)
	}
}

func TestDeactivateVotingGroup_RepositoryError(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecasevotinggroups.New(mockRepo, mockCache, mockLogger)

	groupID := uint(1)
	expectedErr := errors.New("database connection error")

	mockRepo.DeactivateVotingGroupFn = func(ctx context.Context, id uint) error {
		return expectedErr
	}

	// Act
	err := useCase.DeactivateVotingGroup(ctx, groupID)

	// Assert
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if !errors.Is(err, expectedErr) {
		t.Errorf("expected error %v, got %v", expectedErr, err)
	}
}

func TestDeactivateVotingGroup_NotFound(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecasevotinggroups.New(mockRepo, mockCache, mockLogger)

	groupID := uint(999)
	expectedErr := errors.New("voting group not found")

	mockRepo.DeactivateVotingGroupFn = func(ctx context.Context, id uint) error {
		return expectedErr
	}

	// Act
	err := useCase.DeactivateVotingGroup(ctx, groupID)

	// Assert
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if !errors.Is(err, expectedErr) {
		t.Errorf("expected error %v, got %v", expectedErr, err)
	}
}
