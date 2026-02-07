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

func TestCreateVotingGroup_Success(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecasevotinggroups.New(mockRepo, mockCache, mockLogger)

	quorum := 50.0
	userID := uint(123)
	dto := domain.CreateVotingGroupDTO{
		BusinessID:       1,
		Name:             "Asamblea General 2024",
		Description:      "Asamblea ordinaria anual",
		VotingStartDate:  time.Now(),
		VotingEndDate:    time.Now().Add(24 * time.Hour),
		RequiresQuorum:   true,
		QuorumPercentage: &quorum,
		CreatedByUserID:  &userID,
		Notes:            "Importante",
	}

	expectedGroup := &domain.VotingGroup{
		ID:               1,
		BusinessID:       dto.BusinessID,
		Name:             dto.Name,
		Description:      dto.Description,
		VotingStartDate:  dto.VotingStartDate,
		VotingEndDate:    dto.VotingEndDate,
		IsActive:         true,
		RequiresQuorum:   dto.RequiresQuorum,
		QuorumPercentage: dto.QuorumPercentage,
		CreatedByUserID:  dto.CreatedByUserID,
		Notes:            dto.Notes,
		CreatedAt:        time.Now(),
		UpdatedAt:        time.Now(),
	}

	mockRepo.CreateVotingGroupFn = func(ctx context.Context, group *domain.VotingGroup) (*domain.VotingGroup, error) {
		return expectedGroup, nil
	}

	// Act
	result, err := useCase.CreateVotingGroup(ctx, dto)

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
}

func TestCreateVotingGroup_RepositoryError(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecasevotinggroups.New(mockRepo, mockCache, mockLogger)

	quorum := 50.0
	dto := domain.CreateVotingGroupDTO{
		BusinessID:       1,
		Name:             "Asamblea General 2024",
		Description:      "Asamblea ordinaria anual",
		VotingStartDate:  time.Now(),
		VotingEndDate:    time.Now().Add(24 * time.Hour),
		RequiresQuorum:   true,
		QuorumPercentage: &quorum,
	}

	expectedErr := errors.New("database connection error")

	mockRepo.CreateVotingGroupFn = func(ctx context.Context, group *domain.VotingGroup) (*domain.VotingGroup, error) {
		return nil, expectedErr
	}

	// Act
	result, err := useCase.CreateVotingGroup(ctx, dto)

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

func TestCreateVotingGroup_MissingQuorumPercentage(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecasevotinggroups.New(mockRepo, mockCache, mockLogger)

	dto := domain.CreateVotingGroupDTO{
		BusinessID:       1,
		Name:             "Asamblea General 2024",
		Description:      "Asamblea ordinaria anual",
		VotingStartDate:  time.Now(),
		VotingEndDate:    time.Now().Add(24 * time.Hour),
		RequiresQuorum:   true,
		QuorumPercentage: nil, // Missing quorum percentage
	}

	// Act
	result, err := useCase.CreateVotingGroup(ctx, dto)

	// Assert
	if err == nil {
		t.Fatal("expected error for missing quorum percentage, got nil")
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}
}

func TestCreateVotingGroup_WithoutQuorumRequirement(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecasevotinggroups.New(mockRepo, mockCache, mockLogger)

	dto := domain.CreateVotingGroupDTO{
		BusinessID:       1,
		Name:             "Asamblea Sin Quorum",
		Description:      "No requiere quorum",
		VotingStartDate:  time.Now(),
		VotingEndDate:    time.Now().Add(24 * time.Hour),
		RequiresQuorum:   false,
		QuorumPercentage: nil,
	}

	expectedGroup := &domain.VotingGroup{
		ID:               2,
		BusinessID:       dto.BusinessID,
		Name:             dto.Name,
		Description:      dto.Description,
		VotingStartDate:  dto.VotingStartDate,
		VotingEndDate:    dto.VotingEndDate,
		IsActive:         true,
		RequiresQuorum:   false,
		QuorumPercentage: nil,
		CreatedAt:        time.Now(),
		UpdatedAt:        time.Now(),
	}

	mockRepo.CreateVotingGroupFn = func(ctx context.Context, group *domain.VotingGroup) (*domain.VotingGroup, error) {
		return expectedGroup, nil
	}

	// Act
	result, err := useCase.CreateVotingGroup(ctx, dto)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result == nil {
		t.Fatal("expected result, got nil")
	}

	if result.RequiresQuorum {
		t.Error("expected RequiresQuorum to be false")
	}

	if result.QuorumPercentage != nil {
		t.Error("expected QuorumPercentage to be nil")
	}
}
