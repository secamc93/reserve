package usecasevotings

import (
	"context"
)

func (u *VotingsUseCase) DeleteVoting(ctx context.Context, id uint) error {
	return u.repo.DeleteVoting(ctx, id)
}
