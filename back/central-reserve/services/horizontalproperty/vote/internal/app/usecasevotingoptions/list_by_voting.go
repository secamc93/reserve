package usecasevotingoptions

import (
	"context"

	"central_reserve/services/horizontalproperty/vote/internal/domain"
)

func (u *VotingOptionsUseCase) ListVotingOptionsByVoting(ctx context.Context, votingID uint) ([]domain.VotingOptionDTO, error) {
	options, err := u.repo.ListVotingOptionsByVoting(ctx, votingID)
	if err != nil {
		return nil, err
	}
	res := make([]domain.VotingOptionDTO, len(options))
	for i := range options {
		o := options[i]
		res[i] = domain.VotingOptionDTO{
			ID:           o.ID,
			VotingID:     o.VotingID,
			OptionText:   o.OptionText,
			OptionCode:   o.OptionCode,
			Color:        o.Color,
			DisplayOrder: o.DisplayOrder,
			IsActive:     o.IsActive,
		}
	}
	return res, nil
}
