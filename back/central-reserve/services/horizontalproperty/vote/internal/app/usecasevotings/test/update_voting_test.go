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

func TestUpdateVoting_Success(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecasevotings.New(mockRepo, mockCache, mockLogger)

	votingID := uint(1)
	requiredPercentage := 60.0

	dto := domain.CreateVotingDTO{
		VotingGroupID:      1,
		Title:              "Aprobación de presupuesto actualizado",
		Description:        "Descripción actualizada",
		VotingType:         "qualified",
		IsSecret:           true,
		AllowAbstention:    false,
		DisplayOrder:       2,
		RequiredPercentage: &requiredPercentage,
	}

	expectedVoting := &domain.Voting{
		ID:                 votingID,
		VotingGroupID:      dto.VotingGroupID,
		Title:              dto.Title,
		Description:        dto.Description,
		VotingType:         dto.VotingType,
		IsSecret:           dto.IsSecret,
		AllowAbstention:    dto.AllowAbstention,
		IsActive:           true,
		DisplayOrder:       dto.DisplayOrder,
		RequiredPercentage: dto.RequiredPercentage,
		CreatedAt:          time.Now().Add(-24 * time.Hour),
		UpdatedAt:          time.Now(),
	}

	mockRepo.UpdateVotingFn = func(ctx context.Context, id uint, voting *domain.Voting) (*domain.Voting, error) {
		if id == votingID {
			return expectedVoting, nil
		}
		return nil, errors.New("voting not found")
	}

	// Act
	result, err := useCase.UpdateVoting(ctx, votingID, dto)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result == nil {
		t.Fatal("expected result, got nil")
	}

	if result.ID != votingID {
		t.Errorf("expected ID %d, got %d", votingID, result.ID)
	}

	if result.Title != dto.Title {
		t.Errorf("expected Title %s, got %s", dto.Title, result.Title)
	}

	if result.Description != dto.Description {
		t.Errorf("expected Description %s, got %s", dto.Description, result.Description)
	}

	if result.IsSecret != dto.IsSecret {
		t.Errorf("expected IsSecret %v, got %v", dto.IsSecret, result.IsSecret)
	}
}

func TestUpdateVoting_RepositoryError(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecasevotings.New(mockRepo, mockCache, mockLogger)

	votingID := uint(1)
	expectedErr := errors.New("database error")

	dto := domain.CreateVotingDTO{
		VotingGroupID:   1,
		Title:           "Updated Title",
		Description:     "Updated Description",
		VotingType:      "simple",
		IsSecret:        false,
		AllowAbstention: true,
		DisplayOrder:    1,
	}

	mockRepo.UpdateVotingFn = func(ctx context.Context, id uint, voting *domain.Voting) (*domain.Voting, error) {
		return nil, expectedErr
	}

	// Act
	result, err := useCase.UpdateVoting(ctx, votingID, dto)

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

func TestUpdateVoting_NotFound(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecasevotings.New(mockRepo, mockCache, mockLogger)

	votingID := uint(999) // ID que no existe
	expectedErr := errors.New("voting not found")

	dto := domain.CreateVotingDTO{
		VotingGroupID:   1,
		Title:           "Updated Title",
		Description:     "Updated Description",
		VotingType:      "simple",
		IsSecret:        false,
		AllowAbstention: true,
		DisplayOrder:    1,
	}

	mockRepo.UpdateVotingFn = func(ctx context.Context, id uint, voting *domain.Voting) (*domain.Voting, error) {
		return nil, expectedErr
	}

	// Act
	result, err := useCase.UpdateVoting(ctx, votingID, dto)

	// Assert
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}
}
