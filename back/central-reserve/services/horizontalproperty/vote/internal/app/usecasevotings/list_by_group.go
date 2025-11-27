package usecasevotings

import (
	"context"

	"central_reserve/services/horizontalproperty/vote/internal/domain"
)

func (u *VotingsUseCase) ListVotingsByGroup(ctx context.Context, groupID uint) ([]domain.VotingDTO, error) {
	votings, err := u.repo.ListVotingsByGroup(ctx, groupID)
	if err != nil {
		return nil, err
	}
	res := make([]domain.VotingDTO, len(votings))
	for i := range votings {
		v := votings[i]
		res[i] = domain.VotingDTO{
			ID:                 v.ID,
			VotingGroupID:      v.VotingGroupID,
			Title:              v.Title,
			Description:        v.Description,
			VotingType:         v.VotingType,
			IsSecret:           v.IsSecret,
			AllowAbstention:    v.AllowAbstention,
			IsActive:           v.IsActive,
			DisplayOrder:       v.DisplayOrder,
			RequiredPercentage: v.RequiredPercentage,
			CreatedAt:          v.CreatedAt,
			UpdatedAt:          v.UpdatedAt,
		}
	}
	return res, nil
}
