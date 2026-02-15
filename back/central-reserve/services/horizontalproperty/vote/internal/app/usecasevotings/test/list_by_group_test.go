package usecasevotings_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"central_reserve/services/horizontalproperty/vote/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/vote/internal/app/usecasevotings"
	"central_reserve/services/horizontalproperty/vote/internal/domain"
)

func TestListVotingsByGroup_Success(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecasevotings.New(mockRepo, mockCache, mockLogger)

	groupID := uint(1)

	expectedVotings := []domain.Voting{
		{
			ID:              1,
			VotingGroupID:   groupID,
			Title:           "Votación 1",
			Description:     "Descripción 1",
			VotingType:      "simple",
			IsSecret:        false,
			AllowAbstention: true,
			IsActive:        true,
			DisplayOrder:    1,
			CreatedAt:       time.Now(),
			UpdatedAt:       time.Now(),
		},
		{
			ID:              2,
			VotingGroupID:   groupID,
			Title:           "Votación 2",
			Description:     "Descripción 2",
			VotingType:      "qualified",
			IsSecret:        true,
			AllowAbstention: false,
			IsActive:        true,
			DisplayOrder:    2,
			CreatedAt:       time.Now(),
			UpdatedAt:       time.Now(),
		},
	}

	mockRepo.ListVotingsByGroupFn = func(ctx context.Context, gID uint) ([]domain.Voting, error) {
		if gID == groupID {
			return expectedVotings, nil
		}
		return []domain.Voting{}, nil
	}

	// Act
	result, err := useCase.ListVotingsByGroup(ctx, groupID)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if len(result) != len(expectedVotings) {
		t.Errorf("expected %d votings, got %d", len(expectedVotings), len(result))
	}

	if len(result) > 0 {
		if result[0].ID != expectedVotings[0].ID {
			t.Errorf("expected first voting ID %d, got %d", expectedVotings[0].ID, result[0].ID)
		}

		if result[0].Title != expectedVotings[0].Title {
			t.Errorf("expected first voting title %s, got %s", expectedVotings[0].Title, result[0].Title)
		}
	}

	if len(result) > 1 {
		if result[1].DisplayOrder != 2 {
			t.Errorf("expected second voting display order 2, got %d", result[1].DisplayOrder)
		}
	}
}

func TestListVotingsByGroup_EmptyResult(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecasevotings.New(mockRepo, mockCache, mockLogger)

	groupID := uint(999) // Grupo sin votaciones

	mockRepo.ListVotingsByGroupFn = func(ctx context.Context, gID uint) ([]domain.Voting, error) {
		return []domain.Voting{}, nil
	}

	// Act
	result, err := useCase.ListVotingsByGroup(ctx, groupID)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if len(result) != 0 {
		t.Errorf("expected 0 votings, got %d", len(result))
	}
}

func TestListVotingsByGroup_RepositoryError(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecasevotings.New(mockRepo, mockCache, mockLogger)

	groupID := uint(1)
	expectedErr := errors.New("database connection error")

	mockRepo.ListVotingsByGroupFn = func(ctx context.Context, gID uint) ([]domain.Voting, error) {
		return nil, expectedErr
	}

	// Act
	result, err := useCase.ListVotingsByGroup(ctx, groupID)

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

func TestListVotingsByGroup_OrderedByDisplayOrder(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecasevotings.New(mockRepo, mockCache, mockLogger)

	groupID := uint(1)

	expectedVotings := []domain.Voting{
		{
			ID:           1,
			Title:        "Primera",
			DisplayOrder: 1,
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
		},
		{
			ID:           2,
			Title:        "Segunda",
			DisplayOrder: 2,
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
		},
		{
			ID:           3,
			Title:        "Tercera",
			DisplayOrder: 3,
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
		},
	}

	mockRepo.ListVotingsByGroupFn = func(ctx context.Context, gID uint) ([]domain.Voting, error) {
		return expectedVotings, nil
	}

	// Act
	result, err := useCase.ListVotingsByGroup(ctx, groupID)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if len(result) != 3 {
		t.Errorf("expected 3 votings, got %d", len(result))
	}

	// Verificar orden
	for i := 0; i < len(result)-1; i++ {
		if result[i].DisplayOrder > result[i+1].DisplayOrder {
			t.Errorf("votings not ordered correctly: position %d has order %d, next has %d",
				i, result[i].DisplayOrder, result[i+1].DisplayOrder)
		}
	}
}
