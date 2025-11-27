package usecasevotings

import (
	"context"

	"central_reserve/services/horizontalproperty/vote/internal/domain"
)

func (u *VotingsUseCase) UpdateVoting(ctx context.Context, id uint, dto domain.CreateVotingDTO) (*domain.VotingDTO, error) {
	entity := &domain.Voting{
		Title:              dto.Title,
		Description:        dto.Description,
		VotingType:         dto.VotingType,
		IsSecret:           dto.IsSecret,
		AllowAbstention:    dto.AllowAbstention,
		DisplayOrder:       dto.DisplayOrder,
		RequiredPercentage: dto.RequiredPercentage,
	}
	updated, err := u.repo.UpdateVoting(ctx, id, entity)
	if err != nil {
		return nil, err
	}
	return &domain.VotingDTO{
		ID:                 updated.ID,
		VotingGroupID:      updated.VotingGroupID,
		Title:              updated.Title,
		Description:        updated.Description,
		VotingType:         updated.VotingType,
		IsSecret:           updated.IsSecret,
		AllowAbstention:    updated.AllowAbstention,
		IsActive:           updated.IsActive,
		DisplayOrder:       updated.DisplayOrder,
		RequiredPercentage: updated.RequiredPercentage,
		CreatedAt:          updated.CreatedAt,
		UpdatedAt:          updated.UpdatedAt,
	}, nil
}
