package usecasevotingoptions_test

import (
	"context"
	"errors"
	"testing"

	"central_reserve/services/horizontalproperty/vote/internal/app/test/mocks"
	"central_reserve/services/horizontalproperty/vote/internal/app/usecasevotingoptions"
	"central_reserve/services/horizontalproperty/vote/internal/domain"
)

func TestCreateVotingOption_Success(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecasevotingoptions.New(mockRepo, mockCache, mockLogger)

	dto := domain.CreateVotingOptionDTO{
		VotingID:     1,
		OptionText:   "Sí",
		OptionCode:   "yes",
		Color:        "#00FF00",
		DisplayOrder: 1,
	}

	expectedOption := &domain.VotingOption{
		ID:           1,
		VotingID:     dto.VotingID,
		OptionText:   dto.OptionText,
		OptionCode:   dto.OptionCode,
		Color:        dto.Color,
		DisplayOrder: dto.DisplayOrder,
		IsActive:     true,
	}

	mockRepo.CreateVotingOptionFn = func(ctx context.Context, option *domain.VotingOption) (*domain.VotingOption, error) {
		return expectedOption, nil
	}

	// Act
	result, err := useCase.CreateVotingOption(ctx, dto)

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

	if result.OptionText != dto.OptionText {
		t.Errorf("expected OptionText %s, got %s", dto.OptionText, result.OptionText)
	}

	if result.OptionCode != dto.OptionCode {
		t.Errorf("expected OptionCode %s, got %s", dto.OptionCode, result.OptionCode)
	}

	if !result.IsActive {
		t.Error("expected IsActive to be true")
	}
}

func TestCreateVotingOption_RepositoryError(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecasevotingoptions.New(mockRepo, mockCache, mockLogger)

	dto := domain.CreateVotingOptionDTO{
		VotingID:     1,
		OptionText:   "Sí",
		OptionCode:   "yes",
		Color:        "#00FF00",
		DisplayOrder: 1,
	}

	expectedErr := errors.New("database connection error")

	mockRepo.CreateVotingOptionFn = func(ctx context.Context, option *domain.VotingOption) (*domain.VotingOption, error) {
		return nil, expectedErr
	}

	// Act
	result, err := useCase.CreateVotingOption(ctx, dto)

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
