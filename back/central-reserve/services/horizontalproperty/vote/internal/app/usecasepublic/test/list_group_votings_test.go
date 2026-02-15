package usecasepublic_test

import (
	"context"
	"errors"
	"testing"

	"central_reserve/services/horizontalproperty/vote/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/vote/internal/app/usecasepublic"
	"central_reserve/services/horizontalproperty/vote/internal/domain"
)

func TestListVotingsByGroupWithVoteStatus_Success(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecasepublic.New(mockRepo, mockCache, mockLogger)

	groupID := uint(1)
	propertyUnitID := uint(10)
	requiredPercentage := 50.0

	expectedVotings := []domain.VotingWithStatusDTO{
		{
			ID:                 1,
			VotingGroupID:      groupID,
			Title:              "Aprobación de presupuesto",
			Description:        "Votación para aprobar el presupuesto anual",
			VotingType:         "simple",
			IsSecret:           false,
			AllowAbstention:    true,
			IsActive:           true,
			DisplayOrder:       1,
			RequiredPercentage: &requiredPercentage,
			OptionsCount:       3,
			HasVoted:           false,
		},
		{
			ID:                 2,
			VotingGroupID:      groupID,
			Title:              "Elección de consejo",
			Description:        "Elección de nuevos miembros del consejo",
			VotingType:         "majority",
			IsSecret:           true,
			AllowAbstention:    false,
			IsActive:           true,
			DisplayOrder:       2,
			RequiredPercentage: nil,
			OptionsCount:       5,
			HasVoted:           true,
		},
	}

	mockRepo.ListVotingsByGroupWithVoteStatusFn = func(ctx context.Context, gID uint, unitID uint) ([]domain.VotingWithStatusDTO, error) {
		if gID == groupID && unitID == propertyUnitID {
			return expectedVotings, nil
		}
		return nil, errors.New("not found")
	}

	// Act
	result, err := useCase.ListVotingsByGroupWithVoteStatus(ctx, groupID, propertyUnitID)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result == nil {
		t.Fatal("expected result, got nil")
	}

	if len(result) != len(expectedVotings) {
		t.Fatalf("expected %d votings, got %d", len(expectedVotings), len(result))
	}

	// Verificar primera votación
	if result[0].ID != expectedVotings[0].ID {
		t.Errorf("expected ID %d, got %d", expectedVotings[0].ID, result[0].ID)
	}

	if result[0].Title != expectedVotings[0].Title {
		t.Errorf("expected Title %s, got %s", expectedVotings[0].Title, result[0].Title)
	}

	if result[0].HasVoted != false {
		t.Error("expected HasVoted to be false")
	}

	if result[0].OptionsCount != 3 {
		t.Errorf("expected OptionsCount 3, got %d", result[0].OptionsCount)
	}

	// Verificar segunda votación
	if result[1].HasVoted != true {
		t.Error("expected HasVoted to be true for second voting")
	}

	if result[1].OptionsCount != 5 {
		t.Errorf("expected OptionsCount 5, got %d", result[1].OptionsCount)
	}
}

func TestListVotingsByGroupWithVoteStatus_EmptyList(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecasepublic.New(mockRepo, mockCache, mockLogger)

	groupID := uint(999)
	propertyUnitID := uint(10)

	mockRepo.ListVotingsByGroupWithVoteStatusFn = func(ctx context.Context, gID uint, unitID uint) ([]domain.VotingWithStatusDTO, error) {
		return []domain.VotingWithStatusDTO{}, nil
	}

	// Act
	result, err := useCase.ListVotingsByGroupWithVoteStatus(ctx, groupID, propertyUnitID)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result == nil {
		t.Fatal("expected empty slice, got nil")
	}

	if len(result) != 0 {
		t.Errorf("expected empty slice, got %d items", len(result))
	}
}

func TestListVotingsByGroupWithVoteStatus_RepositoryError(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecasepublic.New(mockRepo, mockCache, mockLogger)

	groupID := uint(1)
	propertyUnitID := uint(10)
	expectedErr := errors.New("database connection error")

	mockRepo.ListVotingsByGroupWithVoteStatusFn = func(ctx context.Context, gID uint, unitID uint) ([]domain.VotingWithStatusDTO, error) {
		return nil, expectedErr
	}

	// Act
	result, err := useCase.ListVotingsByGroupWithVoteStatus(ctx, groupID, propertyUnitID)

	// Assert
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}

	// Verificar que el error contiene el mensaje esperado
	if err.Error() == "" {
		t.Error("expected error message, got empty string")
	}
}

func TestListVotingsByGroupWithVoteStatus_MixedStatuses(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecasepublic.New(mockRepo, mockCache, mockLogger)

	groupID := uint(1)
	propertyUnitID := uint(10)

	votings := []domain.VotingWithStatusDTO{
		{
			ID:           1,
			Title:        "Activa - No votada",
			IsActive:     true,
			HasVoted:     false,
			OptionsCount: 2,
		},
		{
			ID:           2,
			Title:        "Activa - Ya votada",
			IsActive:     true,
			HasVoted:     true,
			OptionsCount: 3,
		},
		{
			ID:           3,
			Title:        "Inactiva - No votada",
			IsActive:     false,
			HasVoted:     false,
			OptionsCount: 2,
		},
	}

	mockRepo.ListVotingsByGroupWithVoteStatusFn = func(ctx context.Context, gID uint, unitID uint) ([]domain.VotingWithStatusDTO, error) {
		return votings, nil
	}

	// Act
	result, err := useCase.ListVotingsByGroupWithVoteStatus(ctx, groupID, propertyUnitID)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if len(result) != 3 {
		t.Fatalf("expected 3 votings, got %d", len(result))
	}

	// Verificar cada estado
	if !result[0].IsActive || result[0].HasVoted {
		t.Error("expected first voting to be active and not voted")
	}

	if !result[1].IsActive || !result[1].HasVoted {
		t.Error("expected second voting to be active and voted")
	}

	if result[2].IsActive || result[2].HasVoted {
		t.Error("expected third voting to be inactive and not voted")
	}
}
