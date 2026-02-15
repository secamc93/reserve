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

func TestGetVotingGroupByID_Success(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecasevotinggroups.New(mockRepo, mockCache, mockLogger)

	groupID := uint(1)
	quorum := 50.0
	expectedGroup := &domain.VotingGroup{
		ID:               groupID,
		BusinessID:       1,
		Name:             "Asamblea General 2024",
		Description:      "Asamblea ordinaria anual",
		VotingStartDate:  time.Now(),
		VotingEndDate:    time.Now().Add(24 * time.Hour),
		IsActive:         true,
		RequiresQuorum:   true,
		QuorumPercentage: &quorum,
		CreatedAt:        time.Now(),
		UpdatedAt:        time.Now(),
	}

	mockRepo.GetVotingGroupByIDFn = func(ctx context.Context, id uint) (*domain.VotingGroup, error) {
		if id == groupID {
			return expectedGroup, nil
		}
		return nil, errors.New("not found")
	}

	// Act
	result, err := useCase.GetVotingGroupByID(ctx, groupID)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result == nil {
		t.Fatal("expected result, got nil")
	}

	if result.ID != expectedGroup.ID {
		t.Errorf("expected ID %d, got %d", expectedGroup.ID, result.ID)
	}

	if result.Name != expectedGroup.Name {
		t.Errorf("expected Name %s, got %s", expectedGroup.Name, result.Name)
	}

	if result.BusinessID != expectedGroup.BusinessID {
		t.Errorf("expected BusinessID %d, got %d", expectedGroup.BusinessID, result.BusinessID)
	}

	if !result.IsActive {
		t.Error("expected IsActive to be true")
	}

	if result.RequiresQuorum != expectedGroup.RequiresQuorum {
		t.Errorf("expected RequiresQuorum %v, got %v", expectedGroup.RequiresQuorum, result.RequiresQuorum)
	}

	if result.QuorumPercentage == nil {
		t.Error("expected QuorumPercentage to be set")
	} else if *result.QuorumPercentage != *expectedGroup.QuorumPercentage {
		t.Errorf("expected QuorumPercentage %f, got %f", *expectedGroup.QuorumPercentage, *result.QuorumPercentage)
	}
}

func TestGetVotingGroupByID_NotFound(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecasevotinggroups.New(mockRepo, mockCache, mockLogger)

	groupID := uint(999)
	expectedErr := errors.New("voting group not found")

	mockRepo.GetVotingGroupByIDFn = func(ctx context.Context, id uint) (*domain.VotingGroup, error) {
		return nil, expectedErr
	}

	// Act
	result, err := useCase.GetVotingGroupByID(ctx, groupID)

	// Assert
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}

	if !errors.Is(err, expectedErr) {
		t.Errorf("expected error %v, got %v", expectedErr, err)
	}
}

func TestGetVotingGroupByID_RepositoryError(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecasevotinggroups.New(mockRepo, mockCache, mockLogger)

	groupID := uint(1)
	expectedErr := errors.New("database connection error")

	mockRepo.GetVotingGroupByIDFn = func(ctx context.Context, id uint) (*domain.VotingGroup, error) {
		return nil, expectedErr
	}

	// Act
	result, err := useCase.GetVotingGroupByID(ctx, groupID)

	// Assert
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}

	if !errors.Is(err, expectedErr) {
		t.Errorf("expected error %v, got %v", expectedErr, err)
	}
}
