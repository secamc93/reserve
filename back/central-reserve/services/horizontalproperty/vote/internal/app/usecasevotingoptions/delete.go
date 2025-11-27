package usecasevotingoptions

import (
	"context"
)

func (u *VotingOptionsUseCase) DeleteVotingOption(ctx context.Context, id uint) error {
	return u.repo.DeleteVotingOption(ctx, id)
}
