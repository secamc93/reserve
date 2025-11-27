package usecasevotings

import (
	"context"
)

func (u *VotingsUseCase) DeactivateVoting(ctx context.Context, id uint) error {
	return u.repo.DeactivateVoting(ctx, id)
}
