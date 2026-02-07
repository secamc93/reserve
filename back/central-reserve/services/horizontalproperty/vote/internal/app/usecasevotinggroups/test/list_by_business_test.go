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

func TestListVotingGroupsByBusiness_Success(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecasevotinggroups.New(mockRepo, mockCache, mockLogger)

	businessID := uint(1)
	quorum1 := 50.0
	quorum2 := 66.67

	expectedGroups := []domain.VotingGroup{
		{
			ID:               1,
			BusinessID:       businessID,
			Name:             "Asamblea Ordinaria 2024",
			Description:      "Asamblea anual",
			VotingStartDate:  time.Now(),
			VotingEndDate:    time.Now().Add(24 * time.Hour),
			IsActive:         true,
			RequiresQuorum:   true,
			QuorumPercentage: &quorum1,
			CreatedAt:        time.Now(),
			UpdatedAt:        time.Now(),
		},
		{
			ID:               2,
			BusinessID:       businessID,
			Name:             "Asamblea Extraordinaria",
			Description:      "Asamblea especial",
			VotingStartDate:  time.Now().Add(48 * time.Hour),
			VotingEndDate:    time.Now().Add(72 * time.Hour),
			IsActive:         false,
			RequiresQuorum:   true,
			QuorumPercentage: &quorum2,
			CreatedAt:        time.Now(),
			UpdatedAt:        time.Now(),
		},
	}

	mockRepo.ListVotingGroupsByBusinessFn = func(ctx context.Context, bID uint) ([]domain.VotingGroup, error) {
		if bID == businessID {
			return expectedGroups, nil
		}
		return []domain.VotingGroup{}, nil
	}

	// Act
	result, err := useCase.ListVotingGroupsByBusiness(ctx, businessID)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if len(result) != len(expectedGroups) {
		t.Fatalf("expected %d groups, got %d", len(expectedGroups), len(result))
	}

	for i, group := range result {
		if group.ID != expectedGroups[i].ID {
			t.Errorf("group %d: expected ID %d, got %d", i, expectedGroups[i].ID, group.ID)
		}

		if group.Name != expectedGroups[i].Name {
			t.Errorf("group %d: expected Name %s, got %s", i, expectedGroups[i].Name, group.Name)
		}

		if group.BusinessID != businessID {
			t.Errorf("group %d: expected BusinessID %d, got %d", i, businessID, group.BusinessID)
		}
	}
}

func TestListVotingGroupsByBusiness_EmptyResult(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecasevotinggroups.New(mockRepo, mockCache, mockLogger)

	businessID := uint(999)

	mockRepo.ListVotingGroupsByBusinessFn = func(ctx context.Context, bID uint) ([]domain.VotingGroup, error) {
		return []domain.VotingGroup{}, nil
	}

	// Act
	result, err := useCase.ListVotingGroupsByBusiness(ctx, businessID)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if len(result) != 0 {
		t.Errorf("expected empty result, got %d groups", len(result))
	}
}

func TestListVotingGroupsByBusiness_RepositoryError(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecasevotinggroups.New(mockRepo, mockCache, mockLogger)

	businessID := uint(1)
	expectedErr := errors.New("database connection error")

	mockRepo.ListVotingGroupsByBusinessFn = func(ctx context.Context, bID uint) ([]domain.VotingGroup, error) {
		return nil, expectedErr
	}

	// Act
	result, err := useCase.ListVotingGroupsByBusiness(ctx, businessID)

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
