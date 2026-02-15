package usecaseresults_test

import (
	"context"
	"errors"
	"testing"

	"central_reserve/services/horizontalproperty/vote/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/vote/internal/app/usecaseresults"
	"central_reserve/services/horizontalproperty/vote/internal/domain"
)

func TestGetVotingResults_Success(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecaseresults.New(mockRepo, mockCache, mockLogger)

	votingID := uint(1)

	expectedResults := []domain.VotingResultDTO{
		{
			VotingOptionID: 1,
			OptionText:     "Sí",
			OptionCode:     "yes",
			Color:          "#00FF00",
			VoteCount:      15,
			Percentage:     60.0,
		},
		{
			VotingOptionID: 2,
			OptionText:     "No",
			OptionCode:     "no",
			Color:          "#FF0000",
			VoteCount:      10,
			Percentage:     40.0,
		},
	}

	mockRepo.GetVotingResultsFn = func(ctx context.Context, vID uint) ([]domain.VotingResultDTO, error) {
		if vID == votingID {
			return expectedResults, nil
		}
		return []domain.VotingResultDTO{}, nil
	}

	// Act
	result, err := useCase.GetVotingResults(ctx, votingID)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if len(result) != len(expectedResults) {
		t.Errorf("expected %d results, got %d", len(expectedResults), len(result))
	}

	if len(result) > 0 {
		if result[0].OptionText != "Sí" {
			t.Errorf("expected first option 'Sí', got %s", result[0].OptionText)
		}

		if result[0].VoteCount != 15 {
			t.Errorf("expected first option vote count 15, got %d", result[0].VoteCount)
		}

		if result[0].Percentage != 60.0 {
			t.Errorf("expected first option percentage 60.0, got %f", result[0].Percentage)
		}
	}
}

func TestGetVotingResults_NoVotes(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecaseresults.New(mockRepo, mockCache, mockLogger)

	votingID := uint(1)

	mockRepo.GetVotingResultsFn = func(ctx context.Context, vID uint) ([]domain.VotingResultDTO, error) {
		// Votación sin votos aún
		return []domain.VotingResultDTO{}, nil
	}

	// Act
	result, err := useCase.GetVotingResults(ctx, votingID)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if len(result) != 0 {
		t.Errorf("expected 0 results, got %d", len(result))
	}
}

func TestGetVotingResults_RepositoryError(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecaseresults.New(mockRepo, mockCache, mockLogger)

	votingID := uint(1)
	expectedErr := errors.New("database error")

	mockRepo.GetVotingResultsFn = func(ctx context.Context, vID uint) ([]domain.VotingResultDTO, error) {
		return nil, expectedErr
	}

	// Act
	result, err := useCase.GetVotingResults(ctx, votingID)

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

func TestGetVotingResults_WithAbstentions(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecaseresults.New(mockRepo, mockCache, mockLogger)

	votingID := uint(1)

	expectedResults := []domain.VotingResultDTO{
		{
			VotingOptionID: 1,
			OptionText:     "Sí",
			OptionCode:     "yes",
			Color:          "#00FF00",
			VoteCount:      10,
			Percentage:     50.0,
		},
		{
			VotingOptionID: 2,
			OptionText:     "No",
			OptionCode:     "no",
			Color:          "#FF0000",
			VoteCount:      5,
			Percentage:     25.0,
		},
		{
			VotingOptionID: 3,
			OptionText:     "Abstención",
			OptionCode:     "abstention",
			Color:          "#FFFF00",
			VoteCount:      5,
			Percentage:     25.0,
		},
	}

	mockRepo.GetVotingResultsFn = func(ctx context.Context, vID uint) ([]domain.VotingResultDTO, error) {
		return expectedResults, nil
	}

	// Act
	result, err := useCase.GetVotingResults(ctx, votingID)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if len(result) != 3 {
		t.Errorf("expected 3 results (including abstentions), got %d", len(result))
	}

	// Verificar que los porcentajes sumen 100%
	totalPercentage := 0.0
	for _, r := range result {
		totalPercentage += r.Percentage
	}

	if totalPercentage != 100.0 {
		t.Errorf("expected total percentage 100.0, got %f", totalPercentage)
	}
}

func TestGetVotingResults_MultipleOptions(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecaseresults.New(mockRepo, mockCache, mockLogger)

	votingID := uint(1)

	// Votación con múltiples candidatos
	expectedResults := []domain.VotingResultDTO{
		{VotingOptionID: 1, OptionText: "Candidato A", VoteCount: 20, Percentage: 40.0},
		{VotingOptionID: 2, OptionText: "Candidato B", VoteCount: 15, Percentage: 30.0},
		{VotingOptionID: 3, OptionText: "Candidato C", VoteCount: 10, Percentage: 20.0},
		{VotingOptionID: 4, OptionText: "Candidato D", VoteCount: 5, Percentage: 10.0},
	}

	mockRepo.GetVotingResultsFn = func(ctx context.Context, vID uint) ([]domain.VotingResultDTO, error) {
		return expectedResults, nil
	}

	// Act
	result, err := useCase.GetVotingResults(ctx, votingID)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if len(result) != 4 {
		t.Errorf("expected 4 results, got %d", len(result))
	}

	totalVotes := 0
	for _, r := range result {
		totalVotes += r.VoteCount
	}

	if totalVotes != 50 {
		t.Errorf("expected total votes 50, got %d", totalVotes)
	}
}
