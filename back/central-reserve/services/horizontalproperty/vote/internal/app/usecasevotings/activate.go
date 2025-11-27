package usecasevotings

import (
	"context"
)

func (u *VotingsUseCase) ActivateVoting(ctx context.Context, id uint) error {
	return u.repo.ActivateVoting(ctx, id)
}
