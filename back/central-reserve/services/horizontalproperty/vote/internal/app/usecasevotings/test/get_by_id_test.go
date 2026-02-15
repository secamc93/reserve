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

func TestGetVotingByID_Success(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecasevotings.New(mockRepo, mockCache, mockLogger)

	hpID := uint(10)
	groupID := uint(1)
	votingID := uint(100)

	expectedVoting := &domain.Voting{
		ID:              votingID,
		VotingGroupID:   groupID,
		Title:           "Aprobación de presupuesto",
		Description:     "Votación para aprobar el presupuesto anual",
		VotingType:      "simple",
		IsSecret:        false,
		AllowAbstention: true,
		IsActive:        true,
		DisplayOrder:    1,
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
	}

	expectedOptions := []domain.VotingOption{
		{
			ID:           1,
			VotingID:     votingID,
			OptionText:   "Sí",
			OptionCode:   "yes",
			Color:        "#00FF00",
			DisplayOrder: 1,
			IsActive:     true,
		},
		{
			ID:           2,
			VotingID:     votingID,
			OptionText:   "No",
			OptionCode:   "no",
			Color:        "#FF0000",
			DisplayOrder: 2,
			IsActive:     true,
		},
	}

	mockRepo.GetVotingByIDFn = func(ctx context.Context, id uint) (*domain.Voting, error) {
		if id == votingID {
			return expectedVoting, nil
		}
		return nil, errors.New("voting not found")
	}

	mockRepo.ListVotingOptionsByVotingFn = func(ctx context.Context, votingID uint) ([]domain.VotingOption, error) {
		return expectedOptions, nil
	}

	// Act
	result, err := useCase.GetVotingByID(ctx, hpID, groupID, votingID)

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

	if result.Title != expectedVoting.Title {
		t.Errorf("expected Title %s, got %s", expectedVoting.Title, result.Title)
	}

	if len(result.Options) != len(expectedOptions) {
		t.Errorf("expected %d options, got %d", len(expectedOptions), len(result.Options))
	}

	if len(result.Options) > 0 {
		if result.Options[0].OptionText != "Sí" {
			t.Errorf("expected first option text 'Sí', got %s", result.Options[0].OptionText)
		}
	}
}

func TestGetVotingByID_NotFound(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecasevotings.New(mockRepo, mockCache, mockLogger)

	hpID := uint(10)
	groupID := uint(1)
	votingID := uint(999) // No existe

	mockRepo.GetVotingByIDFn = func(ctx context.Context, id uint) (*domain.Voting, error) {
		return nil, errors.New("voting not found")
	}

	// Act
	result, err := useCase.GetVotingByID(ctx, hpID, groupID, votingID)

	// Assert
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}

	if err.Error() != "votación no encontrada" {
		t.Errorf("expected error 'votación no encontrada', got %v", err)
	}
}

func TestGetVotingByID_WrongGroup(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecasevotings.New(mockRepo, mockCache, mockLogger)

	hpID := uint(10)
	groupID := uint(1)     // Grupo esperado
	votingID := uint(100)

	wrongGroupVoting := &domain.Voting{
		ID:            votingID,
		VotingGroupID: 999, // Grupo diferente
		Title:         "Votación de otro grupo",
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}

	mockRepo.GetVotingByIDFn = func(ctx context.Context, id uint) (*domain.Voting, error) {
		return wrongGroupVoting, nil
	}

	// Act
	result, err := useCase.GetVotingByID(ctx, hpID, groupID, votingID)

	// Assert
	if err == nil {
		t.Fatal("expected error for wrong group, got nil")
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}

	if err.Error() != "votación no encontrada" {
		t.Errorf("expected error 'votación no encontrada', got %v", err)
	}
}

func TestGetVotingByID_ErrorGettingOptions(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecasevotings.New(mockRepo, mockCache, mockLogger)

	hpID := uint(10)
	groupID := uint(1)
	votingID := uint(100)

	expectedVoting := &domain.Voting{
		ID:            votingID,
		VotingGroupID: groupID,
		Title:         "Test Voting",
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}

	expectedErr := errors.New("database error getting options")

	mockRepo.GetVotingByIDFn = func(ctx context.Context, id uint) (*domain.Voting, error) {
		return expectedVoting, nil
	}

	mockRepo.ListVotingOptionsByVotingFn = func(ctx context.Context, votingID uint) ([]domain.VotingOption, error) {
		return nil, expectedErr
	}

	// Act
	result, err := useCase.GetVotingByID(ctx, hpID, groupID, votingID)

	// Assert
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}

	if err.Error() != "error obteniendo opciones de votación" {
		t.Errorf("expected error 'error obteniendo opciones de votación', got %v", err)
	}
}

func TestGetVotingByID_NoOptions(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecasevotings.New(mockRepo, mockCache, mockLogger)

	hpID := uint(10)
	groupID := uint(1)
	votingID := uint(100)

	expectedVoting := &domain.Voting{
		ID:            votingID,
		VotingGroupID: groupID,
		Title:         "Votación sin opciones",
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}

	mockRepo.GetVotingByIDFn = func(ctx context.Context, id uint) (*domain.Voting, error) {
		return expectedVoting, nil
	}

	mockRepo.ListVotingOptionsByVotingFn = func(ctx context.Context, votingID uint) ([]domain.VotingOption, error) {
		return []domain.VotingOption{}, nil // Sin opciones
	}

	// Act
	result, err := useCase.GetVotingByID(ctx, hpID, groupID, votingID)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result == nil {
		t.Fatal("expected result, got nil")
	}

	if len(result.Options) != 0 {
		t.Errorf("expected 0 options, got %d", len(result.Options))
	}
}
