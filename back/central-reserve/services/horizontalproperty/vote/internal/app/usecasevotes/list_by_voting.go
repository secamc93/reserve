package usecasevotes

import (
	"context"

	"central_reserve/services/horizontalproperty/vote/internal/domain"
)

func (u *VotesUseCase) ListVotesByVoting(ctx context.Context, votingID uint) ([]domain.VoteDTO, error) {
	votes, err := u.repo.ListVotesByVoting(ctx, votingID)
	if err != nil {
		return nil, err
	}
	res := make([]domain.VoteDTO, len(votes))
	for i := range votes {
		v := votes[i]
		res[i] = domain.VoteDTO{
			ID:             v.ID,
			VotingID:       v.VotingID,
			PropertyUnitID: v.PropertyUnitID,
			VotingOptionID: v.VotingOptionID,
			VotedAt:        v.VotedAt,
			IPAddress:      v.IPAddress,
			UserAgent:      v.UserAgent,
			Notes:          v.Notes,
		}
	}
	return res, nil
}
