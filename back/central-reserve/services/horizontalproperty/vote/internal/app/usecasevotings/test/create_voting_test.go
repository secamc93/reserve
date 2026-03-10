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

func TestCreateVoting_Success(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecasevotings.New(mockRepo, mockCache, mockLogger)

	requiredPercentage := 50.0
	dto := domain.CreateVotingDTO{
		VotingGroupID:      1,
		Title:              "Aprobación de presupuesto",
		Description:        "Votación para aprobar el presupuesto anual",
		VotingType:         "simple",
		IsSecret:           false,
		AllowAbstention:    true,
		DisplayOrder:       1,
		RequiredPercentage: &requiredPercentage,
	}

	expectedVoting := &domain.Voting{
		ID:                 1,
		VotingGroupID:      dto.VotingGroupID,
		Title:              dto.Title,
		Description:        dto.Description,
		VotingType:         dto.VotingType,
		IsSecret:           dto.IsSecret,
		AllowAbstention:    dto.AllowAbstention,
		IsActive:           true,
		DisplayOrder:       dto.DisplayOrder,
		RequiredPercentage: dto.RequiredPercentage,
		CreatedAt:          time.Now(),
		UpdatedAt:          time.Now(),
	}

	mockRepo.CreateVotingFn = func(ctx context.Context, voting *domain.Voting) (*domain.Voting, error) {
		return expectedVoting, nil
	}

	// Act
	result, err := useCase.CreateVoting(ctx, dto)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result == nil {
		t.Fatal("expected result, got nil")
	}

	if result.ID != expectedVoting.ID {
		t.Errorf("expected ID %d, got %d", expectedVoting.ID, result.ID)
	}

	if result.Title != expectedVoting.Title {
		t.Errorf("expected Title %s, got %s", expectedVoting.Title, result.Title)
	}

	if result.VotingGroupID != expectedVoting.VotingGroupID {
		t.Errorf("expected VotingGroupID %d, got %d", expectedVoting.VotingGroupID, result.VotingGroupID)
	}

	if !result.IsActive {
		t.Error("expected IsActive to be true")
	}
}

func TestCreateVoting_EmptyTitle(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecasevotings.New(mockRepo, mockCache, mockLogger)

	// DTO con título vacío
	dto := domain.CreateVotingDTO{
		VotingGroupID:   1,
		Title:           "", // Vacío
		Description:     "Test description",
		VotingType:      "simple",
		IsSecret:        false,
		AllowAbstention: true,
		DisplayOrder:    1,
	}

	// Mock: simular que el repositorio rechaza la votación sin título
	expectedErr := errors.New("title is required")
	mockRepo.CreateVotingFn = func(ctx context.Context, voting *domain.Voting) (*domain.Voting, error) {
		if voting.Title == "" {
			return nil, expectedErr
		}
		return voting, nil
	}

	// Act
	result, err := useCase.CreateVoting(ctx, dto)

	// Assert
	if err == nil {
		t.Fatal("expected error for empty title, got nil")
	}

	if result != nil {
		t.Errorf("expected nil result, got: %v", result)
	}
}

func TestCreateVoting_RepositoryError(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecasevotings.New(mockRepo, mockCache, mockLogger)

	requiredPercentage := 50.0
	dto := domain.CreateVotingDTO{
		VotingGroupID:      1,
		Title:              "Aprobación de presupuesto",
		Description:        "Votación para aprobar el presupuesto anual",
		VotingType:         "simple",
		IsSecret:           false,
		AllowAbstention:    true,
		DisplayOrder:       1,
		RequiredPercentage: &requiredPercentage,
	}

	expectedErr := errors.New("database connection error")

	mockRepo.CreateVotingFn = func(ctx context.Context, voting *domain.Voting) (*domain.Voting, error) {
		return nil, expectedErr
	}

	// Act
	result, err := useCase.CreateVoting(ctx, dto)

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

func TestCreateVoting_SecretVoting(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecasevotings.New(mockRepo, mockCache, mockLogger)

	dto := domain.CreateVotingDTO{
		VotingGroupID:   1,
		Title:           "Votación Secreta",
		Description:     "Votación con voto secreto",
		VotingType:      "secret",
		IsSecret:        true,
		AllowAbstention: false,
		DisplayOrder:    1,
	}

	expectedVoting := &domain.Voting{
		ID:              2,
		VotingGroupID:   dto.VotingGroupID,
		Title:           dto.Title,
		Description:     dto.Description,
		VotingType:      dto.VotingType,
		IsSecret:        true,
		AllowAbstention: false,
		IsActive:        true,
		DisplayOrder:    dto.DisplayOrder,
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
	}

	mockRepo.CreateVotingFn = func(ctx context.Context, voting *domain.Voting) (*domain.Voting, error) {
		return expectedVoting, nil
	}

	// Act
	result, err := useCase.CreateVoting(ctx, dto)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result == nil {
		t.Fatal("expected result, got nil")
	}

	if !result.IsSecret {
		t.Error("expected IsSecret to be true")
	}

	if result.AllowAbstention {
		t.Error("expected AllowAbstention to be false")
	}
}
