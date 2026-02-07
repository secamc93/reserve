package usecasevotingoptions_test

import (
	"context"
	"errors"
	"testing"

	"central_reserve/services/horizontalproperty/vote/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/vote/internal/app/usecasevotingoptions"
	"central_reserve/services/horizontalproperty/vote/internal/domain"
)

// GetVotingOptionByID Tests

func TestGetVotingOptionByID_Success(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecasevotingoptions.New(mockRepo, mockCache, mockLogger)

	optionID := uint(1)
	expectedOption := &domain.VotingOption{
		ID:           optionID,
		VotingID:     10,
		OptionText:   "Sí",
		OptionCode:   "yes",
		Color:        "#00FF00",
		DisplayOrder: 1,
		IsActive:     true,
	}

	mockRepo.GetVotingOptionByIDFn = func(ctx context.Context, id uint) (*domain.VotingOption, error) {
		if id == optionID {
			return expectedOption, nil
		}
		return nil, errors.New("not found")
	}

	// Act
	result, err := useCase.GetVotingOptionByID(ctx, optionID)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result == nil {
		t.Fatal("expected result, got nil")
	}

	if result.ID != expectedOption.ID {
		t.Errorf("expected ID %d, got %d", expectedOption.ID, result.ID)
	}

	if result.OptionText != expectedOption.OptionText {
		t.Errorf("expected OptionText %s, got %s", expectedOption.OptionText, result.OptionText)
	}
}

func TestGetVotingOptionByID_NotFound(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecasevotingoptions.New(mockRepo, mockCache, mockLogger)

	optionID := uint(999)
	expectedErr := errors.New("voting option not found")

	mockRepo.GetVotingOptionByIDFn = func(ctx context.Context, id uint) (*domain.VotingOption, error) {
		return nil, expectedErr
	}

	// Act
	result, err := useCase.GetVotingOptionByID(ctx, optionID)

	// Assert
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}
}

// ListVotingOptionsByVoting Tests

func TestListVotingOptionsByVoting_Success(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecasevotingoptions.New(mockRepo, mockCache, mockLogger)

	votingID := uint(1)
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

	mockRepo.ListVotingOptionsByVotingFn = func(ctx context.Context, vID uint) ([]domain.VotingOption, error) {
		if vID == votingID {
			return expectedOptions, nil
		}
		return []domain.VotingOption{}, nil
	}

	// Act
	result, err := useCase.ListVotingOptionsByVoting(ctx, votingID)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if len(result) != len(expectedOptions) {
		t.Fatalf("expected %d options, got %d", len(expectedOptions), len(result))
	}

	for i, option := range result {
		if option.ID != expectedOptions[i].ID {
			t.Errorf("option %d: expected ID %d, got %d", i, expectedOptions[i].ID, option.ID)
		}
	}
}

func TestListVotingOptionsByVoting_EmptyResult(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecasevotingoptions.New(mockRepo, mockCache, mockLogger)

	votingID := uint(999)

	mockRepo.ListVotingOptionsByVotingFn = func(ctx context.Context, vID uint) ([]domain.VotingOption, error) {
		return []domain.VotingOption{}, nil
	}

	// Act
	result, err := useCase.ListVotingOptionsByVoting(ctx, votingID)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if len(result) != 0 {
		t.Errorf("expected empty result, got %d options", len(result))
	}
}

// UpdateVotingOptionStatus Tests

func TestUpdateVotingOptionStatus_Success(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecasevotingoptions.New(mockRepo, mockCache, mockLogger)

	optionID := uint(1)
	isActive := false

	expectedOption := &domain.VotingOption{
		ID:           optionID,
		VotingID:     10,
		OptionText:   "Sí",
		OptionCode:   "yes",
		Color:        "#00FF00",
		DisplayOrder: 1,
		IsActive:     isActive,
	}

	mockRepo.UpdateVotingOptionStatusFn = func(ctx context.Context, id uint, active bool) error {
		return nil
	}

	mockRepo.GetVotingOptionByIDFn = func(ctx context.Context, id uint) (*domain.VotingOption, error) {
		return expectedOption, nil
	}

	// Act
	result, err := useCase.UpdateVotingOptionStatus(ctx, optionID, isActive)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result == nil {
		t.Fatal("expected result, got nil")
	}

	if result.IsActive != isActive {
		t.Errorf("expected IsActive %v, got %v", isActive, result.IsActive)
	}
}

func TestUpdateVotingOptionStatus_RepositoryError(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecasevotingoptions.New(mockRepo, mockCache, mockLogger)

	optionID := uint(1)
	expectedErr := errors.New("database connection error")

	mockRepo.UpdateVotingOptionStatusFn = func(ctx context.Context, id uint, active bool) error {
		return expectedErr
	}

	// Act
	result, err := useCase.UpdateVotingOptionStatus(ctx, optionID, false)

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

// DeleteVotingOption Tests

func TestDeleteVotingOption_Success(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecasevotingoptions.New(mockRepo, mockCache, mockLogger)

	optionID := uint(1)
	var deletedID uint

	mockRepo.DeleteVotingOptionFn = func(ctx context.Context, id uint) error {
		deletedID = id
		return nil
	}

	// Act
	err := useCase.DeleteVotingOption(ctx, optionID)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if deletedID != optionID {
		t.Errorf("expected deleted ID %d, got %d", optionID, deletedID)
	}
}

func TestDeleteVotingOption_RepositoryError(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecasevotingoptions.New(mockRepo, mockCache, mockLogger)

	optionID := uint(1)
	expectedErr := errors.New("database connection error")

	mockRepo.DeleteVotingOptionFn = func(ctx context.Context, id uint) error {
		return expectedErr
	}

	// Act
	err := useCase.DeleteVotingOption(ctx, optionID)

	// Assert
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if !errors.Is(err, expectedErr) {
		t.Errorf("expected error %v, got %v", expectedErr, err)
	}
}
