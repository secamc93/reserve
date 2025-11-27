package usecasevotinggroups

import (
	"context"
)

func (u *VotingGroupUseCase) DeactivateVotingGroup(ctx context.Context, id uint) error {
	return u.repo.DeactivateVotingGroup(ctx, id)
}
