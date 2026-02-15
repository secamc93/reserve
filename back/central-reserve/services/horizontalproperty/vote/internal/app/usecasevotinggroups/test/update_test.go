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

func TestUpdateVotingGroup_Success(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecasevotinggroups.New(mockRepo, mockCache, mockLogger)

	groupID := uint(1)
	quorum := 60.0
	dto := domain.CreateVotingGroupDTO{
		BusinessID:       1,
		Name:             "Asamblea General Actualizada",
		Description:      "Descripción actualizada",
		VotingStartDate:  time.Now(),
		VotingEndDate:    time.Now().Add(48 * time.Hour),
		RequiresQuorum:   true,
		QuorumPercentage: &quorum,
		Notes:            "Notas actualizadas",
	}

	expectedGroup := &domain.VotingGroup{
		ID:               groupID,
		BusinessID:       dto.BusinessID,
		Name:             dto.Name,
		Description:      dto.Description,
		VotingStartDate:  dto.VotingStartDate,
		VotingEndDate:    dto.VotingEndDate,
		IsActive:         true,
		RequiresQuorum:   dto.RequiresQuorum,
		QuorumPercentage: dto.QuorumPercentage,
		Notes:            dto.Notes,
		CreatedAt:        time.Now().Add(-24 * time.Hour),
		UpdatedAt:        time.Now(),
	}

	mockRepo.UpdateVotingGroupFn = func(ctx context.Context, id uint, group *domain.VotingGroup) (*domain.VotingGroup, error) {
		if id == groupID {
			return expectedGroup, nil
		}
		return nil, errors.New("not found")
	}

	// Act
	result, err := useCase.UpdateVotingGroup(ctx, groupID, dto)

	// Assert
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if result == nil {
		t.Fatal("expected result, got nil")
	}

	if result.ID != groupID {
		t.Errorf("expected ID %d, got %d", groupID, result.ID)
	}

	if result.Name != dto.Name {
		t.Errorf("expected Name %s, got %s", dto.Name, result.Name)
	}

	if result.Description != dto.Description {
		t.Errorf("expected Description %s, got %s", dto.Description, result.Description)
	}

	if result.Notes != dto.Notes {
		t.Errorf("expected Notes %s, got %s", dto.Notes, result.Notes)
	}
}

func TestUpdateVotingGroup_MissingQuorumPercentage(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecasevotinggroups.New(mockRepo, mockCache, mockLogger)

	groupID := uint(1)
	dto := domain.CreateVotingGroupDTO{
		BusinessID:       1,
		Name:             "Asamblea General",
		Description:      "Descripción",
		VotingStartDate:  time.Now(),
		VotingEndDate:    time.Now().Add(24 * time.Hour),
		RequiresQuorum:   true,
		QuorumPercentage: nil, // Missing quorum percentage
	}

	// Act
	result, err := useCase.UpdateVotingGroup(ctx, groupID, dto)

	// Assert
	if err == nil {
		t.Fatal("expected error for missing quorum percentage, got nil")
	}

	if result != nil {
		t.Errorf("expected nil result, got %v", result)
	}
}

func TestUpdateVotingGroup_RepositoryError(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecasevotinggroups.New(mockRepo, mockCache, mockLogger)

	groupID := uint(1)
	quorum := 50.0
	dto := domain.CreateVotingGroupDTO{
		BusinessID:       1,
		Name:             "Asamblea General",
		Description:      "Descripción",
		VotingStartDate:  time.Now(),
		VotingEndDate:    time.Now().Add(24 * time.Hour),
		RequiresQuorum:   true,
		QuorumPercentage: &quorum,
	}

	expectedErr := errors.New("database connection error")

	mockRepo.UpdateVotingGroupFn = func(ctx context.Context, id uint, group *domain.VotingGroup) (*domain.VotingGroup, error) {
		return nil, expectedErr
	}

	// Act
	result, err := useCase.UpdateVotingGroup(ctx, groupID, dto)

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

func TestUpdateVotingGroup_NotFound(t *testing.T) {
	// Arrange
	ctx := context.Background()
	mockRepo := mocks.NewMockVotingRepository()
	mockCache := mocks.NewMockVotingCacheService()
	mockLogger := mocks.NewMockLogger()

	useCase := usecasevotinggroups.New(mockRepo, mockCache, mockLogger)

	groupID := uint(999)
	quorum := 50.0
	dto := domain.CreateVotingGroupDTO{
		BusinessID:       1,
		Name:             "Asamblea General",
		Description:      "Descripción",
		VotingStartDate:  time.Now(),
		VotingEndDate:    time.Now().Add(24 * time.Hour),
		RequiresQuorum:   true,
		QuorumPercentage: &quorum,
	}

	expectedErr := errors.New("voting group not found")

	mockRepo.UpdateVotingGroupFn = func(ctx context.Context, id uint, group *domain.VotingGroup) (*domain.VotingGroup, error) {
		return nil, expectedErr
	}

	// Act
	result, err := useCase.UpdateVotingGroup(ctx, groupID, dto)

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
